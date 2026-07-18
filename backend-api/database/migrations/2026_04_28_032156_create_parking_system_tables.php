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
        // Tabel Master Slot
        Schema::create('parking_slots', function (Blueprint $table) {
            $table->id();
            $table->string('slot_code')->unique(); // Contoh: 1A, 1B
            $table->enum('status', ['available', 'occupied', 'maintenance'])->default('available');
            $table->integer('priority_weight'); // 1 = Terdekat
            $table->json('roi_coordinates')->nullable(); // Koordinat untuk AI
            $table->timestamps();
        });

        // Tabel Transaksi
        Schema::create('parking_transactions', function (Blueprint $table) {
            $table->id();
            $table->string('card_id');
            $table->string('plate_number');
            $table->foreignId('parking_slot_id')->constrained();
            $table->timestamp('entry_time');
            $table->timestamp('exit_time')->nullable();
            $table->boolean('is_violation')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('parking_system_tables');
    }
};
