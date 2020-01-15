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
        if ($domain != 'localhost' && $domain != 'gae-dev-test-dot-bodywizard.appspot.com'){
            $practice = \App\Practice::where('host',$domain)->get()->first();
            if ($practice){
                $practice->reconnectDB();
            }            
        }
    }
}
