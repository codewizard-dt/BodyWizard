<?php

namespace App\Notifications;

use App\Appointment;
use App\Form;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewRequiredForm extends Notification
{
    use Queueable;

    /**
     * Create a new notification instance.
     *
     * @return void
     */
    public function __construct(Form $form, Appointment $appointment = null)
    {
        $this->appointment = $appointment;
        $this->form = $form;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @param  mixed  $notifiable
     * @return array
     */
    public function via($notifiable)
    {
        return ['database'];
    }

    /**
     * Get the mail representation of the notification.
     *
     * @param  mixed  $notifiable
     * @return \Illuminate\Notifications\Messages\MailMessage
     */
    // public function toMail($notifiable)
    // {
    //     return (new MailMessage)
    //                 ->line('The introduction to the notification.')
    //                 ->action('Notification Action', url('/'))
    //                 ->line('Thank you for using our application!');
    // }

    /**
     * Get the array representation of the notification.
     *
     * @param  mixed  $notifiable
     * @return array
     */
    public function toArray($notifiable)
    {
        $appt = $this->appointment;
        $form = $this->form;
        $patient = $notifiable->patient;
        if ($appt){
            $type = "New Required Form";
            $description = 'Required by:<br>'.$appt->service_list."<br>".$appt->long_date_time;
        }else{
            $type = "Required New Patient Form";
            $description = "This form is required by all new patients";
        }

        return [
            'type' => $type,
            'description' => $description,
            'details' => [
                'Form' => $form->name,
                'Last Submitted' => $form->lastSubmittedBy($patient),
            ],
            'model'=>'Form',
            'uid'=>$form->form_uid,
            'tabId' => '#forms-home',
            'click' => ['text'=>"go to calendar",'tabId'=>"#appointments-index"],
        ];
    }
}
