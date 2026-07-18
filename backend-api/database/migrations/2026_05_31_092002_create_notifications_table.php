<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->enum('type', ['violation', 'system', 'info']); // Sesuai blueprint
            $table->string('title');
            $table->text('body');
            $table->foreignId('from_user_id')->nullable()->constrained('users')->nullOnDelete(); // FK -> users
            $table->foreignId('to_user_id')->nullable()->constrained('users')->nullOnDelete();   // FK -> users
            $table->timestamp('read_at')->nullable(); // Null jika belum dibaca
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};