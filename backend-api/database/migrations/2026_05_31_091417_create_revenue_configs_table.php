<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('revenue_configs', function (Blueprint $table) {
            $table->id();
            $table->integer('rate_per_hour'); // Tarif parkir per jam (Rupiah)
            $table->timestamp('effective_from'); // Tanggal berlaku tarif
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade'); // FK -> users
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('revenue_configs');
    }
};