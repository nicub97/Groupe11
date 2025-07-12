<?php

namespace App\Http\Controllers;

use App\Models\Annonce;
use App\Models\Prestation;
use App\Http\Resources\AnnonceResource;
use App\Http\Resources\PrestationResource;

class PublicController extends Controller
{
    /**
     * List public annonces of type produit_livre.
     */
    public function listAnnonces()
    {
        $annonces = Annonce::with(['entrepotDepart', 'entrepotArrivee'])
            ->where('type', 'produit_livre')
            ->orderBy('created_at', 'desc')
            ->get();

        return AnnonceResource::collection($annonces);
    }

    /**
     * Show a specific public annonce.
     */
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

    /**
     * List public prestations available.
     */
    public function listPrestations()
    {
        $prestations = Prestation::where('statut', 'disponible')
            ->whereNull('client_id')
            ->orderBy('date_heure', 'asc')
            ->get();

        return PrestationResource::collection($prestations);
    }

    /**
     * Show a specific public prestation.
     */
    public function showPrestation($id)
    {
        $prestation = Prestation::where('statut', 'disponible')
            ->whereNull('client_id')
            ->find($id);

        if (! $prestation) {
            return response()->json(['message' => 'Prestation introuvable.'], 404);
        }

        return new PrestationResource($prestation);
    }
}
