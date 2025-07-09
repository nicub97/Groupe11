<?php

namespace App\Http\Controllers;

use App\Models\Intervention;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use App\Notifications\NouvelleEvaluationNotification;

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
            Log::warning('Evaluation en double', [
                'intervention_id' => $intervention->id,
            ]);
            return response()->json(['message' => 'Évaluation déjà enregistrée.'], 422);
        }

        if ($intervention->prestation->statut !== 'terminée' || ! $intervention->prestation->is_paid) {
            Log::warning('Evaluation non autorisee', [
                'intervention_id' => $intervention->id,
            ]);
            return response()->json([
                'message' => 'La prestation doit être terminée et payée pour être évaluée.'
            ], 422);
        }

        $intervention->update([
            'note' => $validated['note'],
            'commentaire_client' => $validated['commentaire_client'] ?? null,
        ]);

        $prestataireUser = $intervention->prestation->prestataire->utilisateur ?? null;
        if ($prestataireUser) {
            $prestataireUser->notify(new NouvelleEvaluationNotification($intervention));
            Log::info('Notification nouvelle évaluation envoyée', ['prestataire_id' => $prestataireUser->id]);
        }

        Log::info('Évaluation enregistrée', [
            'intervention_id' => $intervention->id,
            'client_id' => $user->client->id ?? null,
        ]);

        return response()->json(['message' => 'Évaluation enregistrée.', 'evaluation' => $intervention]);
    }
}
