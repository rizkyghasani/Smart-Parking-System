<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Konversi satu kali: kolom `timestamp` yang tersimpan dalam UTC di-ganti
 * menjadi WIB (UTC+7). Dijalankan BERSAMAAN dengan perubahan
 * config/app.php -> timezone = Asia/Jakarta agar seluruh data sejarah
 * maupun transaksi aktif tetap konsisten (entry/exit digeser bersamaan,
 * sehingga durasi & fee yang sudah tersimpan tidak berubah).
 */
return new class extends Migration
{
    /**
     * Kolom bertipe timestamp pada seluruh tabel aplikasi (idempoten):
     * SELECT ... information_schema -> UPDATE ... + INTERVAL '7 HOURS'
     */
    public function up(): void
    {
        $columns = DB::select("
            SELECT table_name, column_name
            FROM information_schema.columns
            WHERE table_schema = current_schema()
              AND data_type IN ('timestamp', 'timestamp without time zone')
            ORDER BY table_name, ordinal_position
        ");

        foreach ($columns as $col) {
            $table  = $col->table_name;
            $column = $col->column_name;
            DB::statement("UPDATE \"{$table}\" SET \"{$column}\" = \"{$column}\" + INTERVAL '7 HOURS' WHERE \"{$column}\" IS NOT NULL");
        }
    }

    public function down(): void
    {
        $columns = DB::select("
            SELECT table_name, column_name
            FROM information_schema.columns
            WHERE table_schema = current_schema()
              AND data_type IN ('timestamp', 'timestamp without time zone')
            ORDER BY table_name, ordinal_position
        ");

        foreach ($columns as $col) {
            $table  = $col->table_name;
            $column = $col->column_name;
            DB::statement("UPDATE \"{$table}\" SET \"{$column}\" = \"{$column}\" - INTERVAL '7 HOURS' WHERE \"{$column}\" IS NOT NULL");
        }
    }
};