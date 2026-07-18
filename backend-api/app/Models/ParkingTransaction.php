<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ParkingTransaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'card_id', 
        'plate_number', 
        'parking_slot_id', 
        'customer_id',
        'is_member',
        'entry_time', 
        'exit_time', 
        'is_violation',
        'duration_minutes', // ➕ Tambahkan kolom durasi menit dari alter migration
        'fee',              // ➕ Tambahkan kolom nominal biaya dari alter migration
        'revenue_config_id' // ➕ Tambahkan kolom FK acuan tarif dari alter migration
    ];

    // Beritahu Laravel tipe data rill masing-masing kolom untuk mempermudah kalkulasi
    protected $casts = [
        'entry_time'       => 'datetime',
        'exit_time'        => 'datetime',
        'is_violation'     => 'boolean',
        'duration_minutes' => 'integer', // ⚙️ Cast ke integer agar dibaca sebagai angka rill
        'fee'              => 'integer', // ⚙️ Cast ke integer agar mempermudah .toLocaleString() di React
        'revenue_config_id'=> 'integer',
    ];

    /**
     * Relasi ke Slot Parkir
     * Karena 'parking_slot_id' ada di tabel ini
     */
    public function slot()
    {
        return $this->belongsTo(ParkingSlot::class, 'parking_slot_id');
    }

    /**
     * ➕ Relasi ke Konfigurasi Tarif (Audit Trail)
     * Menghubungkan transaksi dengan skema tarif yang berlaku saat kendaraan keluar
     */
    public function revenueConfig()
    {
        return $this->belongsTo(RevenueConfig::class, 'revenue_config_id');
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }
}