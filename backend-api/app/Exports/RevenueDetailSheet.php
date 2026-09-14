<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use Maatwebsite\Excel\Concerns\WithColumnFormatting;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Events\AfterSheet;
use PhpOffice\PhpSpreadsheet\Style\NumberFormat;

class RevenueDetailSheet implements FromArray, WithTitle, WithHeadings, WithColumnWidths, WithColumnFormatting, WithEvents
{
    protected array $data;

    public function __construct(array $data)
    {
        $this->data = $data;
    }

    public function title(): string
    {
        return 'Detail Transaksi';
    }

    public function columnWidths(): array
    {
        return [
            'A' => 16,
            'B' => 10,
            'C' => 20,
            'D' => 20,
            'E' => 16,
            'F' => 14,
            'G' => 16,
        ];
    }

    public function columnFormats(): array
    {
        return [
            'G' => NumberFormat::FORMAT_NUMBER,
        ];
    }

    public function headings(): array
    {
        return ['Plat Nomor', 'Slot', 'Waktu Masuk', 'Waktu Keluar', 'Durasi (menit)', 'Status', 'Biaya (Rp)'];
    }

    public function array(): array
    {
        return collect($this->data['detail_transaksi'])->map(fn($t) => [
            $t['plate_number'],
            $t['slot_code'],
            $t['entry_time'],
            $t['exit_time'],
            (int) $t['duration_minutes'],
            $t['is_member'] ? 'Member' : 'Non-Member',
            (int) $t['fee'],
        ])->toArray();
    }

    public function registerEvents(): array
    {
        $count = count($this->data['detail_transaksi']);
        $lastRow = $count > 0 ? $count + 1 : 2;

        return [
            AfterSheet::class => function (AfterSheet $event) use ($lastRow) {
                $sheet = $event->sheet->getDelegate();

                $sheet->getStyle('A1:G1')->applyFromArray([
                    'font'  => ['bold' => true, 'color' => ['argb' => 'FFFFFFFF']],
                    'fill'  => ['fillType' => 'solid', 'startColor' => ['argb' => 'FF26468A']],
                    'borders' => [
                        'bottom' => ['borderStyle' => 'thin', 'color' => ['argb' => 'FF26468A']],
                    ],
                ]);

                $sheet->freezePane('A2');

                if ($lastRow > 1) {
                    $sheet->getStyle("A2:G{$lastRow}")->applyFromArray([
                        'borders' => [
                            'allBorders' => ['borderStyle' => 'thin', 'color' => ['argb' => 'FFE2E6EE']],
                        ],
                    ]);
                    $sheet->setAutoFilter("A1:G{$lastRow}");
                }
            },
        ];
    }
}