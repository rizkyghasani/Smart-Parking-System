<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // 🌟 PERBAIKAN: Menambahkan 'customer' ke dalam array enum
            // Default diubah ke 'customer' agar setiap ada user mendaftar via aplikasi langsung menjadi customer
            $table->enum('role', ['admin', 'staff', 'customer'])->default('customer')->after('password');
            $table->boolean('is_active')->default(true)->after('role');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['role', 'is_active']);
        });
    }
};