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
public function getStats(Request $request)
    {
        $filter = $request->query('filter', '7_days');
        
        // Tentukan batas waktu
        $startDate = now();
        if ($filter === '7_days') $startDate = now()->subDays(7);
        elseif ($filter === '30_days') $startDate = now()->subDays(30);
        elseif ($filter === 'this_year') $startDate = now()->startOfYear();

        // 1. Ambil data chart (Group by Date)
        $chartData = \App\Models\ParkingTransaction::whereNotNull('exit_time')
            ->where('entry_time', '>=', $startDate)
            ->selectRaw('DATE(entry_time) as date, SUM(fee) as revenue')
            ->groupBy('date')
            ->orderBy('date', 'asc')
            ->get()
            ->map(function ($item) {
                return [
                    'tanggal' => date('d M', strtotime($item->date)),
                    'pendapatan' => (int) $item->revenue
                ];
            });

        // 2. Data Statistik Cards (tetap sama)
        $totalRevenue = \App\Models\ParkingTransaction::sum('fee');
        $activeStaff = \App\Models\User::where('role', 'staff')->where('is_active', true)->count(); // Sesuaikan tabelmu
        $violationCount = 0; // Sesuaikan dengan logikamu

        return response()->json([
            'success' => true,
            'data' => [
                'total_revenue' => $totalRevenue,
                'active_staff_count' => $activeStaff,
                'violation_count' => $violationCount,
                'chart_data' => $chartData // 🌟 Kirim data chart ke React
            ]
        ]);
    }
}