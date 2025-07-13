<?php

namespace App\Policies;

use App\Models\Annonce;
use App\Models\Utilisateur;

class AnnoncePolicy
{
    
    public function pay(Utilisateur $user, Annonce $annonce): bool
    {
        $authorized = (
            $annonce->id_client && $annonce->id_client === $user->id
        ) || (
            $annonce->id_commercant && $annonce->id_commercant === $user->id
        );

        if (! $authorized) {
            return false;
        }

        if (
            $annonce->type === 'livraison_client' &&
            $annonce->id_livreur_reservant === null
        ) {
            return false;
        }

        return true;
    }
}