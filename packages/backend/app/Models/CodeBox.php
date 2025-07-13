<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

use App\Models\Box;
use App\Models\EtapeLivraison;

class CodeBox extends Model
{
    protected $table = 'codes_box';

    protected $fillable = [
        'box_id',
        'etape_livraison_id',
        'type',
        'code_temporaire',
        'utilise',
        'mail_envoye_at',
    ];

    protected $casts = [
        'mail_envoye_at' => 'datetime',
    ];

    public function etapeLivraison()
    {
        return $this->belongsTo(EtapeLivraison::class);
    }

    public function box()
    {
        return $this->belongsTo(Box::class);
    }

    public static function createDepotCode(EtapeLivraison $etape, Box $box): self
    {
        $code = self::create([
            'box_id' => $box->id,
            'etape_livraison_id' => $etape->id,
            'type' => 'depot',
            'code_temporaire' => Str::random(6),
        ]);

        $box->est_occupe = true;
        $box->save();

        return $code;
    }
}