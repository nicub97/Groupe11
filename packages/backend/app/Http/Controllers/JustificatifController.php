<?php

namespace App\Http\Controllers;

use App\Models\JustificatifPrestataire;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class JustificatifController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $prestataire = $user->prestataire;

        if (! $prestataire) {
            return response()->json([], 404);
        }

        return response()->json($prestataire->justificatifs);
    }

    public function store(Request $request)
    {
        $user = Auth::user();
        $prestataire = $user->prestataire;

        if (! $prestataire) {
            return response()->json(['message' => 'Accès interdit.'], 403);
        }

        $request->validate([
            'fichier' => 'required|file|mimes:pdf,jpg,jpeg,png|max:2048',
            'type_document' => 'nullable|string',
        ]);

        $anciens = JustificatifPrestataire::where('prestataire_id', $prestataire->id)
            ->where('statut', 'refuse')
            ->get();

        foreach ($anciens as $ancien) {
            Storage::disk('public')->delete($ancien->chemin);
            $ancien->delete();
        }

        $path = $request->file('fichier')->store(
            "justificatifs/prestataires/{$prestataire->id}",
            'public'
        );

        $justificatif = JustificatifPrestataire::create([
            'prestataire_id' => $prestataire->id,
            'chemin' => $path,
            'type' => $request->input('type_document'),
            'statut' => 'en_attente',
        ]);

        if ($prestataire->statut === 'refuse') {
            $prestataire->statut = 'en_attente';
            $prestataire->motif_refus = null;
            $prestataire->save();
        }

        return response()->json($justificatif, 201);
    }

    public function destroy($id)
    {
        $user = Auth::user();
        $prestataire = $user->prestataire;
        $justificatif = JustificatifPrestataire::find($id);

        if (! $prestataire || ! $justificatif || $justificatif->prestataire_id !== $prestataire->id) {
            return response()->json(['message' => 'Accès interdit.'], 403);
        }

        if (! in_array($justificatif->statut, ['en_attente', 'refuse'])) {
            return response()->json(['message' => 'Impossible de supprimer ce document.'], 422);
        }

        Storage::disk('public')->delete($justificatif->chemin);
        $justificatif->delete();

        return response()->json(['message' => 'Document supprimé.']);
    }
}