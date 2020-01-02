<?php

namespace App\Listeners;

use App\Template;
use App\Message;
use App\Events\AppointmentCancelled;
use App\Events\OutgoingMessage;
use App\Events\BugReported;
use Illuminate\Support\Facades\Notification;
use App\Notifications\CancelledAppointment;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class SendApptCancellation
{
    // public $appointment;
    /**
     * Create the event listener.
     *
     * @return void
     */
    public function __construct()
    {
        //
    }

    /**
     * Handle the event.
     *
     * @param  AppointmentCancelled  $event
     * @return void
     */
    public function handle(AppointmentCancelled $event)
    {
        $appt = $event->appointment;
        $practiceId = $event->practiceId;
        $cancelledBy = $event->cancelledBy;
        $request = $event->request;
        $sendEmail = $request->send_email;
        $template = Template::where('name','like','%Appointment Cancel%')->first();
        $changes = null;

        $patients = $appt->patients;
        foreach ($patients as $patient){
            $settings = $patient->settings;
            $msg = new Message;
            $msg->recipient_id = $patient->userInfo->id;
            $msg->message_id = uuid();
            $msg->type = 'Email';
            $msg->status = $msg->defaultStatus();
            $msg->message = $template->markup;
            $msg->subject = $template->subject;
            if (!$msg->replaceMacros($changes, $appt, $patient)){
                event(new BugReported(
                    [
                        'description' => "Unmatched Macro", 
                        'details' => ['template'=>$template->id, 'message'=>$msg->message, 'message id'=>$msg->message_id], 
                        'category' => 'Messages', 
                        'location' => 'SendApptCancellation.php',
                        'user' => null
                    ]
                ));
            }
            
            try{
                $msg->save();
                $users = ($cancelledBy == 'patient') ? $appt->practitioner->userInfo : $appt->patient_user_models;
                Notification::send($users, new CancelledAppointment($appt));
                
                // event(new OutgoingMessage($msg, $practiceId));
            }
            catch(\Exception $e){
                event(new BugReported(
                    [
                        'description' => "Saving and Sending Msgs", 
                        'details' => $e, 
                        'category' => 'Messages', 
                        'location' => 'SendApptCancellation.php',
                        'user' => null
                    ]
                ));
                // reportBug('Saving and Sending', ['error'=>$e], 'Messages', 'SendApptConfirmation.php');
            }
        }
        //
    }
}
