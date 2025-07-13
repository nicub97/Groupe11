<?php

namespace App\Http\Controllers;

use App\Models\Facture;
use App\Models\EtapeLivraison;
use App\Models\Annonce;
use App\Services\FactureService;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class FactureController extends Controller
{
    /**
     * Lister toutes les factures de l'utilisateur connecté.
     */
    public function index()
    {
        $factures = Facture::where('utilisateur_id', Auth::id())->get();

        return response()->json($factures);
    }

    /**
     * Créer une facture manuellement.
     */
    public function store(Request $request)
    {
        $request->validate([
            'montant_total' => 'required|numeric|min:0',
            'chemin_pdf' => 'required|string|max:255',
        ]);

        $facture = Facture::create([
            'utilisateur_id' => Auth::id(),
            'montant_total' => $request->montant_total,
            'chemin_pdf' => $request->chemin_pdf,
            'date_emission' => now()
        ]);

        return response()->json([
            'message' => 'Facture créée avec succès.',
            'facture' => $facture
        ], 201);
    }

    /**
     * Afficher une facture spécifique.
     */
    public function show($id)
    {
        $facture = Facture::where('utilisateur_id', Auth::id())->find($id);

        if (! $facture) {
            return response()->json(['message' => 'Facture introuvable.'], 404);
        }

        return response()->json($facture);
    }

    public function genererPourLivreur($id)
    {
        $user = Auth::user();
        $etape = EtapeLivraison::with('annonce')->findOrFail($id);

        if ($etape->livreur_id !== $user->id || $etape->statut !== 'terminee') {
            return response()->json(['message' => 'Non autorisé.'], 403);
        }

        $chemin = "factures/livreurs/{$etape->id}.pdf";

        $facture = FactureService::generer(
            $user,
            'factures.livreur',
            [
                'factureNumber' => $etape->id,
                'date' => now()->format('d/m/Y'),
                'livreur' => $user,
                'etape' => $etape,
                'montant' => (float) $etape->annonce->prix_propose,
            ],
            $chemin,
            (float) $etape->annonce->prix_propose
        );

        return response()->json(['url' => Storage::disk('public')->url($chemin)]);
    }

    public function genererPourCommercant($id)
    {
        $user = Auth::user();
        $annonce = Annonce::findOrFail($id);

        if ($annonce->id_commercant !== $user->id || ! $annonce->is_paid) {
            return response()->json(['message' => 'Non autorisé.'], 403);
        }

        $chemin = "factures/commercants/{$annonce->id}.pdf";

        FactureService::generer(
            $user,
            'factures.annonce',
            [
                'factureNumber' => $annonce->id,
                'date' => now()->format('d/m/Y'),
                'utilisateur' => $user,
                'annonce' => $annonce,
                'montant' => (float) $annonce->prix_propose,
                'role' => 'commercant',
            ],
            $chemin,
            (float) $annonce->prix_propose
        );

        return response()->json(['url' => Storage::disk('public')->url($chemin)]);
    }

    public function genererPourClient($id)
    {
        $user = Auth::user();
        $annonce = Annonce::findOrFail($id);

        if ($annonce->id_client !== $user->id || ! $annonce->is_paid) {
            return response()->json(['message' => 'Non autorisé.'], 403);
        }

        $chemin = "factures/clients/{$annonce->id}.pdf";

        FactureService::generer(
            $user,
            'factures.annonce',
            [
                'factureNumber' => $annonce->id,
                'date' => now()->format('d/m/Y'),
                'utilisateur' => $user,
                'annonce' => $annonce,
                'montant' => (float) $annonce->prix_propose,
                'role' => 'client',
            ],
            $chemin,
            (float) $annonce->prix_propose
        );

        return response()->json(['url' => Storage::disk('public')->url($chemin)]);
    }
}
