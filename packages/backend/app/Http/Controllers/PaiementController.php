<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Config;
use App\Models\Paiement;
use App\Models\Annonce;
use Stripe\StripeClient;

class PaiementController extends Controller
{
    public function index()
    {
        $utilisateur = Auth::user();

        $paiements = Paiement::where('utilisateur_id', $utilisateur->id)->get();

        return response()->json($paiements);
    }

    public function store(Request $request)
    {
        $utilisateur = Auth::user();

        $validated = $request->validate([
            'commande_id' => 'nullable|exists:commandes,id',
            'montant' => 'required|numeric|min:0',
            'sens' => 'required|in:credit,debit',
            'type' => 'required|in:stripe,portefeuille,virement,remboursement',
            'reference' => 'nullable|string|max:255'
        ]);

        $paiement = Paiement::create([
            'utilisateur_id' => $utilisateur->id,
            'commande_id' => $validated['commande_id'] ?? null,
            'montant' => $validated['montant'],
            'sens' => $validated['sens'],
            'type' => $validated['type'],
            'reference' => $validated['reference'] ?? null,
        ]);

        return response()->json([
            'message' => 'Paiement enregistré.',
            'paiement' => $paiement
        ], 201);
    }

    public function show($id)
    {
        $paiement = Paiement::find($id);

        if (! $paiement) {
            return response()->json(['message' => 'Paiement introuvable.'], 404);
        }

        return response()->json($paiement);
    }

    public function createCheckoutSession(Request $request)
    {
        $validated = $request->validate([
            'annonce_id' => 'nullable|integer|exists:annonces,id',
            'montant' => 'nullable|numeric|min:0',
            'type' => 'required|in:produit_livre,livraison_client',
            'context' => 'sometimes|in:reserver,payer',
        ]);

        $context = $validated['context'] ?? 'reserver';

        $annonce = null;
        if (isset($validated['annonce_id'])) {
            $annonce = Annonce::find($validated['annonce_id']);
        }

        if ($validated['type'] === 'livraison_client') {
            if (! $annonce || $annonce->id_livreur_reservant === null) {
                return response()->json([
                    'message' => "Aucun livreur n\xE2\x80\x99a encore accept\xC3\xA9 cette annonce",
                ], 403);
            }
        }

        if (isset($validated['montant'])) {
            $amount = (int) ($validated['montant'] * 100);
        } elseif ($annonce) {
            $amount = (int) ($annonce->prix_propose * 100);
        } else {
            $amount = 0;
        }

        $stripe = new StripeClient(Config::get('services.stripe.secret'));

        $session = $stripe->checkout->sessions->create([
            'payment_method_types' => ['card'],
            'mode' => 'payment',
            'line_items' => [[
                'price_data' => [
                    'currency' => 'eur',
                    'product_data' => ['name' => 'Paiement annonce'],
                    'unit_amount' => $amount,
                ],
                'quantity' => 1,
            ]],
            'success_url' => sprintf(
                '%s/paiement/success?session_id={CHECKOUT_SESSION_ID}&context=%s&annonce_id=%s',
                rtrim(env('FRONTEND_URL', ''), '/'),
                $context,
                $validated['annonce_id'] ?? ''
            ),
            'cancel_url' => rtrim(env('FRONTEND_URL', ''), '/') . '/paiement/cancel',
        ]);

        return response()->json(['checkout_url' => $session->url]);
    }
}