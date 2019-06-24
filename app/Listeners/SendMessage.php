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
    public $gmail;
    /**
     * Create the event listener.
     *
     * @return void
     */
    public function __construct()
    {
        $this->gmail = app('GoogleGmail');
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
        $emailArr = [];
        foreach ($message->recipients as $recipient){
            array_push($emailArr,$recipient->email);
        }
        // Log::info($this->gmail);
        Mail::to('doctordeetz@gmail.com')->send(new StandardEmail($message));

        // try{
            // $client = $this->gmail;
            // $user = 'david@bodywizardmedicine.com';
            // // $result = $this->gmail->users_messages->listUsersMessages($user);
            // $msg = new \Google_Service_Gmail_Message();
            // $mime = "RnJvbTogSm9obiBEb2UgPHRpcmVuZ2FyZmlvQGdtYWlsLmVzPiANClRvOiBNYXJ5IFNtaXRoIDx0aXJlbmdhcmZpb0BnbWFpbC5jb20";
            // $msg->setRaw($mime);
            // $result = $this->gmail->users_messages->send($user,$msg);
            // Log::info($result);
        // }catch(\Exception $e){

        // }

    }
    public function failed(OutgoingMessage $event, $exception)
    {
        //
    }    
}
