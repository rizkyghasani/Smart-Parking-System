<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Tambah tracking penyelesaian di tabel notifikasi
        Schema::table('notifications', function (Blueprint $table) {
            $table->foreignId('resolved_by')->nullable()->constrained('users')->nullOnDelete()->after('read_at');
            $table->timestamp('resolved_at')->nullable()->after('resolved_by');
        });

        // 2. Tambah jejak petugas di riwayat tap-out manual STNK
        Schema::table('manual_verifications', function (Blueprint $table) {
            $table->foreignId('staff_id')->nullable()->constrained('users')->nullOnDelete()->after('transaction_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('notifications', function (Blueprint $table) {
            $table->dropForeign(['resolved_by']);
            $table->dropColumn(['resolved_by', 'resolved_at']);
        });

        Schema::table('manual_verifications', function (Blueprint $table) {
            $table->dropForeign(['staff_id']);
            $table->dropColumn('staff_id');
        });
    }
};