<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class AnnonceResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array<string, mixed>
     */
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'titre' => $this->titre,
            'description' => $this->description,
            'prix_propose' => $this->prix_propose,
            'photo' => $this->photo,
            'type' => $this->type,
            'entrepot_depart' => $this->entrepotDepart?->ville,
            'entrepot_arrivee' => $this->entrepotArrivee?->ville,
            'created_at' => $this->created_at,
        ];
    }
}
