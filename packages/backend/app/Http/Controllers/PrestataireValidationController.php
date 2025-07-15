<?php

namespace App\Http\Controllers;

use App\Models\Prestataire;
use App\Models\JustificatifPrestataire;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class PrestataireValidationController extends Controller
{
    public function index($id)
    {
        $user = Auth::user();
        if ($user->role !== 'admin' && $user->id !== (int) $id) {
            return response()->json(['message' => 'Accès interdit.'], 403);
        }

        $prestataire = Prestataire::where('utilisateur_id', $id)->first();
        if (! $prestataire) {
            return response()->json(['message' => 'Prestataire introuvable.'], 404);
        }

        return response()->json($prestataire->justificatifs);
    }

    public function store(Request $request, $id)
    {
        $user = Auth::user();
        if ($user->role !== 'prestataire' || $user->id !== (int) $id) {
            return response()->json(['message' => 'Accès interdit.'], 403);
        }

        $request->validate([
            'fichier' => 'required|file|mimes:pdf,jpg,jpeg,png|max:2048',
        ]);

        $prestataire = $user->prestataire;
        $path = $request->file('fichier')->store(
            "justificatifs/prestataires/{$prestataire->id}",
            'public'
        );

        $justificatif = JustificatifPrestataire::create([
            'prestataire_id' => $prestataire->id,
            'chemin' => $path,
            'type' => $request->file('fichier')->getClientOriginalExtension(),
        ]);

        return response()->json(['message' => 'Justificatif enregistré.', 'justificatif' => $justificatif], 201);
    }

    public function valider($id)
    {
        $user = Auth::user();
        if ($user->role !== 'admin') {
            return response()->json(['message' => 'Accès interdit.'], 403);
        }

        $prestataire = Prestataire::where('utilisateur_id', $id)->first();
        if (! $prestataire) {
            return response()->json(['message' => 'Prestataire introuvable.'], 404);
        }

        if ($prestataire->justificatifs()->count() === 0) {
            return response()->json(['message' => 'Aucun justificatif fourni.'], 422);
        }

        $prestataire->valide = true;
        $prestataire->statut = 'valide';
        $prestataire->motif_refus = null;
        $prestataire->save();

        return response()->json(['message' => 'Prestataire validé.']);
    }

    public function refuser(Request $request, $id)
    {
        $user = Auth::user();
        if ($user->role !== 'admin') {
            return response()->json(['message' => 'Accès interdit.'], 403);
        }

        $prestataire = Prestataire::where('utilisateur_id', $id)->first();
        if (! $prestataire) {
            return response()->json(['message' => 'Prestataire introuvable.'], 404);
        }

        $validated = $request->validate([
            'motif_refus' => 'nullable|string',
        ]);

        $prestataire->valide = false;
        $prestataire->statut = 'refuse';
        $prestataire->motif_refus = $validated['motif_refus'] ?? null;
        $prestataire->save();

        foreach ($prestataire->justificatifs as $justificatif) {
            Storage::disk('public')->delete($justificatif->chemin);
            $justificatif->delete();
        }

        return response()->json(['message' => 'Prestataire refusé.']);
    }
}