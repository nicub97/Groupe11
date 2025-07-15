<?php

namespace App\Services;

use App\Models\Entrepot;
use Illuminate\Support\Str;

class BoxService
{
    public static function createDefaultBoxes(Entrepot $entrepot): void
    {
        $boxes = [];

        for ($i = 1; $i <= 5; $i++) {
            $boxes[] = [
                'code_box' => 'BOX-' . Str::slug($entrepot->ville) . '-' . $i,
                'est_occupe' => false,
            ];
        }

        $entrepot->boxes()->createMany($boxes);
    }
}