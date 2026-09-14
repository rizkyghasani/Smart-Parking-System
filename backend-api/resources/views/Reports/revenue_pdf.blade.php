<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <style>
        @page {
            size: a4 landscape;
            margin: 14mm 12mm 18mm 12mm;
            @bottom-left {
                content: "Smart Parking System";
                font-size: 9px;
                color: #667085;
            }
            @bottom-right {
                content: "Halaman " counter(page) " dari " counter(pages);
                font-size: 9px;
                color: #667085;
            }
        }

        * { box-sizing: border-box; }
        body {
            font-family: "DejaVu Sans", sans-serif;
            font-size: 10px;
            color: #101828;
            margin: 0;
            padding: 0;
        }

        .kop { border-bottom: 3px solid #26468A; padding-bottom: 8px; margin-bottom: 12px; }
        .brand { font-size: 20px; font-weight: bold; color: #26468A; }
        .judul { font-size: 14px; font-weight: bold; color: #101828; margin-top: 2px; }
        .info { font-size: 10px; color: #667085; margin-top: 4px; }

        h3 {
            margin: 14px 0 6px;
            font-size: 11px;
            color: #26468A;
            border-left: 4px solid #26468A;
            padding-left: 8px;
            page-break-after: avoid;
        }

        table { width: 100%; border-collapse: collapse; margin-top: 4px; }
        th, td { border: 1px solid #E2E6EE; padding: 5px 6px; text-align: left; vertical-align: top; }
        th {
            background: #26468A;
            color: #ffffff;
            font-weight: bold;
            font-size: 9px;
            text-transform: uppercase;
        }
        tbody tr:nth-child(even) td { background: #F3F5F9; }

        .stats { table-layout: fixed; border-spacing: 8px 0; margin-left: -8px; width: calc(100% + 16px); border-collapse: collapse; }
        .stats td {
            width: 33.33%;
            background: #F3F5F9;
            border: 1px solid #E2E6EE;
            border-radius: 8px;
            padding: 10px 12px;
        }
        .stats .label { display: block; font-size: 9px; color: #667085; text-transform: uppercase; letter-spacing: 0.5px; }
        .stats .value { display: block; font-size: 15px; font-weight: bold; color: #101828; margin-top: 4px; }
        .stats .value.emerald { color: #059669; }
        .stats .value.indigo { color: #26468A; }
        .stats .value.amber { color: #B76E1B; }

        .right { text-align: right; }
        .muted { color: #667085; }
        .footer-note { margin-top: 14px; font-size: 9px; color: #98A2B3; }
        .page-break { page-break-before: always; }
    </style>
</head>
<body>

    <div class="kop">
        <div class="brand">Smart Parking System</div>
        <div class="judul">Laporan Pendapatan Parkir</div>
        <div class="info">
            Periode: {{ $data['periode']['start'] }} — {{ $data['periode']['end'] }}
            &nbsp;|&nbsp; Dibuat: {{ now()->format('d M Y H:i') }}
        </div>
    </div>

    @php
        $fmt = fn($v) => 'Rp ' . number_format((int) $v, 0, ',', '.');
        $totalPendapatan = (int) ($data['ringkasan']['total_pendapatan'] ?? 0);
        $totalTransaksi  = (int) ($data['ringkasan']['total_transaksi'] ?? 0);
        $rataRata = $totalTransaksi > 0 ? (int) ($totalPendapatan / $totalTransaksi) : 0;
        $member = $data['breakdown_member'];
    @endphp

    <table class="stats" cellspacing="8">
        <tr>
            <td>
                <span class="label">Total Pendapatan</span>
                <span class="value emerald">{{ $fmt($totalPendapatan) }}</span>
            </td>
            <td>
                <span class="label">Total Transaksi</span>
                <span class="value indigo">{{ $totalTransaksi }} transaksi</span>
            </td>
            <td>
                <span class="label">Rata-rata per Transaksi</span>
                <span class="value amber">{{ $fmt($rataRata) }}</span>
            </td>
        </tr>
    </table>

    <h3>Breakdown Member vs Non-Member</h3>
    <table>
        <thead>
            <tr><th>Status</th><th>Jumlah Transaksi</th><th>Total Pendapatan</th></tr>
        </thead>
        <tbody>
            <tr><td>Member</td><td>{{ $member['member']['jumlah_transaksi'] }}</td><td>{{ $fmt($member['member']['total_pendapatan']) }}</td></tr>
            <tr><td>Non-Member</td><td>{{ $member['non_member']['jumlah_transaksi'] }}</td><td>{{ $fmt($member['non_member']['total_pendapatan']) }}</td></tr>
        </tbody>
    </table>

    <h3>Breakdown per Tarif Berlaku</h3>
    <table>
        <thead>
            <tr><th>Tarif/Jam</th><th>Berlaku Sejak</th><th>Jumlah Transaksi</th><th>Total Pendapatan</th></tr>
        </thead>
        <tbody>
            @forelse ($data['breakdown_tarif'] as $t)
            <tr>
                <td>{{ $fmt($t['tarif_per_jam']) }}</td>
                <td>{{ $t['berlaku_sejak'] }}</td>
                <td>{{ $t['jumlah_transaksi'] }}</td>
                <td>{{ $fmt($t['total_pendapatan']) }}</td>
            </tr>
            @empty
            <tr><td colspan="4" class="muted">Tidak ada data tarif aktif pada periode ini.</td></tr>
            @endforelse
        </tbody>
    </table>

    <h3>Pendapatan per Hari</h3>
    <table>
        <thead>
            <tr><th>Tanggal</th><th>Jumlah Transaksi</th><th>Total Pendapatan</th></tr>
        </thead>
        <tbody>
            @forelse ($data['breakdown_periode'] as $p)
            <tr>
                <td>{{ $p['tanggal'] }}</td>
                <td>{{ $p['jumlah_transaksi'] }}</td>
                <td>{{ $fmt($p['total_pendapatan']) }}</td>
            </tr>
            @empty
            <tr><td colspan="3" class="muted">Tidak ada transaksi pada periode ini.</td></tr>
            @endforelse
        </tbody>
    </table>

    <h3 class="page-break-heading" style="margin-top:18px;">Rincian Transaksi</h3>
    <table>
        <thead>
            <tr>
                <th>Plat</th><th>Slot</th><th>Waktu Masuk</th><th>Waktu Keluar</th>
                <th>Durasi</th><th>Status</th><th class="right">Biaya</th>
            </tr>
        </thead>
        <tbody>
            @forelse ($data['detail_transaksi'] as $t)
            <tr>
                <td><strong>{{ $t['plate_number'] }}</strong></td>
                <td>{{ $t['slot_code'] }}</td>
                <td>{{ $t['entry_time'] }}</td>
                <td>{{ $t['exit_time'] }}</td>
                <td>{{ $t['duration_minutes'] }} mnt</td>
                <td>{{ $t['is_member'] ? 'Member' : 'Non-Member' }}</td>
                <td class="right">{{ $fmt($t['fee']) }}</td>
            </tr>
            @empty
            <tr><td colspan="7" class="muted">Tidak ada transaksi pada periode ini.</td></tr>
            @endforelse
        </tbody>
    </table>

    <div class="footer-note">
        Dokumen ini dihasilkan otomatis oleh Smart Parking System. Segala biaya tercantum dalam Rupiah (Rp) dan
        sudah memperhitungkan status keanggotaan (member = Rp 0).
    </div>

</body>
</html>