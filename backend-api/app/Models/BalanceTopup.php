<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BalanceTopup extends Model
{
    protected $fillable = [
        'customer_id',
        'amount',
        'payment_method',
        'status',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'payment_method' => 'string',
        'status' => 'string',
    ];

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }
}