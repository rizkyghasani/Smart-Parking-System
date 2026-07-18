<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('slot_overrides', function (Blueprint $table) {
            $table->id();
            $table->foreignId('transaction_id')->constrained('parking_transactions')->onDelete('cascade'); // FK -> parking_transactions
            $table->foreignId('old_slot_id')->constrained('parking_slots')->onDelete('cascade'); // FK -> parking_slots (asal)
            $table->foreignId('new_slot_id')->constrained('parking_slots')->onDelete('cascade'); // FK -> parking_slots (aktual)
            $table->foreignId('staff_id')->constrained('users')->onDelete('cascade'); // FK -> users (petugas)
            $table->text('reason'); // Keterangan singkat alasan override
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('slot_overrides');
    }
};