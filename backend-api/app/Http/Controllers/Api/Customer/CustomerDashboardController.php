<?php

namespace App\Http\Controllers\Api\Customer;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Exception;

class CustomerDashboardController extends Controller
{
    public function index()
    {
        try {
            $user = Auth::user();
            
            if (!$user) {
                return response()->json(['message' => 'User tidak terautentikasi'], 401);
            }

            // 🌟 Kita satukan semua relasi dalam satu kali eksekusi (Eager Loading)
            $user->load([
                'customer.member', 
                'customer.transactions' => function($query) {
                    $query->latest()->limit(10);
                }
            ]);

            return response()->json([
                'status' => 'success',
                'data' => [
                    'name'         => $user->name,
                    'email'        => $user->email,
                    'phone'        => $user->customer->phone_number ?? '-',
                    'plate'        => $user->customer->registered_plate_number ?? '-',
                    //'member'       => $user->customer->member ?? null,
                    'member'       => $user->customer->member ? [
                        'is_active'   => (bool) $user->customer->member->is_active, // Pastikan ada field ini
                        'expired_at'  => $user->customer->member->expired_at,
                    ] : null,
                    'transactions' => $user->customer->transactions ?? []
                ]
            ]);
        } catch (Exception $e) {
            return response()->json([
                'error' => $e->getMessage(),
                'line' => $e->getLine()
            ], 500);
        }
    }
}