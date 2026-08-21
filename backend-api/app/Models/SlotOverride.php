<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SlotOverride extends Model
{
    use HasFactory;

    protected $fillable = [
        'transaction_id',
        'old_slot_id',
        'new_slot_id',
        'staff_id',
        'reason'
    ];

    public function transaction()
    {
        return $this->belongsTo(ParkingTransaction::class, 'transaction_id');
    }

    public function oldSlot()
    {
        return $this->belongsTo(ParkingSlot::class, 'old_slot_id');
    }

    public function newSlot()
    {
        return $this->belongsTo(ParkingSlot::class, 'new_slot_id');
    }

    public function staff()
    {
        return $this->belongsTo(User::class, 'staff_id');
    }

    public function overridesAsOld()
    {
        return $this->hasMany(SlotOverride::class, 'old_slot_id');
    }

    public function overridesAsNew()
    {
        return $this->hasMany(SlotOverride::class, 'new_slot_id');
    }
}