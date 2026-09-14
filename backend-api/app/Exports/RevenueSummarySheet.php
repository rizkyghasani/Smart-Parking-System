<?php

namespace App\Exports;

use Carbon\Carbon;
use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Events\AfterSheet;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class RevenueSummarySheet implements FromArray, WithTitle, WithColumnWidths, WithEvents, WithStyles
{
    protected array $data;

    public function __construct(array $data)
    {
        $this->data = $data;
    }

    public function title(): string
    {
        return 'Ringkasan';
    }

    public function columnWidths(): array
    {
        return [
            'A' => 32,
            'B' => 20,
            'C' => 24,
            'D' => 20,
            'E' => 18,
            'F' => 18,
        ];
    }

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function (AfterSheet $event) {
                $merges = [
                    'A1:F1', 'A2:F2', 'A3:F3', 'A4:F4',
                    'A6:F6', 'A7:B7', 'A8:B8', 'A9:B9',
                    'A11:F11', 'A16:F16', 'A21:F21',
                ];
                foreach ($merges as $range) {
                    $event->sheet->mergeCells($range);
                }
            },
        ];
    }

    public function array(): array
    {
        $r = $this->data;
        $ringkasan  = $r['ringkasan'] ?? [];
        $member     = $r['breakdown_member'] ?? [];
        $tarif      = $r['breakdown_tarif'] ?? [];
        $periode    = $r['breakdown_periode'] ?? [];

        $fmtMoney = fn($v) => 'Rp ' . number_format((int) $v, 0, ',', '.');
        $avg = ($ringkasan['total_transaksi'] ?? 0) > 0
            ? (int) (($ringkasan['total_pendapatan'] ?? 0) / $ringkasan['total_transaksi'])
            : 0;

        $rows = [];

        // Judul & informasi dokumen
        $rows[] = ['SMART PARKING SYSTEM'];
        $rows[] = ['LAPORAN PENDAPATAN PARKIR'];
        $rows[] = ['Periode: ' . ($r['periode']['start'] ?? '') . ' — ' . ($r['periode']['end'] ?? '')];
        $rows[] = ['Dibuat: ' . Carbon::now()->format('d M Y H:i')];
        $rows[] = [''];

        // RINGKASAN
        $rows[] = ['RINGKASAN'];
        $rows[] = ['Total Pendapatan', $fmtMoney($ringkasan['total_pendapatan'] ?? 0)];
        $rows[] = ['Total Transaksi', $ringkasan['total_transaksi'] ?? 0];
        $rows[] = ['Rata-rata per Transaksi', $fmtMoney($avg)];
        $rows[] = [''];

        // BREAKDOWN MEMBER vs NON-MEMBER
        $rows[] = ['BREAKDOWN MEMBER vs NON-MEMBER'];
        $rows[] = ['Status', 'Jumlah Transaksi', 'Total Pendapatan'];
        $rows[] = ['Member', $member['member']['jumlah_transaksi'] ?? 0, $fmtMoney($member['member']['total_pendapatan'] ?? 0)];
        $rows[] = ['Non-Member', $member['non_member']['jumlah_transaksi'] ?? 0, $fmtMoney($member['non_member']['total_pendapatan'] ?? 0)];
        $rows[] = [''];

        // BREAKDOWN PER TARIF
        $rows[] = ['BREAKDOWN PER TARIF BERLAKU'];
        $rows[] = ['Tarif/Jam', 'Berlaku Sejak', 'Jumlah Transaksi', 'Total Pendapatan'];
        foreach ($tarif as $t) {
            $rows[] = [$fmtMoney($t['tarif_per_jam']), $t['berlaku_sejak'], $t['jumlah_transaksi'], $fmtMoney($t['total_pendapatan'])];
        }
        if (count($tarif) === 0) {
            $rows[] = ['—', '—', 0, $fmtMoney(0)];
        }
        $rows[] = [''];

        // PENDAPATAN PER HARI
        $rows[] = ['PENDAPATAN PER HARI'];
        $rows[] = ['Tanggal', 'Jumlah Transaksi', 'Total Pendapatan'];
        foreach ($periode as $p) {
            $rows[] = [$p['tanggal'], $p['jumlah_transaksi'], $fmtMoney($p['total_pendapatan'])];
        }
        if (count($periode) === 0) {
            $rows[] = ['—', 0, $fmtMoney(0)];
        }

        return $rows;
    }

    public function styles(Worksheet $sheet)
    {
        $navy = 'FF26468A';

        return [
            'A1' => ['font' => ['bold' => true, 'size' => 14, 'color' => ['argb' => $navy]]],
            'A2' => ['font' => ['bold' => true, 'size' => 12]],
            'A3' => ['font' => ['italic' => true, 'color' => ['argb' => 'FF667085']]],
            'A4' => ['font' => ['italic' => true, 'color' => ['argb' => 'FF667085']]],

            'A6:F6'  => $this->sectionStyle($navy),
            'A11:F11' => $this->sectionStyle($navy),
            'A16:F16' => $this->sectionStyle($navy),
            'A21:F21' => $this->sectionStyle($navy),

            'A12:C12' => $this->headerRowStyle($navy),
            'A17:D17' => $this->headerRowStyle($navy),
            'A22:C22' => $this->headerRowStyle($navy),

            'A7:C9'  => ['font' => ['bold' => true]],
        ];
    }

    private function sectionStyle(string $navy): array
    {
        return [
            'font'  => ['bold' => true, 'color' => ['argb' => 'FFFFFFFF']],
            'fill'  => ['fillType' => 'solid', 'startColor' => ['argb' => $navy]],
            'borders' => ['outline' => ['borderStyle' => 'thin', 'color' => ['argb' => $navy]]],
        ];
    }

    private function headerRowStyle(string $navy): array
    {
        return [
            'font'  => ['bold' => true, 'color' => ['argb' => $navy]],
            'fill'  => ['fillType' => 'solid', 'startColor' => ['argb' => 'FFF3F5F9']],
            'borders' => ['outline' => ['borderStyle' => 'thin', 'color' => ['argb' => 'FFE2E6EE']]],
        ];
    }
}