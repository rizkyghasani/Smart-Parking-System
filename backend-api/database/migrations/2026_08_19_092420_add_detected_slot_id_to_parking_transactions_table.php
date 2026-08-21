<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('parking_transactions', function (Blueprint $table) {
            $table->foreignId('detected_slot_id')
                ->nullable()
                ->after('parking_slot_id')
                ->constrained('parking_slots')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('parking_transactions', function (Blueprint $table) {
            $table->dropForeign(['detected_slot_id']);
            $table->dropColumn('detected_slot_id');
        });
    }
};