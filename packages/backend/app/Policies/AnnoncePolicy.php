<?php

namespace App\Policies;

use App\Models\Annonce;
use App\Models\Utilisateur;

class AnnoncePolicy
{
    /**
     * Determine whether the user can pay for the given annonce.
     */
    public function pay(Utilisateur $user, Annonce $annonce): bool
    {
        return (
            $annonce->id_client && $annonce->id_client === $user->id
        ) || (
            $annonce->id_commercant && $annonce->id_commercant === $user->id
        );
    }
}
