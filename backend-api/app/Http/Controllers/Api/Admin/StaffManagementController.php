<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class StaffManagementController extends Controller
{
    /**
     * 📥 1. Ambil Semua Akun Ber-role Staff
     * GET /api/admin/staff
     */
    public function index()
    {
        $staffs = User::where('role', 'staff')
            ->orderBy('id', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $staffs
        ], 200);
    }

    /**
     * 📤 2. Daftarkan Akun Staff Baru oleh Admin
     * POST /api/admin/staff
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name'     => 'required|string|max:255',
            'email'    => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors'  => $validator->errors()
            ], 422);
        }

        $staff = User::create([
            'name'      => $request->name,
            'email'     => $request->email,
            'password'  => Hash::make($request->password),
            'role'      => 'staff', // Dikunci sebagai staff lapangan
            'is_active' => true,    // Langsung aktif secara default
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Akun petugas baru berhasil didaftarkan',
            'data'    => $staff
        ], 201);
    }

    /**
     * ⚡ 3. Sakelar Aktif/Nonaktifkan Akun Staff (Sesuai Blueprint Skripsi)
     * PATCH /api/admin/staff/{id}/toggle-status
     */
    public function toggleStatus(Request $request, $id)
    {
        // 1. Validasi input password admin dari frontend
        $validator = Validator::make($request->all(), [
            'admin_password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Password konfirmasi wajib diisi.',
                'errors' => $validator->errors()
            ], 422);
        }

        // 2. Verifikasi apakah password cocok dengan akun admin yang sedang login
        $admin = $request->user();
        if (!Hash::check($request->admin_password, $admin->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Konfirmasi gagal! Password Administrator yang Anda masukkan salah.'
            ], 401);
        }

        // 3. Cari data staff yang akan di-toggle
        $staff = User::where('role', 'staff')->find($id);

        if (!$staff) {
            return response()->json([
                'success' => false,
                'message' => 'Akun petugas tidak ditemukan.'
            ], 404);
        }

        // 4. Balikkan status keaktifan jika verifikasi password sukses
        $staff->is_active = !$staff->is_active;
        $staff->save();

        return response()->json([
            'success' => true,
            'message' => "Verifikasi berhasil. Status akun {$staff->name} telah diperbarui.",
            'data' => $staff
        ], 200);
    }
}