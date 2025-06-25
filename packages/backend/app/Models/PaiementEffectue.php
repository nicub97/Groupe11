<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PaiementEffectue extends Model
{
    public $timestamps = false;

    protected $table = 'paiements_effectues';

    protected $fillable = [
        'annonce_id',
        'utilisateur_id',
        'montant',
        'type_part',
        'created_at',
    ];

    public function annonce()
    {
        return $this->belongsTo(Annonce::class, 'annonce_id');
    }

    public function utilisateur()
    {
        return $this->belongsTo(Utilisateur::class, 'utilisateur_id');
    }
}
