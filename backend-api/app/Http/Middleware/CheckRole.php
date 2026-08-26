<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    public function handle(Request $request, Closure $next, string $role): Response
    {
        // Pastikan user sudah login (token valid)
        if (!$request->user()) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        // Cek apakah role user sesuai dengan yang diizinkan di route
        if ($request->user()->role !== $role) {
            return response()->json([
                'success' => false,
                'message' => 'Forbidden: Anda tidak memiliki akses ke sumber daya ini.'
            ], 403);
        }

        return $next($request);
    }
}