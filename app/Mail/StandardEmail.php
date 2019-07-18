<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Contracts\Queue\ShouldQueue;
use App\Message;

class StandardEmail extends Mailable
{
    use Queueable, SerializesModels;

    public $data;
    public $attachments;

    /**
     * Create a new message instance.
     *
     * @return void
     */
    public function __construct(Message $message)
    {
        // if (strpos($message->message,'src="data') > -1){

        // }
        preg_match_all('/src="data:image\/(png|jpeg|jpg);base64,([^".]*)"/', $message->message, $matches);

        $this->data = $message;
        $this->attachments = $message->attachments;
    }

    /**
     * Build the message.
     *
     * @return $this
     */
    public function build()
    {
        return $this->view('emails.standard')
                    ->subject($this->data->subject);
    }
}
