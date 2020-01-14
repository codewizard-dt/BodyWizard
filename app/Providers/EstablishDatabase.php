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
        if ($domain == 'localhost'){
            $practice = \App\Practice::find('body_wizard_medicine_8f935c6718b4402');
        }else{
            $practices = \App\Practice::where('host',$domain)->get();    
            if ($practices->count() > 0){
                $practice = $practices->first();
            }else{
                $practice = \App\Practice::find('body_wizard_medicine_8f935c6718b4402');
            }
        }
        if ($practice){
            $practice->reconnectDB();
        }
    }
}
