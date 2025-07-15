<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class AnnonceResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'type' => $this->type,
            'titre' => $this->titre,
            'description' => $this->description,
            'prix_propose' => $this->prix_propose,
            'photo' => $this->photo,
            'entrepot_depart' => $this->whenLoaded('entrepotDepart'),
            'entrepot_arrivee' => $this->whenLoaded('entrepotArrivee'),
            'statut' => $this->statut,
            'created_at' => $this->created_at,
        ];
    }
}
