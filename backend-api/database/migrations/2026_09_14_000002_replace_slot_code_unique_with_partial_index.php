<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('parking_slots', function (Blueprint $table) {
            $table->dropUnique(['slot_code']);
        });

        DB::statement('CREATE UNIQUE INDEX parking_slots_slot_code_active_unique ON parking_slots (slot_code) WHERE deleted_at IS NULL');
    }

    public function down(): void
    {
        DB::statement('DROP INDEX IF EXISTS parking_slots_slot_code_active_unique');

        Schema::table('parking_slots', function (Blueprint $table) {
            $table->unique('slot_code');
        });
    }
};
