<?php

namespace App\Http\Controllers;

use App\Models\Annonce;
use App\Models\Client;
use App\Models\Commercant;
use App\Models\Livreur;
use App\Models\Prestataire;
use App\Models\Prestation;
use App\Models\Commande; // pour les prestations
use App\Models\EtapeLivraison;

class StatAdminController extends Controller
{
    public function index()
    {
        return response()->json([
            'annonces' => Annonce::count(),
            'clients' => Client::count(),
            'commercants' => Commercant::count(),
            'prestataires' => Prestataire::count(),
            'livreurs' => Livreur::count(),
            'prestations' => Prestation::count(),
            'etapes_livraison' => EtapeLivraison::count(),
        ]);
    }
}