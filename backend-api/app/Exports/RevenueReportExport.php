<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\WithMultipleSheets;
use Maatwebsite\Excel\Concerns\WithProperties;

class RevenueReportExport implements WithMultipleSheets, WithProperties
{
    protected array $data;

    public function __construct(array $data)
    {
        $this->data = $data;
    }

    public function properties(): array
    {
        return [
            'creator'     => 'Smart Parking System',
            'title'       => 'Laporan Pendapatan Parkir',
            'description' => 'Laporan pendapatan periode '
                . ($this->data['periode']['start'] ?? '')
                . ' sampai '
                . ($this->data['periode']['end'] ?? ''),
            'subject' => 'Laporan Pendapatan',
            'company' => 'Smart Parking System',
        ];
    }

    public function sheets(): array
    {
        return [
            new RevenueSummarySheet($this->data),
            new RevenueDetailSheet($this->data),
        ];
    }
}