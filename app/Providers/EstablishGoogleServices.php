<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Google\ApiCore\ApiException;
use Google\Cloud\Kms\V1\CryptoKey;
use Google\Cloud\Kms\V1\CryptoKey\CryptoKeyPurpose;
use Google\Cloud\Kms\V1\KeyManagementServiceClient;
use Google\Cloud\Kms\V1\KeyRing;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;


class EstablishGoogleServices extends ServiceProvider
{
    /**
     * Register services.
     *
     * @return void
     */
    public function register()
    {
        app()->singleton('GoogleClient',function(){
            $key = config('google')['key_file_location'];
            $client = new \Google_Client();
            $client->setApplicationName("BodyWizardEHR");
            $client->setAuthConfig($key);
            return $client;
        });
        app()->singleton('GoogleCalendar',function(){
            $client = app('GoogleClient');
            $client->addScope("https://www.googleapis.com/auth/calendar");
            $calendar = new \Google_Service_Calendar($client);
            return $calendar;
        });
        app()->singleton('GoogleKMS',function(){
            $client = app('GoogleClient');
            $client->addScope("https://www.googleapis.com/auth/cloudkms");
            $auth = json_decode(Storage::disk('local')->get('google/full-admin-key.json'),true);
            $kms = new KeyManagementServiceClient([
                'credentials' => $auth
            ]);
            return $kms;
        });
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
