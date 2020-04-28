<?php

namespace App\Notifications;

use App\Appointment;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewAppointment extends Notification
{
    use Queueable;

    /**
     * Create a new notification instance.
     *
     * @return void
     */
    public function __construct(Appointment $appointment)
    {
        $this->appointment = $appointment;
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
        $type = $notifiable->user_type;
        if ($type == 'patient'){
            return [
                'type' => 'New Appointment',
                'description' => "This appointment has booked for you!",
                'details' => [
                    'Practitioner' => $appt->practitioner->name,
                    'Date + Time' => $appt->long_date_time,
                    'Services' => $appt->service_list
                ],
                'click' => ['text'=>"go to calendar",'tabId'=>"#appointments-index"],
            ];
        }elseif ($type == 'practitioner'){
            return [
                'type' => 'New Appointment',
                'description' => "This appointment has booked for you!",
                'details' => [
                    'Patient' => $appt->patient->name,
                    'Date + Time' => $appt->long_date_time,
                    'Services' => $appt->service_list
                ],
                'click' => ['text'=>"go to calendar",'tabId'=>"#appointments-index"],
            ];
        }
    }
}
