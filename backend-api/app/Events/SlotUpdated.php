<?php

namespace App\Events;

use App\Models\ParkingSlot;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow; // Gunakan ini agar instan tanpa antrian
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class SlotUpdated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $slot;

    /**
     * Create a new event instance.
     */
    public function __construct(ParkingSlot $slot)
    {
        $this->slot = $slot;
    }

    /**
     * Nama Channel yang akan didengar oleh Frontend (React)
     */
    public function broadcastOn(): array
    {
        return [
            new Channel('parking-channel'),
        ];
    }

    /**
     * Nama Event yang dikirim ke Frontend.
     * Dengan ini, di React kamu cukup pakai .listen('SlotUpdated', ...) 
     * tanpa perlu pakai titik di depannya.
     */
    public function broadcastAs(): string
    {
        return 'SlotUpdated';
    }

    /**
     * Data apa saja yang ingin dikirimkan.
     */
    public function broadcastWith(): array
    {
        return [
            'slot' => [
                'id' => $this->slot->id,
                'slot_code' => $this->slot->slot_code,
                'status' => $this->slot->status,
                'priority_weight' => $this->slot->priority_weight,
            ],
        ];
    }
}