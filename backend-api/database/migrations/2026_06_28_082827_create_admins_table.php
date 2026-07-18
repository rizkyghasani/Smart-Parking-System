<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('admins', function (Blueprint $table) {
            $table->id();
            // Relasi 1-to-1 ke users (Cascade delete agar bersih jika user dihapus)
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->timestamps();
            
            // Memastikan satu user hanya bisa punya satu profil admin
            $table->unique('user_id'); 
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('admins');
    }
};
