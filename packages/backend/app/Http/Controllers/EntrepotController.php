<?php

namespace App\Http\Controllers;

use App\Models\Entrepot;
use Illuminate\Http\Request;

class EntrepotController extends Controller
{
    public function index()
    {
        return response()->json(Entrepot::all());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nom' => 'required|string|max:255',
            'adresse' => 'required|string|max:255',
            'ville' => 'required|string|max:255',
            'code_postal' => 'required|string|max:20',
        ]);

        $entrepot = Entrepot::create($validated);

        return response()->json([
            'message' => 'Entrepôt créé avec succès.',
            'entrepot' => $entrepot
        ], 201);
    }

    public function show($id)
    {
        $entrepot = Entrepot::find($id);

        if (! $entrepot) {
            return response()->json(['message' => 'Entrepôt introuvable.'], 404);
        }

        return response()->json($entrepot);
    }

    public function update(Request $request, $id)
    {
        $entrepot = Entrepot::find($id);

        if (! $entrepot) {
            return response()->json(['message' => 'Entrepôt introuvable.'], 404);
        }

        $validated = $request->validate([
            'nom' => 'sometimes|string|max:255',
            'adresse' => 'sometimes|string|max:255',
            'ville' => 'sometimes|string|max:255',
            'code_postal' => 'sometimes|string|max:20',
        ]);

        $entrepot->update($validated);

        return response()->json([
            'message' => 'Entrepôt mis à jour.',
            'entrepot' => $entrepot
        ]);
    }

    public function destroy($id)
    {
        $entrepot = Entrepot::find($id);

        if (! $entrepot) {
            return response()->json(['message' => 'Entrepôt introuvable.'], 404);
        }

        $entrepot->delete();

        return response()->json(['message' => 'Entrepôt supprimé avec succès.']);
    }
}
