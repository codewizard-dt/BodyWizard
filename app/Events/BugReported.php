<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class BugReported
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $description;
    public $details;
    public $location;
    public $category;
    public $user;
    /**
     * Create a new event instance.
     *
     * @return void
     */
    public function __construct($details)
    {
        $this->description = isset($details['description']) ? $details['description'] : null;
        $this->details = isset($details['details']) ? $details['details'] : null;
        $this->location = isset($details['location']) ? $details['location'] : null;
        $this->category = isset($details['category']) ? $details['category'] : null;
        $this->user = isset($details['user']) ? $details['user'] : null;
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
