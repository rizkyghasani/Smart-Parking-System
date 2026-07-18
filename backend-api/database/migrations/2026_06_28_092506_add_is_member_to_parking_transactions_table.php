<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('parking_transactions', function (Blueprint $table) {
            // Ditambahkan setelah customer_id
            $table->boolean('is_member')->default(false)->after('customer_id');
        });
    }

    public function down(): void
    {
        Schema::table('parking_transactions', function (Blueprint $table) {
            $table->dropColumn('is_member');
        });
    }
};