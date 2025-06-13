<?php

namespace App\Http\Controllers;

use App\Models\Utilisateur;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class UtilisateurController extends Controller
{
    /**
     * Lister tous les utilisateurs.
     */
    public function index()
    {
        return response()->json(Utilisateur::all());
    }

    /**
     * Créer un nouvel utilisateur (réservé à l'administrateur).
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nom' => ['required', 'string', 'max:32', 'regex:/^[\pL\s\-]+$/u'],
            'prenom' => ['required', 'string', 'max:32', 'regex:/^[\pL\s\-]+$/u'],
            'email' => 'required|email:rfc,dns|max:255|unique:utilisateurs,email',
            'password' => [
                'required',
                'string',
                'min:8',
                'max:32',
                'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/'
            ],
            'role' => 'required|in:client,commercant,prestataire,livreur,admin',
            'pays' => 'nullable|string',
            'telephone' => 'nullable|string',
            'adresse_postale' => 'nullable|string',
        ], [
            'password.regex' => 'Le mot de passe doit contenir une majuscule, une minuscule, un chiffre et un caractère spécial.',
            'email.unique' => 'Cet email est déjà utilisé.',
            'nom.regex' => 'Le nom ne peut contenir que des lettres, des espaces et des tirets.',
            'prenom.regex' => 'Le prénom ne peut contenir que des lettres, des espaces et des tirets.',
        ]);

        $utilisateur = Utilisateur::create([
            'nom' => $validated['nom'],
            'prenom' => $validated['prenom'],
            'email' => strtolower($validated['email']),
            'password' => $validated['password'], // hashé via mutator
            'role' => $validated['role'],
            'pays' => $validated['pays'] ?? null,
            'telephone' => $validated['telephone'] ?? null,
            'adresse_postale' => $validated['adresse_postale'] ?? null,
        ]);

        return response()->json([
            'message' => 'Utilisateur créé avec succès.',
            'utilisateur' => $utilisateur
        ], 201);
    }


    /**
     * Afficher un utilisateur spécifique.
     */
    public function show($id)
    {
        $utilisateur = Utilisateur::find($id);

        if (! $utilisateur) {
            return response()->json(['message' => 'Utilisateur introuvable.'], 404);
        }

        return response()->json($utilisateur);
    }

    /**
     * Modifier un utilisateur.
     */
    public function update(Request $request, $id)
    {
        $utilisateur = Utilisateur::find($id);

        if (! $utilisateur) {
            return response()->json(['message' => 'Utilisateur introuvable.'], 404);
        }

        $auth = auth()->user();

        if ($auth->role !== 'admin' && $auth->id !== $utilisateur->id) {
            return response()->json(['message' => 'Action non autorisée.'], 403);
        }

        $validated = $request->validate([
            'nom' => ['sometimes', 'string', 'max:32', 'regex:/^[\pL\s\-]+$/u'],
            'prenom' => ['sometimes', 'string', 'max:32', 'regex:/^[\pL\s\-]+$/u'],
            'email' => [
                'sometimes',
                'email',
                'max:255',
                Rule::unique('utilisateurs')->ignore($utilisateur->id)
            ],
            'pays' => ['nullable', 'string'],
            'telephone' => ['nullable', 'string'],
            'adresse_postale' => ['nullable', 'string'],
            'password' => [
                'sometimes',
                'string',
                'min:8',
                'max:32',
                'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/'
            ],
        ], [
            'password.regex' => 'Le mot de passe doit contenir une majuscule, une minuscule, un chiffre et un caractère spécial.',
            'email.unique' => 'Cet email est déjà utilisé.',
            'nom.regex' => 'Le nom ne peut contenir que des lettres, des espaces et des tirets.',
            'prenom.regex' => 'Le prénom ne peut contenir que des lettres, des espaces et des tirets.',
        ]);

        $utilisateur->update($validated);

        return response()->json([
            'message' => 'Utilisateur mis à jour avec succès.',
            'utilisateur' => $utilisateur
        ]);
    }

    /**
     * Supprimer un utilisateur.
     */
    public function destroy($id)
    {
        $utilisateur = Utilisateur::find($id);

        if (! $utilisateur) {
            return response()->json(['message' => 'Utilisateur introuvable.'], 404);
        }

        $auth = auth()->user();

        if ($auth->role !== 'admin' && $auth->id !== $utilisateur->id) {
            return response()->json(['message' => 'Action non autorisée.'], 403);
        }

        $utilisateur->delete();

        return response()->json(['message' => 'Utilisateur supprimé avec succès.']);
    }
}

