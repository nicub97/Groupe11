<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class JustificatifPrestataire extends Model
{
    use HasFactory;

    protected $table = 'justificatifs_prestataires';

    protected $fillable = [
        'prestataire_id',
        'chemin',
        'type',
        'statut',
    ];

    public function prestataire()
    {
        return $this->belongsTo(Prestataire::class);
    }
}