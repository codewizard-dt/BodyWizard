<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

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
        include_once app_path("/php/functions.php");
    }

    /**
     * Bootstrap services.
     *
     * @return void
     */
    public function boot()
    {
        //
        $domain = \Request::getHost();
        $practice = \App\Practice::where('host',$domain)->get()->first();
        if ($practice){
            $practice->reconnectDB();
        }
    }
}
