<?php

namespace App\Policies;

use App\Models\Prestation;
use App\Models\Utilisateur;

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
        if ($user->role !== 'client') {
            return false;
        }

        if ($prestation->client_id) {
            return $prestation->client->utilisateur_id === $user->id;
        }

        return true;
    }
}
