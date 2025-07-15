<?php

namespace App\Services;

use App\Models\Annonce;
use App\Models\EtapeLivraison;
use App\Models\TrajetLivreur;
use App\Models\CodeBox;
use App\Models\Entrepot;
use App\Models\Utilisateur;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class LivraisonService
{
    public static function creerNouvelleEtapeDepuisDepotIntermediaire(Annonce $annonce, Utilisateur $livreur): ?EtapeLivraison
    {
        if (!$annonce->is_paid) {
            return null;
        }

        $enCours = $annonce->etapesLivraison()
            ->where('est_mini_etape', false)
            ->where('statut', '!=', 'terminee')
            ->exists();
        if ($enCours) {
            return null;
        }

        $lastStep = $annonce->etapesLivraison()
            ->where('est_mini_etape', false)
            ->where('statut', 'terminee')
            ->orderByDesc('created_at')
            ->first();

        if (!$lastStep) {
            return null;
        }

        if ($annonce->entrepotArrivee && strcasecmp(trim($lastStep->lieu_arrivee), trim($annonce->entrepotArrivee->ville)) === 0) {
            return null;
        }

        $trajet = TrajetLivreur::with(['entrepotDepart', 'entrepotArrivee'])
            ->where('livreur_id', $livreur->id)
            ->get()
            ->first(function ($t) use ($lastStep) {
                return $t->entrepotDepart && strcasecmp(trim($t->entrepotDepart->ville), trim($lastStep->lieu_arrivee)) === 0;
            });

        if (!$trajet || !$trajet->entrepotArrivee) {
            return null;
        }

        $boxDepart = $lastStep->codes->first(fn($c) => $c->type === 'depot')?->box;
        $boxArrivee = $trajet->entrepotArrivee->boxes()->where('est_occupe', false);
        if ($boxDepart) {
            $boxArrivee = $boxArrivee->where('id', '!=', $boxDepart->id);
        }
        $boxArrivee = $boxArrivee->first();

        if (!$boxDepart || !$boxArrivee) {
            return null;
        }

        return DB::transaction(function () use ($annonce, $livreur, $trajet, $lastStep, $boxDepart, $boxArrivee) {
            $etape = EtapeLivraison::create([
                'annonce_id' => $annonce->id,
                'livreur_id' => $livreur->id,
                'lieu_depart' => $lastStep->lieu_arrivee,
                'lieu_arrivee' => $trajet->entrepotArrivee->ville,
                'statut' => 'en_cours',
                'est_client' => false,
                'est_commercant' => false,
                'est_mini_etape' => false,
            ]);

            CodeBox::create([
                'box_id' => $boxDepart->id,
                'etape_livraison_id' => $etape->id,
                'type' => 'retrait',
                'code_temporaire' => Str::random(6),
            ]);

            CodeBox::create([
                'box_id' => $boxArrivee->id,
                'etape_livraison_id' => $etape->id,
                'type' => 'depot',
                'code_temporaire' => Str::random(6),
            ]);

            $boxArrivee->est_occupe = true;
            $boxArrivee->save();

            return $etape;
        });
    }
}