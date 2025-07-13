<?php

namespace App\Providers;

use App\Models\Annonce;
use App\Policies\AnnoncePolicy;
use App\Models\Prestation;
use App\Policies\PrestationPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The policy mappings for the application.
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
        Annonce::class => AnnoncePolicy::class,
        Prestation::class => PrestationPolicy::class,
    ];

    public function boot(): void
    {
        $this->registerPolicies();
    }
}