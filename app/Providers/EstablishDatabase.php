<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Practice;
class EstablishDatabase extends ServiceProvider
{
    /**
     * Register services.
     *
     * @return void
     */
    public function register()
    {
        //
    }

    /**
     * Bootstrap services.
     *
     * @return void
     */
    public function boot()
    {
        $practice = Practice::getFromRequest(request());
        if ($practice) $practice->reconnectDB();
    }
}
