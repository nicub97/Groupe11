<?php

namespace App\Http\Controllers;

use App\Models\TrajetLivreur;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TrajetLivreurController extends Controller
{
    // Lister les trajets du livreur connecté
    public function index()
    {
        $user = Auth::user();
        $trajets = TrajetLivreur::where('livreur_id', $user->id)
            ->with(['entrepotDepart', 'entrepotArrivee'])
            ->get();

        return response()->json($trajets);
    }

    // Ajouter un trajet
    public function store(Request $request)
    {
        $user = Auth::user();

        $validated = $request->validate([
            'entrepot_depart_id' => 'required|exists:entrepots,id',
            'entrepot_arrivee_id' => 'required|exists:entrepots,id|different:entrepot_depart_id',
            'disponible_du' => 'nullable|date',
            'disponible_au' => 'nullable|date|after_or_equal:disponible_du',
        ]);

        abort_if(
            $validated['entrepot_depart_id'] == $validated['entrepot_arrivee_id'],
            422,
            "L'entrepôt d'arrivée doit être différent de l'entrepôt de départ."
        );

        $trajet = TrajetLivreur::create([
            'livreur_id' => $user->id,
            ...$validated
        ]);

        return response()->json(['message' => 'Trajet enregistré.', 'trajet' => $trajet]);
    }

    // Supprimer un trajet
    public function destroy($id)
    {
        $trajet = TrajetLivreur::findOrFail($id);

        if ($trajet->livreur_id !== Auth::id()) {
            return response()->json(['message' => 'Non autorisé.'], 403);
        }

        $trajet->delete();

        return response()->json(['message' => 'Trajet supprimé.']);
    }
}