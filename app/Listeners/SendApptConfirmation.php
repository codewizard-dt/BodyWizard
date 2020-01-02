<?php

namespace App\Listeners;

use App\Events\AppointmentSaved;
use App\Events\OutgoingMessage;
use App\Events\BugReported;
use App\Notifications\NewAppointment;
use App\Notifications\AppointmentChange;
use App\Notifications\NewRequiredForm;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Notification;
use App\Message;
use App\Template;



class SendApptConfirmation
{
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
     * @param  AppointmentSaved  $event
     * @return void
     */
    public function handle(AppointmentSaved $event)
    {
        $appt = $event->appointment;
        $changes = $event->changes;
        $practiceId = $event->practiceId;
        $savedBy = $event->savedBy;
        if ($changes){
            $template = Template::where('name','like','Appointment Changed')->first();
        }else{
            $template = Template::where('name','like','Appointment Booked')->first();
        }

        $patients = $appt->patients;
        foreach ($patients as $patient){
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
                        'location' => 'SendApptConfirmation.php',
                        'user' => null
                    ]
                ));
            }
            
            try{
                $msg->save();
                $users = ($savedBy == 'patient') ? $appt->practitioner->userInfo : $appt->patient_user_models;
                if ($changes){
                    Notification::send($users, new AppointmentChange($appt, $changes));
                }else{
                    Notification::send($users, new NewAppointment($appt));
                    $forms = $appt->forms('patient');
                    foreach ($appt->patients as $patient){
                        foreach($forms as $form){
                            $submitted = $form->checkApptFormStatus($appt,$patient);
                            // Log::info($form->name." ".$submitted);
                            if (!$submitted){
                                $patient->userInfo->notify(new NewRequiredForm($form, $appt));
                            }
                        }
                    }
                }
                // event(new OutgoingMessage($msg, $practiceId));
            }
            catch(\Exception $e){
                event(new BugReported(
                    [
                        'description' => "Saving and Sending Msgs", 
                        'details' => $e, 
                        'category' => 'Messages', 
                        'location' => 'SendApptConfirmation.php',
                        'user' => null
                    ]
                ));
                // reportBug('Saving and Sending', ['error'=>$e], 'Messages', 'SendApptConfirmation.php');
            }
        }
        //
    }

    public function failed(AppointmentSaved $event, $exception)
    {
        //
    }    
}
