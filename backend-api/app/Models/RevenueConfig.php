<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RevenueConfig extends Model
{
    use HasFactory;

    protected $table = 'revenue_configs';

    protected $fillable = [
        'rate_per_hour',
        'effective_from',
        'created_by'
    ];

    /**
     * Relasi ke model User (Siapa admin yang membuat tarif ini)
     */
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}