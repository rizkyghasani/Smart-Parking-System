<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('balance_topups', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_id')->constrained('customers')->cascadeOnDelete();
            $table->decimal('amount', 12, 2);
            // Metode pembayaran simulasi (belum terintegrasi payment gateway riil).
            $table->enum('payment_method', ['virtual_account', 'qris', 'debit_card']);
            $table->enum('status', ['pending', 'success', 'failed'])->default('pending');
            $table->timestamps();

            $table->index('customer_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('balance_topups');
    }
};