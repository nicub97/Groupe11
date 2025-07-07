<?php

namespace App\Http\Controllers;

use App\Models\PlanningPrestataire;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PlanningPrestataireController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $prestataireId = $user->role === 'prestataire' ? $user->prestataire?->id : null;

        if ($user->role !== 'prestataire') {
            return response()->json(['message' => 'Accès réservé aux prestataires.'], 403);
        }

        return response()->json(
            PlanningPrestataire::where('prestataire_id', $prestataireId)
                ->orderBy('date_disponible')
                ->orderBy('heure_debut')
                ->get()
        );
    }

    public function store(Request $request)
    {
        $user = Auth::user();
        $prestataireId = $user->role === 'prestataire' ? $user->prestataire?->id : null;

        if ($user->role !== 'prestataire') {
            return response()->json(['message' => 'Seuls les prestataires peuvent ajouter un planning.'], 403);
        }

        $validated = $request->validate([
            'date_disponible' => 'required|date|after_or_equal:today',
            'heure_debut' => 'required|date_format:H:i',
            'heure_fin' => 'required|date_format:H:i|after:heure_debut',
        ]);

        $conflict = PlanningPrestataire::where('prestataire_id', $prestataireId)
            ->whereDate('date_disponible', $validated['date_disponible'])
            ->where('heure_debut', '<', $validated['heure_fin'])
            ->where('heure_fin', '>', $validated['heure_debut'])
            ->exists();

        if ($conflict) {
            return response()->json([
                'message' => 'Créneau en conflit avec un autre créneau existant.'
            ], 422);
        }

        $planning = PlanningPrestataire::create([
            'prestataire_id' => $prestataireId,
            ...$validated,
        ]);

        return response()->json(['message' => 'Créneau ajouté avec succès.', 'planning' => $planning], 201);
    }

    public function destroy($id)
    {
        $user = Auth::user();
        $prestataireId = $user->role === 'prestataire' ? $user->prestataire?->id : null;

        $planning = PlanningPrestataire::find($id);

        if (! $planning) {
            return response()->json(['message' => 'Créneau introuvable.'], 404);
        }

        if ($user->role === 'prestataire' && $planning->prestataire_id !== $prestataireId) {
            return response()->json(['message' => 'Suppression non autorisée.'], 403);
        }

        $planning->delete();

        return response()->json(['message' => 'Créneau supprimé.']);
    }
}
