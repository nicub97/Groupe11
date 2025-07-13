<?php

namespace App\Observers;

use App\Models\Entrepot;
use App\Services\BoxService;

class EntrepotObserver
{
    /**
     * Handle the Entrepot "created" event.
     */
    public function created(Entrepot $entrepot): void
    {
        BoxService::createDefaultBoxes($entrepot);
    }
}