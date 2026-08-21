<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ManualVerification extends Model
{
    protected $fillable = [
        'transaction_id', 
        'verified_plate', 
        'vehicle_model', 
        'vehicle_color', 
        'driver_name',
        'staff_id'
    ];

    public function transaction()
    {
        return $this->belongsTo(ParkingTransaction::class, 'transaction_id');
    }
}