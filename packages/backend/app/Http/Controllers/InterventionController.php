<?php

namespace App\Http\Controllers;

use App\Models\Intervention;
use App\Models\Prestation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class InterventionController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        $prestataireId = $user->role === 'prestataire' ? $user->prestataire?->id : null;
        $clientId = $user->role === 'client' ? $user->client?->id : null;

        $interventions = Intervention::with(['prestation.client', 'prestation.prestataire'])
            ->whereHas('prestation', function ($query) use ($user, $prestataireId, $clientId) {
                if ($user->role === 'prestataire') {
                    $query->where('prestataire_id', $prestataireId);
                } elseif ($user->role === 'client') {
                    $query->where('client_id', $clientId);
                }
            })->latest()->get();

        return response()->json($interventions);
    }

    public function store(Request $request)
    {
        $user = Auth::user();
        $prestataireId = $user->role === 'prestataire' ? $user->prestataire?->id : null;

        if ($user->role !== 'prestataire') {
            return response()->json(['message' => 'Seuls les prestataires peuvent valider une intervention.'], 403);
        }

        $validated = $request->validate([
            'prestation_id' => 'required|exists:prestations,id',
            'statut_final' => 'required|in:effectuée,non effectuée',
        ]);

        $prestation = Prestation::find($validated['prestation_id']);

        if ($prestation->prestataire_id !== $prestataireId) {
            return response()->json(['message' => 'Non autorisé.'], 403);
        }

        if ($prestation->statut !== 'acceptée' && $prestation->statut !== 'terminée') {
            return response()->json(['message' => 'Prestation non éligible.'], 400);
        }

        $intervention = Intervention::create([
            'prestation_id' => $prestation->id,
            'statut_final' => $validated['statut_final'],
        ]);

        // Mettre à jour le statut de la prestation
        $prestation->statut = 'terminée';
        $prestation->save();

        return response()->json(['message' => 'Intervention enregistrée.', 'intervention' => $intervention], 201);
    }

    public function update(Request $request, $id)
    {
        $intervention = Intervention::with('prestation')->find($id);
        $user = Auth::user();
        $clientId = $user->role === 'client' ? $user->client?->id : null;

        if (! $intervention) {
            return response()->json(['message' => 'Intervention introuvable.'], 404);
        }

        if ($user->role === 'client' && $intervention->prestation->client_id !== $clientId) {
            return response()->json(['message' => 'Non autorisé.'], 403);
        }

        $validated = $request->validate([
            'note' => 'nullable|integer|min:1|max:5',
            'commentaire_client' => 'nullable|string|max:1000',
        ]);

        $intervention->update($validated);

        return response()->json(['message' => 'Intervention mise à jour.', 'intervention' => $intervention]);
    }
}
