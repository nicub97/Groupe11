<?php

namespace App\Http\Controllers;

use App\Models\Annonce;
use App\Models\Prestation;
use App\Http\Resources\AnnonceResource;
use App\Http\Resources\PrestationResource;

class PublicController extends Controller
{
    public function listAnnonces()
    {
        $annonces = Annonce::with(['entrepotDepart', 'entrepotArrivee'])
            ->where('type', 'produit_livre')
            ->orderBy('created_at', 'desc')
            ->get();

        return AnnonceResource::collection($annonces);
    }

    public function showAnnonce($id)
    {
        $annonce = Annonce::with(['entrepotDepart', 'entrepotArrivee'])
            ->where('type', 'produit_livre')
            ->find($id);

        if (! $annonce) {
            return response()->json(['message' => 'Annonce introuvable.'], 404);
        }

        return new AnnonceResource($annonce);
    }

    public function listPrestations()
    {
        $prestations = Prestation::with('intervention')
            ->whereNull('client_id')
            ->where('statut', 'disponible')
            ->orderBy('date_heure', 'asc')
            ->get();

        return PrestationResource::collection($prestations);
    }

    public function showPrestation($id)
    {
        $prestation = Prestation::with('intervention')->find($id);

        if (! $prestation) {
            return response()->json(['message' => 'Prestation introuvable.'], 404);
        }

        return new PrestationResource($prestation);
    }
}
