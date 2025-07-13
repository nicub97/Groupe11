<?php

namespace App\Services;

use App\Models\Annonce;
use App\Models\Paiement;
use App\Models\PaiementEffectue;

class PaiementService
{
    public static function paiementValide(int $annonceId, int $clientId): bool
    {
        return Paiement::where('annonce_id', $annonceId)
            ->where('utilisateur_id', $clientId)
            ->where('statut', 'valide')
            ->exists();
    }

    public static function distribuerPaiement(Annonce $annonce): void
    {
        if (PaiementEffectue::where('annonce_id', $annonce->id)->exists()) {
            return; // Paiement déjà réparti
        }

        $paiement = Paiement::where('annonce_id', $annonce->id)
            ->where('utilisateur_id', $annonce->id_client)
            ->where('statut', 'valide')
            ->first();

        if (! $paiement) {
            return;
        }

        $montant = (float) $paiement->montant;
        $livreurs = $annonce->etapesLivraison()
            ->whereNotNull('livreur_id')
            ->pluck('livreur_id')
            ->unique();

        if ($annonce->type === 'produit_livre') {
            $partCommercant = $montant * 0.5;
            $partLivreursTotal = $montant * 0.4;
        } else {
            $partCommercant = 0;
            $partLivreursTotal = $montant * 0.9;
        }

        $partEcoDeli = $montant - $partCommercant - $partLivreursTotal;

        if ($partCommercant > 0 && $annonce->id_commercant) {
            PaiementEffectue::create([
                'annonce_id' => $annonce->id,
                'utilisateur_id' => $annonce->id_commercant,
                'montant' => $partCommercant,
                'type_part' => 'commercant',
                'created_at' => now(),
            ]);
        }

        $countLivreurs = $livreurs->count();
        if ($countLivreurs > 0 && $partLivreursTotal > 0) {
            $share = $partLivreursTotal / $countLivreurs;
            foreach ($livreurs as $livreurId) {
                PaiementEffectue::create([
                    'annonce_id' => $annonce->id,
                    'utilisateur_id' => $livreurId,
                    'montant' => $share,
                    'type_part' => 'livreur',
                    'created_at' => now(),
                ]);
            }
        }

        if ($partEcoDeli > 0) {
            PaiementEffectue::create([
                'annonce_id' => $annonce->id,
                'utilisateur_id' => null,
                'montant' => $partEcoDeli,
                'type_part' => 'ecodeli',
                'created_at' => now(),
            ]);
        }
    }
}