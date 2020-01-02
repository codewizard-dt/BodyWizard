<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Notification;
use App\Message;
use App\Patient;
use App\User;
use App\Form;
use App\Events\BugReported;
use App\Notifications\NewRequiredForm;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     *
     * @return void
     */
    public function register()
    {
        //
    }

    /**
     * Bootstrap any application services.
     *
     * @return void
     */
    public function boot()
    {
        //
        // include_once app_path("/php/functions.php");
        Message::creating(function($model){$model->status = $model->defaultStatus();});
        Patient::created(function($model){
            try{
                $forms = Form::where('settings->required','!=','never')->get();
                if ($model->userInfo){
                    foreach($forms as $form){
                        Notification::send($model->userInfo, new NewRequiredForm($form));
                    }
                }
            }catch(\Exception $e){
                event(new BugReported(
                    [
                        'description' => "Patient::created event", 
                        'details' => $e, 
                        'category' => 'Patients', 
                        'location' => 'AppServiceProvider.php',
                        'user' => null
                    ]
                ));
            }
        });
    }
}
