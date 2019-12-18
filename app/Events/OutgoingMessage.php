<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Queue\SerializesModels;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Support\Facades\Log;
use App\Message;

class OutgoingMessage
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $message;
    public $practiceId;
    /**
     * Create a new event instance.
     *
     * @return void
     */
    // public function __construct(Message $message)
    public function __construct(Message $message, $practiceId)
    {
        $this->message = $message;
        $this->practiceId = $practiceId;
        // Log::info("OutgoingMessage ".$this->practiceId);
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return \Illuminate\Broadcasting\Channel|array
     */
    public function broadcastOn()
    {
        return new PrivateChannel('channel-name');
    }
}
