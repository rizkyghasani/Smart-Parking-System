<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    use HasFactory;

    protected $fillable = [
        'type',
        'title',
        'body',
        'from_user_id',
        'to_user_id',
        'read_at',
        'transaction_id',
        'resolved_by',
        'resolved_at'
    ];

    protected $casts = [
        'read_at' => 'datetime',
    ];

    public function fromUser()
    {
        return $this->belongsTo(User::class, 'from_user_id');
    }

    public function toUser()
    {
        return $this->belongsTo(User::class, 'to_user_id');
    }

    public function transaction()
    {
        return $this->belongsTo(ParkingTransaction::class, 'transaction_id');
    }
}