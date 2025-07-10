<?php

namespace App\Http\Controllers;

use App\Models\Livreur;
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

        $justificatifs = [];
        if ($livreur->piece_identite_document) {
            $justificatifs[] = [
                'type_document' => 'piece_identite',
                'chemin_fichier' => Storage::disk('public')->url($livreur->piece_identite_document),
                'created_at' => $livreur->updated_at,
            ];
        }

        if ($livreur->permis_conduire_document) {
            $justificatifs[] = [
                'type_document' => 'permis_conduire',
                'chemin_fichier' => Storage::disk('public')->url($livreur->permis_conduire_document),
                'created_at' => $livreur->updated_at,
            ];
        }

        return response()->json($justificatifs);
    }

    public function store(Request $request)
    {
        $user = Auth::user();
        if ($user->role !== 'livreur') {
            return response()->json(['message' => 'Accès interdit.'], 403);
        }

        $validated = $request->validate([
            'piece_identite_document' => 'nullable|file|mimes:jpg,png,pdf|max:2048',
            'permis_conduire_document' => 'nullable|file|mimes:jpg,png,pdf|max:2048',
        ]);

        $livreur = $user->livreur;

        if (isset($validated['piece_identite_document'])) {
            $path = $request->file('piece_identite_document')->store('documents/livreurs', 'public');
            if ($livreur->piece_identite_document) {
                Storage::disk('public')->delete($livreur->piece_identite_document);
            }
            $livreur->piece_identite_document = $path;
        }

        if (isset($validated['permis_conduire_document'])) {
            $path = $request->file('permis_conduire_document')->store('documents/livreurs', 'public');
            if ($livreur->permis_conduire_document) {
                Storage::disk('public')->delete($livreur->permis_conduire_document);
            }
            $livreur->permis_conduire_document = $path;
        }

        if ($livreur->statut === 'refuse') {
            $livreur->statut = 'en_attente';
            $livreur->motif_refus = null;
        }

        $livreur->save();

        return response()->json(['message' => 'Documents enregistrés.', 'livreur' => $livreur]);
    }

    public function destroy($type)
    {
        $user = Auth::user();
        if ($user->role !== 'livreur') {
            return response()->json(['message' => 'Accès interdit.'], 403);
        }

        $livreur = $user->livreur;

        if ($livreur->statut === 'valide') {
            return response()->json(['message' => 'Impossible de supprimer ce document.'], 422);
        }

        if ($type === 'piece_identite' && $livreur->piece_identite_document) {
            Storage::disk('public')->delete($livreur->piece_identite_document);
            $livreur->piece_identite_document = null;
        } elseif ($type === 'permis_conduire' && $livreur->permis_conduire_document) {
            Storage::disk('public')->delete($livreur->permis_conduire_document);
            $livreur->permis_conduire_document = null;
        } else {
            return response()->json(['message' => 'Document introuvable.'], 404);
        }

        $livreur->save();

        return response()->json(['message' => 'Document supprimé.']);
    }
}
