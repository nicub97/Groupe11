<?php

namespace App\Http\Controllers;

use App\Models\Prestation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Notification;
use App\Models\PlanningPrestataire;
use Carbon\Carbon;
use Stripe\StripeClient;
use Illuminate\Support\Facades\Log;

class PrestationController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        $prestations = Prestation::with([
            'client.utilisateur',
            'prestataire.utilisateur',
            'intervention',
        ])
            ->when($user->role === 'client', function ($query) use ($user) {
                $query->whereHas('client', function ($q) use ($user) {
                    $q->where('utilisateur_id', $user->id);
                });
            })
            ->when($user->role === 'prestataire', function ($query) use ($user) {
                $query->whereHas('prestataire', function ($q) use ($user) {
                    $q->where('utilisateur_id', $user->id);
                });
            })
            ->orderBy('date_heure', 'desc')
            ->get();

        return response()->json($prestations);
    }

    public function store(Request $request)
    {
        $user = Auth::user();

        if ($user->role !== 'prestataire') {
            return response()->json(['message' => 'Seuls les prestataires peuvent publier une prestation.'], 403);
        }

        $validated = $request->validate([
            'type_prestation' => 'required|string|max:255',
            'description' => 'nullable|string',
            'date_heure' => 'required|date|after:now',
            'duree_estimee' => 'nullable|integer|min:5',
            'tarif' => 'required|numeric|min:0',
        ]);

        $prestation = new Prestation($validated);
        $prestation->prestataire_id = $user->prestataire->id;
        $prestation->statut = 'disponible'; // visible par les clients
        $prestation->save();

        return response()->json([
            'message' => 'Prestation publiée avec succès.',
            'prestation' => $prestation
        ], 201);
    }


    public function show($id)
    {
        $prestation = Prestation::with(['client', 'prestataire', 'intervention'])->find($id);

        if (! $prestation) {
            return response()->json(['message' => 'Prestation introuvable.'], 404);
        }

        $user = Auth::user();
        $clientId      = $user->role === 'client' ? $user->client?->id : null;
        $prestataireId = $user->role === 'prestataire' ? $user->prestataire?->id : null;

        $authorized = false;

        if ($user->role === 'client') {
            $authorized = (
                ($prestation->client_id === null && $prestation->statut === 'disponible') ||
                $prestation->client_id === $clientId
            );
        } elseif ($user->role === 'prestataire') {
            $authorized = $prestation->prestataire_id === $prestataireId;
        }

        if (! $authorized) {
            return response()->json(['message' => 'Accès non autorisé.'], 403);
        }

        return response()->json($prestation);
    }

    public function update(Request $request, $id)
    {
        $prestation = Prestation::find($id);

        if (! $prestation) {
            return response()->json(['message' => 'Prestation introuvable.'], 404);
        }

        if ($prestation->statut !== 'en_attente') {
            return response()->json(['message' => 'Impossible de modifier une prestation non en attente.'], 403);
        }

        $user = Auth::user();
        $clientId = $user->role === 'client' ? $user->client?->id : null;

        if ($user->role !== 'admin' && $prestation->client_id !== $clientId) {
            return response()->json(['message' => 'Modification non autorisée.'], 403);
        }

        $validated = $request->validate([
            'type_prestation' => 'sometimes|string|max:255',
            'description' => 'sometimes|string|nullable',
            'date_heure' => 'sometimes|date|after:now',
            'duree_estimee' => 'sometimes|integer|min:5',
            'tarif' => 'sometimes|numeric|min:0',
        ]);

        $prestation->update($validated);

        return response()->json(['message' => 'Prestation mise à jour.', 'prestation' => $prestation]);
    }

    public function destroy($id)
    {
        $prestation = Prestation::find($id);

        if (! $prestation) {
            return response()->json(['message' => 'Prestation introuvable.'], 404);
        }

        $user = Auth::user();
        $clientId = $user->role === 'client' ? $user->client?->id : null;

        if ($user->role !== 'admin' && $prestation->client_id !== $clientId) {
            return response()->json(['message' => 'Suppression non autorisée.'], 403);
        }

        if ($prestation->statut !== 'en_attente') {
            return response()->json(['message' => 'Impossible de supprimer une prestation déjà validée ou refusée.'], 403);
        }

        $prestation->delete();

        return response()->json(['message' => 'Prestation supprimée avec succès.']);
    }

    public function changerStatut(Request $request, $id)
    {
        $user = auth()->user();
        $prestataireId = $user->role === 'prestataire' ? $user->prestataire?->id : null;

        $prestation = Prestation::with('prestataire')->find($id);

        if (! $prestation || $user->role !== 'prestataire' || $prestation->prestataire_id !== $prestataireId) {
            return response()->json(['message' => 'Non autorisé.'], 403);
        }

        $request->validate([
            'statut' => 'required|in:acceptée,refusée,terminée',
        ]);

        // ne pas modifier une prestation déjà refusée ou terminée
        if (in_array($prestation->statut, ['refusée', 'terminée'])) {
            return response()->json([
                'message' => 'Impossible de modifier une prestation finalisée.'
            ], 403);
        }

        $transitionsValides = [
            'en_attente' => ['acceptée', 'refusée'],
            'acceptée'   => ['terminée'],
        ];

        $statutActuel = $prestation->statut;
        $nouveauStatut = $request->input('statut');

        if (! isset($transitionsValides[$statutActuel]) ||
            ! in_array($nouveauStatut, $transitionsValides[$statutActuel])) {
            return response()->json([
                'message' => 'Transition de statut non autorisée.'
            ], 422);
        }

        $prestation->statut = $nouveauStatut;
        $prestation->save();

        // Créer notification pour le client (si la prestation a bien un client)
        if ($prestation->client_id) {
            Notification::create([
                'utilisateur_id' => $prestation->client->utilisateur_id ?? null,
                'titre' => 'Réponse à votre prestation',
                'contenu' => "Votre demande a été {$prestation->statut} par le prestataire.",
                'cible_type' => 'prestation',
                'cible_id' => $prestation->id,
            ]);
        }

        return response()->json(['message' => 'Statut mis à jour.', 'statut' => $prestation->statut]);
    }



    public function catalogue()
    {

        $prestations = Prestation::with(['prestataire.utilisateur'])
            ->whereNull('client_id')
            ->where('statut', 'disponible')
            ->orderBy('date_heure', 'asc')
            ->get();

        return response()->json($prestations);
    }

    public function assigner(Request $request, $id)
    {
        $request->validate([
            'prestataire_id' => 'required|exists:prestataires,id',
        ]);

        $prestation = Prestation::find($id);

        if (! $prestation) {
            return response()->json(['message' => 'Prestation introuvable.'], 404);
        }

        $prestataire = \App\Models\Prestataire::find($request->prestataire_id);
        if (! $prestataire->valide) {
            return response()->json(['message' => 'Prestataire non valide.'], 403);
        }

        $disponible = PlanningPrestataire::where('prestataire_id', $prestataire->id)
            ->whereDate('date_disponible', $prestation->date_heure)
            ->whereTime('heure_debut', '<=', $prestation->date_heure)
            ->whereTime('heure_fin', '>=', Carbon::parse($prestation->date_heure)->addMinutes($prestation->duree_estimee))
            ->exists();

        if (! $disponible) {
            return response()->json(['message' => "Le prestataire n'est pas disponible."], 422);
        }

        $prestation->prestataire_id = $prestataire->id;
        $prestation->save();

        return response()->json(['message' => 'Prestataire assigné.', 'prestation' => $prestation]);
    }

    public function payer(Request $request, Prestation $prestation)
    {
        $this->authorize('pay', $prestation);

        $stripe = new StripeClient(config('services.stripe.secret'));

        $session = $stripe->checkout->sessions->create([
            'payment_method_types' => ['card'],
            'mode' => 'payment',
            'line_items' => [[
                'price_data' => [
                    'currency' => 'eur',
                    'product_data' => ['name' => 'Paiement prestation'],
                    'unit_amount' => (int) ($prestation->tarif * 100),
                ],
                'quantity' => 1,
            ]],
            'success_url' => sprintf(
                '%s/paiement/success?session_id={CHECKOUT_SESSION_ID}&context=prestation_reserver&prestation_id=%s',
                rtrim(env('FRONTEND_URL', ''), '/'),
                $prestation->id
            ),
            'cancel_url' => rtrim(env('FRONTEND_URL', ''), '/') . '/paiement/cancel',
        ]);

        return response()->json(['checkout_url' => $session->url]);
    }

    public function paiementCallback(Request $request, Prestation $prestation)
    {
        $sessionId = $request->query('session_id');

        if (! $sessionId) {
            return response()->json(['message' => 'Session manquante.'], 400);
        }

        $stripe = new StripeClient(config('services.stripe.secret'));
        $session = $stripe->checkout->sessions->retrieve($sessionId);

        if ($session && $session->payment_status === 'paid') {
            if ($prestation->is_paid) {
                return response()->json(['message' => 'Paiement déjà confirmé.']);
            }

            $user = Auth::user();
            if (! $user->relationLoaded('client')) {
                $user->load('client');
            }

            $prestation->is_paid = true;

            if (! $prestation->client_id && $prestation->statut === 'disponible' && $user->client) {
                $prestation->client_id = $user->client->id;
                $prestation->statut = 'en_attente';
            }

            $prestation->save();

            Log::info('Prestation payée et réservée', [
                'prestation_id' => $prestation->id,
                'client_id' => $prestation->client_id,
            ]);
        }

        return response()->json(['message' => 'ok']);
    }

}
