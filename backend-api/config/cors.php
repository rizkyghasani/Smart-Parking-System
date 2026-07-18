<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Pengaturan di sini menentukan nilai apa yang diizinkan untuk dikirimkan 
    | ke browser. Secara default, ini disetel untuk mengizinkan React.
    |
    */

    // Izinkan semua jalur API
    'paths' => ['api/*', 'sanctum/csrf-cookie', 'reverb/*'],

    // Izinkan semua metode (GET, POST, PUT, DELETE)
    'allowed_methods' => ['*'],

    // Izinkan akses dari Port Frontend (React)
    'allowed_origins' => [
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:5175',
        'http://127.0.0.1:5173',
        'http://localhost:3000', // Cadangan jika pakai port lain
    ],

    'allowed_origins_patterns' => [],

    // Izinkan semua Header (Content-Type, Authorization, dll)
    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    // Berapa lama browser menyimpan izin ini (dalam detik)
    'max_age' => 0,

    // Setel ke TRUE jika kamu butuh mengirim cookie/session (penting untuk Sanctum)
    'supports_credentials' => true,

];