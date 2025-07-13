<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Annonce extends Model
{
    use HasFactory;
    
    protected $appends = ['statut'];

    protected $fillable = [
        'type',
        'titre',
        'description',
        'prix_propose',
        'photo',
        'id_client',
        'id_commercant',
        'id_livreur_reservant',
        'entrepot_depart_id',
        'entrepot_arrivee_id',
        'is_paid',
    ];

    public function client()
    {
        return $this->belongsTo(Utilisateur::class, 'id_client');
    }

    public function commercant()
    {
        return $this->belongsTo(Utilisateur::class, 'id_commercant');
    }

    public function livreurReservant()
    {
        return $this->belongsTo(Utilisateur::class, 'id_livreur_reservant');
    }

    public function commandes()
    {
        return $this->hasMany(Commande::class, 'annonce_id');
    }

    public function etapesLivraison()
    {
        return $this->hasMany(EtapeLivraison::class, 'annonce_id');
    }

    public function entrepotDepart()
    {
        return $this->belongsTo(Entrepot::class, 'entrepot_depart_id');
    }

    public function entrepotArrivee()
    {
        return $this->belongsTo(Entrepot::class, 'entrepot_arrivee_id');
    }

    public function getStatutAttribute()
    {
        $etapes = $this->etapesLivraison;

        if ($etapes->isEmpty()) {
            return 'en_attente';
        }

        if ($etapes->contains('statut', 'en_cours')) {
            return 'en_cours';
        }

        // Vérifier si toutes les étapes sont "terminee"
        $toutesTerminees = $etapes->every(fn($e) => $e->statut === 'terminee');

        // Vérifier si l'une des étapes termine à la destination finale
        $destinationFinaleAtteinte = $etapes->contains(function ($e) {
            return $e->lieu_arrivee === $this->entrepotArrivee->ville && $e->statut === 'terminee';
        });

        if ($toutesTerminees && $destinationFinaleAtteinte) {
            return 'livree';
        }

        return 'en_attente';
    }

}