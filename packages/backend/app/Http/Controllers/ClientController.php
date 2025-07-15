<?php

namespace App\Http\Controllers;

use App\Models\Client;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ClientController extends Controller
{
    public function index()
    {
        return response()->json(Client::all());
    }

    public function show($id)
    {
        $client = Client::where('utilisateur_id', $id)->first();

        if (!$client) {
            return response()->json(['message' => 'Client introuvable.'], 404);
        }

        return response()->json($client);
    }

    public function update(Request $request, $id)
    {
        $client = Client::where('utilisateur_id', $id)->first();

        if (!$client) {
            return response()->json(['message' => 'Client introuvable.'], 404);
        }

        $request->validate([
            'adresse' => 'nullable|string|max:255',
            'telephone' => 'nullable|string|max:20'
        ]);

        $client->update([
            'adresse' => $request->input('adresse', $client->adresse),
            'telephone' => $request->input('telephone', $client->telephone)
        ]);

        return response()->json(['message' => 'Client mis à jour.', 'client' => $client]);
    }
}