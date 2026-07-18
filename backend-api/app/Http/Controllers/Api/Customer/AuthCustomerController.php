<?php

namespace App\Http\Controllers\Api\Customer;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Customer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class AuthCustomerController extends Controller
{
    /**
     * Registrasi Customer Baru
     */
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'phone_number' => 'required|string|max:20',
            'registered_plate_number' => 'required|string|max:20',
        ]);

        return DB::transaction(function () use ($request) {
            // 1. Buat user dengan role customer
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role' => 'customer',
            ]);

            // 2. Buat profil customer
            Customer::create([
                'user_id' => $user->id,
                'phone_number' => $request->phone_number,
                'registered_plate_number' => $request->registered_plate_number,
            ]);

            return response()->json([
                'message' => 'Registrasi berhasil. Silakan login.'
            ], 201);
        });
    }

    /**
     * Login Customer
     */
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        // Cari user dengan email tersebut dan pastikan rolenya 'customer'
        $user = User::where('email', $request->email)
                    ->where('role', 'customer')
                    ->first();

        // Validasi password
        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Kredensial tidak valid atau akun bukan pelanggan.'],
            ]);
        }

        // Buat token (Pastikan model User menggunakan HasApiTokens)
        $token = $user->createToken('customer_token')->plainTextToken;

        return response()->json([
            'message' => 'Login berhasil',
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role
            ]
        ], 200);
    }

    /**
     * Logout Customer
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Berhasil logout'
        ], 200);
    }
}