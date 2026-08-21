<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ParkingSlot extends Model
{
    use HasFactory, SoftDeletes;

    protected $guarded = ['id'];

    protected $fillable = ['slot_code', 'status', 'x_coord', 'y_coord', 'roi_coordinates'];

    public function node()
    {
        return $this->hasOne(Node::class);
    }

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

