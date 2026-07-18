<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('members', function (Blueprint $table) {
            $table->id();
            // Relasi berantai menembus customer
            $table->foreignId('customer_id')->constrained('customers')->cascadeOnDelete();
            $table->date('expired_at');
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            // Satu customer hanya punya 1 paket membership aktif
            $table->unique('customer_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('members');
    }
};
