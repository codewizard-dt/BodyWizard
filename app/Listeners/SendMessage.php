<?php

namespace App\Listeners;

use App\Events\OutgoingMessage;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;


use App\Mail\StandardEmail;
use App\Message;
use App\User;

class SendMessage implements ShouldQueue
{

    /**
     * Create the event listener.
     *
     * @return void
     */
    public function __construct()
    {
        // $this->gmail = app('GoogleGmail');
    }

    /**
     * Handle the event.
     *
     * @param  NewMessage  $event
     * @return void
     */
    public function handle(OutgoingMessage $event)
    {
        //access message by $event->message
        $message = $event->message;
        Mail::to($message->recipient->email)->send(new StandardEmail($message));
    }

    public function failed(OutgoingMessage $event, $exception)
    {
        //
    }    
}
