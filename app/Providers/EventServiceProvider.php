<?php

namespace App\Providers;

use Illuminate\Support\Facades\Event;
use Illuminate\Auth\Events\Registered;
use Illuminate\Auth\Listeners\SendEmailVerificationNotification;
use Illuminate\Auth\Events\OutgoingMessage;
use Illuminate\Auth\Listeners\SendMessage;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;

class EventServiceProvider extends ServiceProvider
{
    /**
     * The event listener mappings for the application.
     *
     * @var array
     */
    protected $listen = [
        Registered::class => [
            SendEmailVerificationNotification::class,
        ],
        'App\Events\OutgoingMessage' => [
            'App\Listeners\SendMessage'
        ],
        'Illuminate\Mail\Events\MessageSent' => [
            'App\Listeners\LogSentMessage'
        ],
        'App\Events\AppointmentSaved' => [
            'App\Listeners\SendApptConfirmation'
        ],
        'App\Events\AppointmentCancelled' => [
            'App\Listeners\SendApptCancellation'
        ],
        'App\Events\BugReported' => [
            'App\Listeners\SendBugReport'
        ],
    ];

    /**
     * Register any events for your application.
     *
     * @return void
     */
    public function boot()
    {
        parent::boot();

        //
    }
}
