<?php

namespace App\Http\Controllers;

use App\Models\Livreur;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class LivreurValidationController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        if ($user->role !== 'admin') {
            return response()->json(['message' => 'Accès interdit.'], 403);
        }

        $livreurs = Livreur::with('utilisateur')
            ->where('valide', false)
            ->get();

        return response()->json($livreurs);
    }

    public function valider($id)
    {
        $user = Auth::user();
        if ($user->role !== 'admin') {
            return response()->json(['message' => 'Accès interdit.'], 403);
        }

        $livreur = Livreur::where('utilisateur_id', $id)->first();
        if (! $livreur) {
            return response()->json(['message' => 'Livreur introuvable.'], 404);
        }

        $livreur->valide = true;
        $livreur->statut = 'valide';
        $livreur->motif_refus = null;
        $livreur->save();

        return response()->json(['message' => 'Livreur validé.']);
    }

    public function refuser(Request $request, $id)
    {
        $user = Auth::user();
        if ($user->role !== 'admin') {
            return response()->json(['message' => 'Accès interdit.'], 403);
        }

        $livreur = Livreur::where('utilisateur_id', $id)->first();
        if (! $livreur) {
            return response()->json(['message' => 'Livreur introuvable.'], 404);
        }

        $validated = $request->validate([
            'motif_refus' => 'nullable|string',
        ]);

        $livreur->valide = false;
        $livreur->statut = 'refuse';
        $livreur->motif_refus = $validated['motif_refus'] ?? null;
        $livreur->save();

        return response()->json(['message' => 'Livreur refusé.']);
    }
}
