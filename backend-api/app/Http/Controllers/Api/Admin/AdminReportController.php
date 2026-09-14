<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\ParkingTransaction;
use App\Exports\RevenueReportExport;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Barryvdh\DomPDF\Facade\Pdf;
use Maatwebsite\Excel\Facades\Excel;

class AdminReportController extends Controller
{
    /**
     * Ambil data laporan pendapatan untuk ditampilkan di layar.
     * GET /api/admin/reports/revenue?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD
     */
    public function revenueReport(Request $request)
    {
        $validated = $request->validate([
            'start_date' => 'required|date',
            'end_date'   => 'required|date|after_or_equal:start_date',
        ]);

        $data = $this->buildReportData($validated['start_date'], $validated['end_date']);

        return response()->json(['status' => 'success', 'data' => $data]);
    }

    /**
     * Unduh laporan dalam bentuk PDF.
     * GET /api/admin/reports/revenue/export-pdf?start_date=...&end_date=...
     */
    public function exportPdf(Request $request)
    {
        $validated = $request->validate([
            'start_date' => 'required|date',
            'end_date'   => 'required|date|after_or_equal:start_date',
        ]);

        $data = $this->buildReportData($validated['start_date'], $validated['end_date']);

        $pdf = Pdf::loadView('reports.revenue_pdf', ['data' => $data])->setPaper('a4', 'landscape');
        return $pdf->download("laporan-pendapatan-{$validated['start_date']}-sd-{$validated['end_date']}.pdf");
    }

    /**
     * Unduh laporan dalam bentuk Excel.
     * GET /api/admin/reports/revenue/export-excel?start_date=...&end_date=...
     */
    public function exportExcel(Request $request)
    {
        $validated = $request->validate([
            'start_date' => 'required|date',
            'end_date'   => 'required|date|after_or_equal:start_date',
        ]);

        $data = $this->buildReportData($validated['start_date'], $validated['end_date']);

        return Excel::download(
            new RevenueReportExport($data),
            "laporan-pendapatan-{$validated['start_date']}-sd-{$validated['end_date']}.xlsx"
        );
    }

    /**
     * Logika inti pembangunan data laporan — dipakai bersama oleh ketiga
     * endpoint di atas (layar, PDF, Excel) agar angka yang ditampilkan
     * selalu konsisten di ketiga bentuk keluaran.
     */
    private function buildReportData(string $startDate, string $endDate): array
    {
        $start = Carbon::parse($startDate)->startOfDay();
        $end   = Carbon::parse($endDate)->endOfDay();

        $transactions = ParkingTransaction::with(['slot', 'revenueConfig'])
            ->whereNotNull('exit_time')
            ->whereBetween('exit_time', [$start, $end])
            ->orderBy('exit_time')
            ->get();

        // 1. Ringkasan umum
        $ringkasan = [
            'total_pendapatan' => (int) $transactions->sum('fee'),
            'total_transaksi'  => $transactions->count(),
        ];

        // 2. Breakdown member vs non-member
        $memberTrx    = $transactions->where('is_member', true);
        $nonMemberTrx = $transactions->where('is_member', false);

        $breakdownMember = [
            'member'     => ['jumlah_transaksi' => $memberTrx->count(),    'total_pendapatan' => (int) $memberTrx->sum('fee')],
            'non_member' => ['jumlah_transaksi' => $nonMemberTrx->count(), 'total_pendapatan' => (int) $nonMemberTrx->sum('fee')],
        ];

        // 3. Breakdown per periode (harian)
        $breakdownPeriode = $transactions
            ->groupBy(fn($t) => Carbon::parse($t->exit_time)->format('Y-m-d'))
            ->map(fn($group, $tanggal) => [
                'tanggal'          => Carbon::parse($tanggal)->format('d M Y'),
                'jumlah_transaksi' => $group->count(),
                'total_pendapatan' => (int) $group->sum('fee'),
            ])->values();

        // 4. Breakdown per tarif yang berlaku
        $breakdownTarif = $transactions
            ->filter(fn($t) => $t->revenueConfig !== null)
            ->groupBy('revenue_config_id')
            ->map(function ($group) {
                $config = $group->first()->revenueConfig;
                return [
                    'tarif_per_jam'    => (int) $config->rate_per_hour,
                    'berlaku_sejak'    => Carbon::parse($config->effective_from)->format('d M Y'),
                    'jumlah_transaksi' => $group->count(),
                    'total_pendapatan' => (int) $group->sum('fee'),
                ];
            })->values();

        // 5. Daftar transaksi detail
        $detailTransaksi = $transactions->map(fn($t) => [
            'plate_number'     => $t->plate_number,
            'slot_code'        => $t->slot->slot_code ?? '-',
            'entry_time'       => optional($t->entry_time)->format('d M Y H:i'),
            'exit_time'        => optional($t->exit_time)->format('d M Y H:i'),
            'duration_minutes' => $t->duration_minutes,
            'is_member'        => (bool) $t->is_member,
            'fee'              => (int) $t->fee,
        ])->values();

        return [
            'periode'          => ['start' => $start->format('d M Y'), 'end' => $end->format('d M Y')],
            'ringkasan'        => $ringkasan,
            'breakdown_member' => $breakdownMember,
            'breakdown_periode'=> $breakdownPeriode,
            'breakdown_tarif'  => $breakdownTarif,
            'detail_transaksi' => $detailTransaksi,
        ];
    }
}