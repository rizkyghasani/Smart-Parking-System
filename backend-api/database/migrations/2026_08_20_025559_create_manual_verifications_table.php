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
        Schema::create('manual_verifications', function (Blueprint $table) {
            $table->id();
            // Relasi ke tabel transaksi utama
            $table->foreignId('transaction_id')->constrained('parking_transactions')->onDelete('cascade');
            
            // Data STNK / Fisik
            $table->string('verified_plate');
            $table->string('vehicle_model');
            $table->string('vehicle_color');
            $table->string('driver_name');
            
            $table->timestamps();
        });
    }
    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('manual_verifications');
    }
};
