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
        // Tabel Nodes (Titik Graf: Exit & Slot)
        Schema::create('nodes', function (Blueprint $table) {
            $table->id();
            $table->string('name')->comment('Misal: EXIT1, NODE_S1');
            $table->enum('type', ['exit', 'slot'])->comment('Tipe titik dalam graf');
            $table->float('x')->comment('Koordinat X');
            $table->float('y')->comment('Koordinat Y');
            
            // Relasi ke parking_slots (NULL jika titik tersebut adalah pintu Exit)
            // ON DELETE CASCADE: Jika slot dihapus, titik nodenya ikut musnah!
            $table->foreignId('parking_slot_id')
                  ->nullable()
                  ->constrained('parking_slots')
                  ->cascadeOnDelete();
                  
            $table->timestamps();
        });

        // Tabel Edges (Jalur Penghubung & Bobot Euclidean)
        Schema::create('edges', function (Blueprint $table) {
            $table->id();
            
            // Relasi ke source node dan target node
            // ON DELETE CASCADE: Jika node hilang, jalan menuju ke sana otomatis terhapus
            $table->foreignId('source_node_id')->constrained('nodes')->cascadeOnDelete();
            $table->foreignId('target_node_id')->constrained('nodes')->cascadeOnDelete();
            
            $table->float('weight')->comment('Jarak fisik Euclidean (meter)');
            $table->string('description')->nullable()->comment('Keterangan opsional jalur');
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Harus urut, hapus edges (anak) dulu, baru nodes (induk)
        Schema::dropIfExists('edges');
        Schema::dropIfExists('nodes');
    }
};