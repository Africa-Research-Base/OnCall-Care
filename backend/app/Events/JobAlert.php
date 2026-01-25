<?php

namespace App\Events;

use App\Models\MedicalRequest;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class JobAlert implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $request;
    public $triageLevel;

    /**
     * Create a new event instance.
     */
    public function __construct(MedicalRequest $request, $triageLevel)
    {
        $this->request = $request;
        $this->triageLevel = $triageLevel;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        // For prototype simplicity, broadcasting to a public 'nurses' channel
        // In real app, this should be PrivateChannel('nurse.{id}') for specific matched nurses
        return [
            new Channel('nurses'),
        ];
    }

    public function broadcastAs()
    {
        return 'job.created';
    }
}
