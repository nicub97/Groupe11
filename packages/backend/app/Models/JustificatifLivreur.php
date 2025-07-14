<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class JustificatifLivreur extends Model
{
    use HasFactory;

    protected $table = 'justificatifs_livreurs';

    protected $fillable = [
        'livreur_id',
        'chemin',
        'type',
        'statut',
    ];

    public function livreur()
    {
        return $this->belongsTo(Livreur::class);
    }
}
