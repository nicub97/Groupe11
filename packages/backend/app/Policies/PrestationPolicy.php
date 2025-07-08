<?php

namespace App\Policies;

use App\Models\Prestation;
use App\Models\Utilisateur;
use Illuminate\Support\Facades\Log;

class PrestationPolicy
{
    /**
     * Determine if the authenticated user can pay for the prestation.
     */
    public function pay(Utilisateur $user, Prestation $prestation): bool
    {
        if (! $prestation->client_id) {
            return false;
        }

        return $prestation->client->utilisateur_id === $user->id;
    }

    /**
     * Determine if the authenticated user can reserve the prestation.
     * The user must be a client and, if a client is already associated
     * to the prestation, it must be the same one.
     */
    public function reserver(Utilisateur $user, Prestation $prestation): bool
    {
        // The requester must be a client and the relation must exist
        if ($user->role !== 'client' || ! $user->client) {
            Log::debug('PrestationPolicy.reserver: user not client or missing relation', [
                'user_id' => $user->id,
                'role' => $user->role,
            ]);
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
                return false;
            }

            return $prestation->client->utilisateur_id === $user->id;
        }

        return true;
    }
}
