<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('notifications', function (Blueprint $table) {
            // Menautkan notifikasi ke transaksi spesifik — supaya staff bisa langsung
            // buka modal verifikasi tanpa perlu cari manual lewat plat nomor
            $table->foreignId('transaction_id')
                ->nullable()
                ->after('to_user_id')
                ->constrained('parking_transactions')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('notifications', function (Blueprint $table) {
            $table->dropForeign(['transaction_id']);
            $table->dropColumn('transaction_id');
        });
    }
};