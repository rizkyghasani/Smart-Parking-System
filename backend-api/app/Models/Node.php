<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Node extends Model
{
    protected $fillable = ['name', 'type', 'x', 'y', 'parking_slot_id'];

    // Relasi ke ParkingSlot (NULL jika node adalah pintu Exit)
    public function parkingSlot(): BelongsTo
    {
        return $this->belongsTo(ParkingSlot::class);
    }

    // Mengambil jalan KELUAR dari titik ini
    public function outgoingEdges(): HasMany
    {
        return $this->hasMany(Edge::class, 'source_node_id');
    }

    // Mengambil jalan MASUK ke titik ini
    public function incomingEdges(): HasMany
    {
        return $this->hasMany(Edge::class, 'target_node_id');
    }
}