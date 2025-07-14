<?php

namespace App\Http\Controllers;

use App\Models\Livreur;
use App\Models\JustificatifLivreur;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class JustificatifLivreurController extends Controller
{
    public function index($id)
    {
        $user = Auth::user();
        if ($user->role !== 'admin' && $user->id !== (int) $id) {
            return response()->json(['message' => 'Accès interdit.'], 403);
        }

        $livreur = Livreur::where('utilisateur_id', $id)->first();
        if (! $livreur) {
            return response()->json(['message' => 'Livreur introuvable.'], 404);
        }

        return response()->json($livreur->justificatifs);
    }

    public function store(Request $request)
    {
        $user = Auth::user();
        if ($user->role !== 'livreur') {
            return response()->json(['message' => 'Accès interdit.'], 403);
        }

        $request->validate([
            'fichier' => 'required|file|mimes:pdf,jpg,jpeg,png|max:2048',
            'type_document' => 'nullable|string',
        ]);

        $livreur = $user->livreur;

        // Supprimer les justificatifs refusés existants
        $anciens = JustificatifLivreur::where('livreur_id', $livreur->id)
            ->where('statut', 'refuse')
            ->get();
        foreach ($anciens as $ancien) {
            Storage::disk('public')->delete($ancien->chemin);
            $ancien->delete();
        }

        $path = $request->file('fichier')->store("justificatifs/livreurs/{$livreur->id}", 'public');

        $justificatif = JustificatifLivreur::create([
            'livreur_id' => $livreur->id,
            'chemin' => $path,
            'type' => $request->input('type_document'),
            'statut' => 'en_attente',
        ]);

        if ($livreur->statut === 'refuse') {
            $livreur->statut = 'en_attente';
            $livreur->motif_refus = null;
            $livreur->save();
        }

        return response()->json($justificatif, 201);
    }

    public function destroy($id)
    {
        $user = Auth::user();
        $justificatif = JustificatifLivreur::find($id);
        if (! $justificatif) {
            return response()->json(['message' => 'Document introuvable.'], 404);
        }
        if ($user->role !== 'livreur' || $justificatif->livreur_id !== $user->livreur->id) {
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
