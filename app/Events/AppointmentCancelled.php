<?php

namespace App\Events;

use App\Appointment;
use Illuminate\Http\Request;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class AppointmentCancelled
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $appointment;
    /**
     * Create a new event instance.
     *
     * @return void
     */
    public function __construct(Appointment $appointment, $practiceId, $cancelledBy, Request $request)
    {
        $this->appointment = $appointment;
        $this->practiceId = $practiceId;
        $this->cancelledBy = $cancelledBy;
        $this->request = $request;
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
