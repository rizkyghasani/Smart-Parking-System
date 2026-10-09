<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            // Saldo e-wallet pelanggan untuk pembayaran parkir non-member.
            // DECIMAL(12,2) mendukung saldo hingga Rp 9.999.999.999,99.
            $table->decimal('balance', 12, 2)->default(0)->after('registered_plate_number');
        });
    }

    public function down(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            $table->dropColumn('balance');
        });
    }
};