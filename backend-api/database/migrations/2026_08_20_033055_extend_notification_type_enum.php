<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Drop constraint lama, buat lagi dengan daftar nilai yang lebih lengkap.
        // Ditambahkan: 'info' (dipakai overrideSlot()) dan 'manual_tapout_request' (fitur baru).
        DB::statement("ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check");
        DB::statement("ALTER TABLE notifications ADD CONSTRAINT notifications_type_check CHECK (type IN ('violation', 'system', 'info', 'manual_tapout_request'))");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check");
        DB::statement("ALTER TABLE notifications ADD CONSTRAINT notifications_type_check CHECK (type IN ('violation', 'system'))");
    }
};