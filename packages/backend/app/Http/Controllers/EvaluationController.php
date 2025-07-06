<?php

namespace App\Http\Controllers;

use App\Models\Intervention;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class EvaluationController extends Controller
{
    public function index()
    {
        $evaluations = Intervention::with('prestation.prestataire.utilisateur')
            ->whereNotNull('note')
            ->latest()
            ->get();

        return response()->json($evaluations);
    }

    public function showByCible($utilisateur_id)
    {
        $evaluations = Intervention::with('prestation.prestataire.utilisateur')
            ->whereHas('prestation.prestataire', function ($q) use ($utilisateur_id) {
                $q->where('utilisateur_id', $utilisateur_id);
            })
            ->whereNotNull('note')
            ->latest()
            ->get();

        return response()->json($evaluations);
    }

    public function show($id)
    {
        $evaluation = Intervention::with('prestation.prestataire.utilisateur')
            ->whereNotNull('note')
            ->find($id);

        if (! $evaluation) {
            return response()->json(['message' => 'Évaluation introuvable.'], 404);
        }

        return response()->json($evaluation);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'intervention_id' => 'required|exists:interventions,id',
            'note' => 'required|integer|min:1|max:5',
            'commentaire_client' => 'nullable|string',
        ]);

        $intervention = Intervention::with('prestation')->find($validated['intervention_id']);
        $user = Auth::user();

        if ($user->role !== 'client' || $intervention->prestation->client_id !== ($user->client->id ?? null)) {
            return response()->json(['message' => 'Accès interdit.'], 403);
        }

        if ($intervention->note !== null) {
            return response()->json(['message' => 'Évaluation déjà enregistrée.'], 422);
        }

        $intervention->update([
            'note' => $validated['note'],
            'commentaire_client' => $validated['commentaire_client'] ?? null,
        ]);

        return response()->json(['message' => 'Évaluation enregistrée.', 'evaluation' => $intervention]);
    }
}
