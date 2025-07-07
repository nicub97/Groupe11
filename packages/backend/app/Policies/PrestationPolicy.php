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
}
