<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Prestataire;
use App\Services\FacturePrestataireService;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class GeneratePrestataireInvoices extends Command
{
    protected $signature = 'prestataires:generate-invoices';

    protected $description = 'Generate monthly invoices for all prestataires';

    public function handle(): int
    {
        $mois = Carbon::now()->subMonth()->format('Y-m');

        foreach (Prestataire::where('valide', true)->get() as $prestataire) {
            try {
                FacturePrestataireService::genererPourPrestataire($prestataire, $mois);
            } catch (\Throwable $e) {
                Log::error('Erreur facture prestataire '.$prestataire->id.' : '.$e->getMessage());
            }
        }

        return Command::SUCCESS;
    }
}