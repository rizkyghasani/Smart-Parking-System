<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ParkingSlot extends Model
{
    use HasFactory;

    protected $fillable = [
        'slot_code',
        'status',
        'priority_weight',
        'roi_coordinates'
    ];

    protected $casts = [
        'roi_coordinates' => 'array',
    ];

    /**
     * Relasi: Satu slot bisa memiliki banyak transaksi
     */
    public function transactions()
    {
        return $this->hasMany(ParkingTransaction::class);
    }
}

