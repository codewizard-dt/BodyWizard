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
        $domain = \Request::getHost();
        $port = \Request::getPort();
        if ($domain != "localhost" && isset(config('domains')[$domain])){
            $practiceId = config("domains")[$domain];
            if (is_array($practiceId)){
                $practiceId = config("domains")[$domain][$port];
            }
            $dbname = config('practices')[$practiceId]['app']['database'];
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
