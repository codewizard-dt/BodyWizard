<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\Eloquent\Model;
use App\Message;
use App\Patient;
use App\Practice;
use App\User;
use App\Invoice;
use App\ChartNote;
use App\Form;
use App\Appointment;
use App\Events\BugReported;
use App\Events\AppointmentSaved;
use App\Notifications\NewRequiredForm;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\Log;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     *
     * @return void
     */
    public function register()
    {
        include_once app_path("/php/functions.php");
    }

    /**
     * Bootstrap any application services.
     *
     * @return void
     */
    public function boot()
    {
        \Stripe\Stripe::setApiKey('sk_test_VO8cEI3MbKfcxeHOLlpjBOfa009mq5Zrze');
        // ELOQUENT MODEL EVENTS
            Message::creating(function($model){$model->status = $model->defaultStatus();});
            Patient::created(function($model){
                try{
                    $forms = Form::where('settings->require_at_registration',true)->get();
                    if ($model->userInfo){
                        foreach($forms as $form){
                            Notification::send($model->userInfo, new NewRequiredForm($form));
                        }
                    }
                }catch(\Exception $e){
                    reportError($e,'AppServiceProvider 50');
                }
            });
            Appointment::deleting(function($model){
                $model->removeFromGoogleCal();
                $model->removeFromFullCal();
            });
            Appointment::saved(function($model){
                // try{
                //     $method = request()->method();
                //     $model->saveToGoogleCal($method);
                //     $model->saveToFullCal();
                //     $lastChange = DB::table('appointments_audit')->where('affected_record',$model->id)->orderBy('changed_at','desc')->first();
                //     $changes = $lastChange ? json_decode($lastChange->changes,true) : null;
                //     $practice = Practice::getFromSession();
                //     event(new AppointmentSaved($model, $changes, $practice->practice_id, Auth::user()->user_type));
                // }catch(\Exception $e){
                //     reportError($e,'AppServiceProvider 69');
                // }
            });
            ChartNote::saved(function($model){
                if ($model->appointment) $model->appointment->saveToFullCal();
                setUid('Appointment',$model->appointment->id);
            });
            User::created(function($model){
                $practice = Practice::getFromSession();
                $options = [
                    'name' => $model->name,
                    'metadata' => 
                    [
                        'practice_id' => $practice->practice_id
                    ]
                ];
                $stripeCustomer = $model->createAsStripeCustomer($options);
            });
            Invoice::saving(function($model){
                Log::info("\nSAVING");
                Log::info($model->notes);
            });
            Invoice::saved(function($model){
                Log::info("\nSAVED");
                Log::info($model->notes);
            });
    }
}
