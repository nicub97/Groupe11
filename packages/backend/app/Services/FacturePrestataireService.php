<?php

namespace App\Services;

use App\Models\FacturePrestataire;
use App\Models\Intervention;
use App\Models\Prestataire;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class FacturePrestataireService
{
    public static function genererPourPrestataire(Prestataire $prestataire, string $mois): ?FacturePrestataire
    {
        if (FacturePrestataire::where('prestataire_id', $prestataire->id)->where('mois', $mois)->exists()) {
            return null;
        }

        $interventions = Intervention::with('prestation')
            ->whereHas('prestation', function ($query) use ($mois, $prestataire) {
                $query->where('prestataire_id', $prestataire->id)
                    ->whereMonth('date_heure', substr($mois, 5, 2))
                    ->whereYear('date_heure', substr($mois, 0, 4))
                    ->where('statut', 'terminée')
                    ->where('is_paid', true);
            })
            ->get();

        if ($interventions->isEmpty()) {
            return null;
        }

        $total = $interventions->sum(fn($i) => $i->prestation->tarif);

        $pdf = Pdf::loadView('factures.prestataire', [
            'interventions' => $interventions,
            'mois' => $mois,
            'total' => $total,
            'prestataire' => $prestataire->utilisateur,
        ]);

        $chemin = "factures/prestataire_{$prestataire->id}_{$mois}.pdf";
        Storage::disk('public')->put($chemin, $pdf->output());

        $facture = FacturePrestataire::create([
            'prestataire_id' => $prestataire->id,
            'mois' => $mois,
            'montant_total' => $total,
            'chemin_pdf' => $chemin,
        ]);

        Log::info('Facture générée', [
            'facture_id' => $facture->id,
            'prestataire_id' => $prestataire->id,
        ]);

        return $facture;
    }
}
