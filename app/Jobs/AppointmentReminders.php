<?php

namespace App\Jobs;

use App\Appointment;
use App\Message;
use App\Template;
use App\Events\OutgoingMessage;
use Twilio;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Log;



class AppointmentReminders implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Create a new job instance.
     *
     * @return void
     */
    public function __construct()
    {
        //
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {
        $practices = practiceConfig('practices');
        foreach($practices as $practiceId => $info){
            if ($info['app']['status'] == 'active'){
                // CONNECT TO APPROPRIATE DATABASE
                $db = $info['app']['database'];
                config(['database.connections.mysql.database' => $db]);
                \DB::reconnect();
                $practice = $info['public']['practiceName'];

                $appts24 = Appointment::allApptsNeedingReminder();
                foreach($appts24 as $appt){
                    // $patients = $appt->patients;
                    // if (count($patients) == 1){
                        // $patient = $patients->first();
                        $patient = $appt->patient;
                        $date = $appt->date_time->format('D M jS \a\t g:ia');
                        if ($patient->settings['reminders']['appointments']['text']){
                            $sms = new Message;
                            $sms->sender_id = 1;
                            $sms->recipient_id = $patient->userInfo->id;
                            $sms->message_id = uuid();
                            $sms->type = 'SMS';
                            $sms->status = $sms->defaultStatus();
                            $sms->message = "Hi, it's $practice! Reply 'c' to confirm your appointment tomorrow, $date.";
                        }
                        if ($patient->settings['reminders']['appointments']['email']){
                            $email = new Message;
                            $template = Template::where('name','Appointment Reminder')->first();
                            $body = $template->markup;
                            $body = str_replace("%%date_time%%",$date,$body);
                            $body = str_replace("%%appt_link%%","<a href='".$appt->appt_link."' target='_blank'>link</a>",$body);
                            $email->sender_id = 1;
                            $email->recipient_id = $patient->userInfo->id;
                            $email->template_id = $template->id;
                            $email->message_id = uuid();
                            $email->type = 'Email';
                            $email->status = $email->defaultStatus();
                            $email->subject = $template->subject;
                            $email->message = $body;
                        }
                        try{
                            if (isset($sms)){
                                $sms->save();
                                event(new OutgoingMessage($sms));
                            }
                            if (isset($email)){
                                $email->save();
                                event(new OutgoingMessage($email));                                
                            }
                        }
                        catch(\Exception $e){
                            return $e;
                        }
                        $status = $appt->status;
                        $status['reminders']['sentAt'][] = Carbon::now()->toDateTimeString();
                        $appt->status = $status;
                        $appt->save();
                    // }
                }
            }
        }
    }
}
