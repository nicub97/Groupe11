<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class PrestationResource extends JsonResource
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
            'type_prestation' => $this->type_prestation,
            'description' => $this->description,
            'date_heure' => $this->date_heure,
            'duree_estimee' => $this->duree_estimee,
            'tarif' => $this->tarif,
        ];
    }
}
