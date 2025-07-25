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
        'est_mini_etape',
    ];

    protected $casts = [
        'est_client' => 'boolean',
        'est_commercant' => 'boolean',
        'est_mini_etape' => 'boolean',
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
