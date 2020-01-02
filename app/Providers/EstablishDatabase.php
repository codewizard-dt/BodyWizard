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
        $domain = \Request::getHost();
        $port = \Request::getPort();
        if ($domain != "localhost" && isset(practiceConfig('domains')[$domain])){
            $practiceId = practiceConfig("domains")[$domain];
            if (is_array($practiceId)){
                $practiceId = practiceConfig("domains")[$domain][$port];
            }
            $dbname = practiceConfig('practices')[$practiceId]['app']['database'];
            config(['database.connections.mysql.database' => $dbname]);
            \DB::reconnect();
        }
    }

    /**
     * Bootstrap services.
     *
     * @return void
     */
    public function boot()
    {
        //
    }
}
