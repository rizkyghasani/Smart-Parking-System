<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Registrasi Akun Administrator Baru
     */
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        // Buat user dengan role admin sesuai blueprint skripsi
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'admin',       // Otomatis admin untuk pendaftaran luar
            'is_active' => true,     // Langsung aktif
        ]);

        // Generate token akses Sanctum
        $token = $user->createToken('admin_auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Registrasi Administrator berhasil',
            'data' => [
                'user' => $user,
                'token' => $token
            ]
        ], 201);
    }

    /**
     * Login Akun Admin / Staff
     */
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Email atau password wajib diisi',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Kredensial yang kamu masukkan salah.'
            ], 401);
        }

        if (!$user->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'Akun kamu dinonaktifkan oleh admin.'
            ], 403);
        }

        // 🔑 LOGIKA REMEMBER ME UTUK MENYELARASKAN KOLOM DI POSTGRESQL
        if ($request->remember == '1') {
            // Generate remember token baru dan simpan ke DB bawaan Laravel
            $user->setRememberToken(\Illuminate\Support\Str::random(60));
            $user->save();
        } else {
            // Jika login biasa tanpa centang, bersihkan token lamanya jika ada
            if (!is_null($user->getRememberToken())) {
                $user->setRememberToken(null);
                $user->save();
            }
        }

        $user->tokens()->delete();
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Login berhasil',
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                ],
                'token' => $token
            ]
        ], 200);
    }

    /**
     * Logout Akun (Revoke Token)
     */
    public function logout(Request $request)
    {
        // Hapus token yang sedang digunakan saat ini
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Berhasil keluar dari sistem'
        ], 200);
    }
}