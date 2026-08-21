<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\ParkingTransaction;
use App\Models\ParkingSlot;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class DashboardController extends Controller
{
    /**
     * 📊 Mengambil Data Ringkasan Statistik untuk Dashboard Utama Admin
     * GET /api/admin/dashboard-stats
     */
    public function getStats(Request $request)
    {
        $filter = $request->query('filter', '7_days');

        // Tentukan batas waktu (diperbaiki: 'today' sekarang jadi bagian
        // dari satu if/elseif chain yang sama, bukan if terpisah)
        if ($filter === 'today') {
            $startDate = now()->startOfDay();
        } elseif ($filter === '7_days') {
            $startDate = now()->subDays(7)->startOfDay();
        } elseif ($filter === '30_days') {
            $startDate = now()->subDays(30)->startOfDay();
        } elseif ($filter === 'this_year') {
            $startDate = now()->startOfYear();
        } else {
            $startDate = now()->subDays(7)->startOfDay();
        }

        // 1. Ambil transaksi mentah dalam rentang waktu — grouping dilakukan
        //    di PHP (bukan SQL DATE_FORMAT/to_char) supaya query tetap sama
        //    persis baik di MySQL maupun PostgreSQL.
        $transactions = ParkingTransaction::whereNotNull('exit_time')
            ->where('entry_time', '>=', $startDate)
            ->get(['entry_time', 'fee']);

        $chartData = $this->buildChartData($transactions, $filter, $startDate);

        // 2. Data Statistik Cards (tetap sama)
        $totalRevenue = ParkingTransaction::sum('fee');
        $activeStaff = User::where('role', 'staff')->where('is_active', true)->count(); // Sesuaikan tabelmu
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

    /**
     * 🌟 BARU: Membangun chart_data dengan granularitas yang menyesuaikan filter:
     * - 'today'     -> per jam (00:00 s/d jam saat ini), 24 titik maksimum
     * - '7_days' / '30_days' -> per hari, dari $startDate s/d hari ini
     * - 'this_year' -> per bulan, dari Januari s/d bulan saat ini
     *
     * Jam/hari/bulan yang tidak ada transaksinya tetap ditampilkan dengan
     * pendapatan 0, supaya bentuk chart tidak berlubang / meloncat.
     */
    private function buildChartData($transactions, string $filter, Carbon $startDate): array
    {
        if ($filter === 'today') {
            $bucketKeyFormat = 'H:00';   // key internal untuk grouping, misal "14:00"
            $bucketLabelFormat = 'H:00'; // label yang tampil di chart, sama persis
        } elseif ($filter === 'this_year') {
            $bucketKeyFormat = 'Y-m';
            $bucketLabelFormat = 'M Y';
        } else {
            $bucketKeyFormat = 'Y-m-d';
            $bucketLabelFormat = 'd M';
        }

        // Kelompokkan total fee berdasarkan key bucket
        $grouped = [];
        foreach ($transactions as $trx) {
            $entryTime = Carbon::parse($trx->entry_time);
            $key = $entryTime->format($bucketKeyFormat);
            $grouped[$key] = ($grouped[$key] ?? 0) + (int) $trx->fee;
        }

        // Bangun daftar bucket lengkap (termasuk yang kosong / fee = 0)
        // supaya sumbu X chart konsisten & tidak ada celah waktu yang hilang.
        $buckets = [];

        if ($filter === 'today') {
            $currentHour = now()->hour;
            for ($h = 0; $h <= $currentHour; $h++) {
                $pointTime = now()->startOfDay()->addHours($h);
                $key = $pointTime->format($bucketKeyFormat);
                $buckets[] = [
                    'tanggal'    => $pointTime->format($bucketLabelFormat),
                    'pendapatan' => $grouped[$key] ?? 0,
                ];
            }
        } elseif ($filter === 'this_year') {
            $cursor = $startDate->copy()->startOfMonth();
            $end = now()->startOfMonth();
            while ($cursor <= $end) {
                $key = $cursor->format($bucketKeyFormat);
                $buckets[] = [
                    'tanggal'    => $cursor->format($bucketLabelFormat),
                    'pendapatan' => $grouped[$key] ?? 0,
                ];
                $cursor->addMonth();
            }
        } else {
            $cursor = $startDate->copy()->startOfDay();
            $end = now()->startOfDay();
            while ($cursor <= $end) {
                $key = $cursor->format($bucketKeyFormat);
                $buckets[] = [
                    'tanggal'    => $cursor->format($bucketLabelFormat),
                    'pendapatan' => $grouped[$key] ?? 0,
                ];
                $cursor->addDay();
            }
        }

        return $buckets;
    }
}