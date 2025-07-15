<?php

namespace App\Policies;

use App\Models\Prestation;
use App\Models\Utilisateur;
use Illuminate\Support\Facades\Log;

class PrestationPolicy
{
    public function pay(Utilisateur $user, Prestation $prestation): bool
    {
        if (! $user->relationLoaded('client')) {
            $user->load('client');
        }

        if ($user->role !== 'client' || ! $user->client) {
            return false;
        }

        // Autoriser le paiement uniquement si la prestation est disponible lorsque aucun client n'est encore associé
        if ($prestation->client_id === null) {
            return $prestation->statut === 'disponible';
        }

        if (! $prestation->relationLoaded('client')) {
            $prestation->load('client');
        }

        return $prestation->client->utilisateur_id === $user->id;
    }


    public function reserver(Utilisateur $user, Prestation $prestation): bool
    {
        if (! $user->relationLoaded('client')) {
            $user->load('client');
        }

        Log::info('PrestationPolicy.reserver start', [
            'user_id' => $user->id,
            'role' => $user->role,
            'has_client' => (bool) $user->client,
            'prestation_id' => $prestation->id,
            'prestation_client_id' => $prestation->client_id,
        ]);

        // The requester must be a client and the relation must exist
        if ($user->role !== 'client' || ! $user->client) {
            if (! $user->client) {
                $freshUser = Utilisateur::with('client')->find($user->id);
                Log::debug('PrestationPolicy.reserver: client relation missing', [
                    'user_id' => $user->id,
                    'role' => $user->role,
                    'fresh_user' => $freshUser,
                ]);
            } else {
                Log::debug('PrestationPolicy.reserver: user role not client', [
                    'user_id' => $user->id,
                    'role' => $user->role,
                ]);
            }
            Log::info('PrestationPolicy.reserver result', ['allowed' => false]);
            return false;
        }

        // If a client_id is already set on the prestation,
        // ensure the relation exists and matches the current user
        if ($prestation->client_id !== null) {
            if (! $prestation->relationLoaded('client')) {
                $prestation->load('client');
            }

            if (! $prestation->client) {
                // client_id present but relation missing -> inconsistent
                Log::debug('PrestationPolicy.reserver: client relation missing', [
                    'prestation_id' => $prestation->id,
                    'client_id' => $prestation->client_id,
                ]);
                Log::info('PrestationPolicy.reserver result', ['allowed' => false]);
                return false;
            }

            $allowed = $prestation->client->utilisateur_id === $user->id;
            Log::info('PrestationPolicy.reserver result', ['allowed' => $allowed]);
            return $allowed;
        }

        Log::info('PrestationPolicy.reserver result', ['allowed' => true]);
        return true;
    }
}