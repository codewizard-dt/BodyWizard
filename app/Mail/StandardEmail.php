<?php

namespace App\Mail;


use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Contracts\Queue\ShouldQueue;
use App\Message;
use Illuminate\Support\Facades\Log;


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
        include_once app_path("php/functions.php");

        $messageId = $this->data->id;
        $header = [
            'unique_args' => [
                'bw_message_id' => $messageId
            ]
        ];
        $this->withSwiftMessage(function($message) use ($header){
            $message->getHeaders()
                    ->addTextHeader('X-SMTPAPI',asString($header));
        });
        return $this->view('emails.standard')
                    ->subject($this->data->subject);
    }
}
