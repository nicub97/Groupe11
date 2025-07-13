<?php

namespace App\Providers;

use App\Models\Entrepot;
use App\Observers\EntrepotObserver;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;

class EventServiceProvider extends ServiceProvider
{
    /**
     * The event listener mappings for the application.
     *
     * @var array<class-string, array<int, class-string>>
     */
    protected $listen = [
        //
    ];

    public function boot(): void
    {
        parent::boot();

        Entrepot::observe(EntrepotObserver::class);
    }
}