<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens; // ← 1. PASTIKAN LINE INI ADA

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable; // ← 2. TAMBAHKAN HasApiTokens DI SINI

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',       // 👥 Mengunci hak akses 'admin' atau 'staff'
        'is_active',  // ⚡ Sakelar blokir/aktifkan akun petugas
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
        ];
    }

    public function revenueConfigs()
    {
        // Parameter kedua adalah nama foreign key di tabel revenue_configs
        return $this->hasMany(RevenueConfig::class, 'created_by');
    }

    public function admin()
    {
        return $this->hasOne(Admin::class);
    }

    public function staff()
    {
        return $this->hasOne(Staff::class);
    }

    public function customer()
    {
        return $this->hasOne(Customer::class);
    }

    public function transactions(): HasMany
    {
        // Asumsi: Tabel transactions memiliki kolom 'user_id'
        return $this->hasMany(Transaction::class);
    }
}