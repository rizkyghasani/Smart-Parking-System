<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Customer extends Model
{
    protected $fillable = [
        'user_id',
        'phone_number',
        'registered_plate_number',
    ];

    // Ke Induk
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Ke Kontrol Keanggotaan
    public function member()
    {
        return $this->hasOne(Member::class);
    }

    // Ke Riwayat Transaksi (1 to Many)
    public function parkingTransactions()
    {
        return $this->hasMany(ParkingTransaction::class);
    }

    public function transactions() 
    {
        return $this->hasMany(ParkingTransaction::class, 'customer_id');
    }

}