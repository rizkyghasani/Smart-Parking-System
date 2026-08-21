<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Hapus batasan status yang lama
        DB::statement('ALTER TABLE parking_slots DROP CONSTRAINT IF EXISTS parking_slots_status_check');
        
        // 2. Buat batasan baru yang mengizinkan 'violation'
        DB::statement("ALTER TABLE parking_slots ADD CONSTRAINT parking_slots_status_check CHECK (status::text IN ('available', 'occupied', 'maintenance', 'violation'))");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Kembalikan ke kondisi semula jika terjadi rollback
        DB::statement('ALTER TABLE parking_slots DROP CONSTRAINT IF EXISTS parking_slots_status_check');
        DB::statement("ALTER TABLE parking_slots ADD CONSTRAINT parking_slots_status_check CHECK (status::text IN ('available', 'occupied', 'maintenance'))");
    }
};