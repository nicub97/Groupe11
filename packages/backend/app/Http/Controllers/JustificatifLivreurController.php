<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use App\Models\Utilisateur;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class JustificatifLivreurController extends Controller
{
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

        $admin = Utilisateur::where('role', 'admin')->first();
        if ($admin) {
            Notification::create([
                'utilisateur_id' => $admin->id,
                'titre' => 'Nouveau justificatif livreur',
                'contenu' => "Le livreur {$user->prenom} {$user->nom} a soumis de nouveaux documents.",
            ]);
        }

        return response()->json(['message' => 'Documents enregistrés.', 'livreur' => $livreur]);
    }
}
