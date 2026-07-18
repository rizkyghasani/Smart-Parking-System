<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MemberStatusUpdated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $member;

    public function __construct($member)
    {
        // Menyimpan data member yang baru saja diupdate
        $this->member = $member;
    }

    // Tentukan nama channel tempat pesan ini disiarkan
    public function broadcastOn()
    {
        // Menggunakan channel publik spesifik untuk customer ini
        return new Channel('customer.' . $this->member->customer_id);
    }

    // (Opsional) Tentukan data apa saja yang dikirim ke React
    public function broadcastWith()
    {
        return [
            'is_active' => $this->member->is_active,
            'expired_at' => $this->member->expired_at,
        ];
    }

    // Menentukan nama event yang spesifik untuk dikirim ke frontend
    public function broadcastAs()
    {
        return 'MemberStatusUpdated';
    }
}