<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('parking_transactions', function (Blueprint $table) {
            // Ditambahkan di belakang kolom is_violation eksisting
            $table->integer('duration_minutes')->nullable()->after('is_violation'); 
            $table->integer('fee')->nullable()->after('duration_minutes'); 
            $table->foreignId('revenue_config_id')->nullable()->after('fee')->constrained('revenue_configs')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('parking_transactions', function (Blueprint $table) {
            $table->dropForeign(['revenue_config_id']);
            $table->dropColumn(['duration_minutes', 'fee', 'revenue_config_id']);
        });
    }
};