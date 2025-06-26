<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EtapeLivraison extends Model
{
    use HasFactory;

    protected $table = 'etapes_livraison';

    protected $fillable = [
        'annonce_id',
        'livreur_id',
        'lieu_depart',
        'lieu_arrivee',
        'statut',
        'est_client',
        'est_commercant',
    ];

    protected $casts = [
        'est_client' => 'boolean',
        'est_commercant' => 'boolean',
    ];

    public function annonce()
    {
        return $this->belongsTo(Annonce::class);
    }

    public function livreur()
    {
        return $this->belongsTo(Utilisateur::class, 'livreur_id');
    }

    public function codes()
    {
        return $this->hasMany(CodeBox::class, 'etape_livraison_id');
    }

    /**
     * Détermine si le retrait peut être validé pour cette étape.
     * Il ne doit exister aucune étape précédente de la même annonce
     * créée pour le client ou le commerçant qui n'est pas encore terminée.
     */
    public function peutRetirer(): bool
    {
        return !self::where('annonce_id', $this->annonce_id)
            ->where(function ($q) {
                $q->where('est_client', true)->orWhere('est_commercant', true);
            })
            ->where('statut', '!=', 'terminee')
            ->where('created_at', '<', $this->created_at)
            ->exists();
    }
}
