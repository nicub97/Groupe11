<?php

namespace App\Services;

use App\Models\Facture;
use App\Models\Utilisateur;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Storage;

class FactureService
{
    public static function generer(Utilisateur $utilisateur, string $view, array $data, string $chemin, float $montant): Facture
    {
        if (!Storage::disk('public')->exists($chemin)) {
            $pdf = Pdf::loadView($view, $data);
            Storage::disk('public')->put($chemin, $pdf->output());
        }

        return Facture::firstOrCreate(
            [
                'utilisateur_id' => $utilisateur->id,
                'chemin_pdf' => $chemin,
            ],
            [
                'montant_total' => $montant,
                'date_emission' => now(),
            ]
        );
    }
}
