<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Support\Facades\Log;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use App\Appointment;

class AppointmentSaved
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $appointment;
    public $changes;
    public $practiceId;
    /**
     * Create a new event instance.
     *
     * @return void
     */
    public function __construct(Appointment $appointment, $changes, $practiceId, $savedBy)
    {
        $this->appointment = $appointment;
        $this->changes = $changes;
        $this->practiceId = $practiceId;
        $this->savedBy = $savedBy;
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
