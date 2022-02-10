<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\Eloquent\Model;
use App\Message;
use App\Patient;
use App\Practitioner;
use App\StaffMember;
use App\Practice;
use App\User;
use App\Invoice;
use App\ChartNote;
use App\Form;
use App\Appointment;
use Illuminate\Support\Facades\View;

use App\Events\BugReported;
use App\Events\AppointmentSaved;
use App\Notifications\NewRequiredForm;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\Log;

class AppServiceProvider extends ServiceProvider
{
    public function register()
    {
        include_once app_path("/php/functions.php");
    }

    public function boot()
    {
        // \Stripe\Stripe::setApiKey('sk_test_VO8cEI3MbKfcxeHOLlpjBOfa009mq5Zrze');
        Appointment::observe(\App\Observers\AppointmentObserver::class);
        User::observe(\App\Observers\UserObserver::class);
        Patient::observe(\App\Observers\PatientObserver::class);
        Practitioner::observe(\App\Observers\PractitionerObserver::class);
        StaffMember::observe(\App\Observers\StaffMemberObserver::class);
        ChartNote::observe(\App\Observers\ChartNoteObserver::class);
        Invoice::observe(\App\Observers\InvoiceObserver::class);
        Form::observe(\App\Observers\FormObserver::class);

        $practice = Practice::first();
        View::share('practice', $practice);
        $this->app->singleton(Practice::class, function () use ($practice) {
            return $practice;
        });

    }
}
