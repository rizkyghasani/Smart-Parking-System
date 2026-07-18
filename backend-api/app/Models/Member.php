<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Member extends Model
{
    protected $fillable = [
        'customer_id',
        'expired_at',
        'is_active',
    ];

    protected $casts = [
        'expired_at' => 'date',
        'is_active' => 'boolean',
    ];

    // Kembali ke profil pelanggan utama
    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }
}