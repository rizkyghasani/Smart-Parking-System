<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('parking_slots', function (Blueprint $table) {
            // Hapus sistem alokasi manual yang lama
            $table->dropColumn('priority_weight');
            
            // Tambahkan koordinat fisik untuk kalkulasi Euclidean (Dijkstra)
            $table->float('x_coord')->after('status')->nullable()->comment('Koordinat X (meter)');
            $table->float('y_coord')->after('x_coord')->nullable()->comment('Koordinat Y (meter)');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('parking_slots', function (Blueprint $table) {
            $table->integer('priority_weight')->default(1);
            $table->dropColumn(['x_coord', 'y_coord']);
        });
    }
};