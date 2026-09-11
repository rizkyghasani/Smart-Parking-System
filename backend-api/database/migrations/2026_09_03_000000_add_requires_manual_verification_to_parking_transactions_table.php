<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('parking_transactions', function (Blueprint $table) {
            $table->boolean('requires_manual_verification')
                ->default(false)
                ->after('detected_slot_id');
        });
    }

    public function down(): void
    {
        Schema::table('parking_transactions', function (Blueprint $table) {
            $table->dropColumn('requires_manual_verification');
        });
    }
};
