<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\ParkingTransaction;
use App\Models\ParkingSlot;
use App\Models\User;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    /**
     * 📊 Mengambil Data Ringkasan Statistik untuk Dashboard Utama Admin
     * GET /api/admin/dashboard-stats
     */
    public function getStats()
    {
        // 1. Hitung total pendapatan dari transaksi sirkulasi parkir rill yang sudah selesai
        $totalRevenue = ParkingTransaction::sum('fee');

        // 2. Hitung jumlah petugas lapangan yang berstatus aktif saat ini
        $activeStaffCount = User::where('role', 'staff')
            ->where('is_active', true)
            ->count();

        // 3. Hitung jumlah slot parkir yang mendeteksi adanya alarm mismatch plat nomor
        $violationCount = ParkingSlot::where('status', 'violation')->count();

        return response()->json([
            'success' => true,
            'message' => 'Statistik dashboard berhasil dimuat',
            'data' => [
                'total_revenue'      => (int) $totalRevenue,
                'active_staff_count' => (int) $activeStaffCount,
                'violation_count'    => (int) $violationCount
            ]
        ], 200);
    }
}