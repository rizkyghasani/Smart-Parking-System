<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php', // Pastikan baris ini ada
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        // Mengaktifkan CORS secara global dan pengecualian CSRF
        $middleware->validateCsrfTokens(except: [
            'api/*', // Kecualikan API dari pengecekan CSRF agar React bisa POST
        ]);

        // 🌟 DAFTARKAN ALIAS MIDDLEWARE ROLE DI SINI
        $middleware->alias([
            'role' => \App\Http\Middleware\CheckRole::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();