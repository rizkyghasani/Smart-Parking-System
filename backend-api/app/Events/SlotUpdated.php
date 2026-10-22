<?php

namespace App\Events;

use App\Models\ParkingSlot;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow; 
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
        $activeTransaction = null;

        if (in_array($this->slot->status, ['occupied', 'violation'], true)) {
            $transaction = \App\Models\ParkingTransaction::where('parking_slot_id', $this->slot->id)
                ->whereNull('exit_time')
                ->latest()
                ->first([
                    'id', 'parking_slot_id', 'plate_number', 'entry_time', 'card_id',
                    'requires_manual_verification', 'is_violation'
                ]);

            if ($transaction) {
                $activeTransaction = $transaction->toArray();
            }
        }

        return [
            'slot' => [
                'id' => $this->slot->id,
                'slot_code' => $this->slot->slot_code,
                'status' => $this->slot->status,
                'x_coord' => $this->slot->x_coord,
                'y_coord' => $this->slot->y_coord,
                'active_transaction' => $activeTransaction,
            ],
        ];
    }
}