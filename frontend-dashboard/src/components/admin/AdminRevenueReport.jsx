import React, { useState, useMemo } from 'react';
import axios from 'axios';
import {
    BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
    Download, FileSpreadsheet, FileText, Search, BarChart3,
    TrendingUp, Activity, PieChart as DonutIcon, CalendarDays
} from 'lucide-react';
import { todayWib, addDaysWib, monthFirstWib } from '../../utils/time';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const formatRupiah = (value) => `Rp ${Number(value || 0).toLocaleString('id-ID')}`;

const formatCompactRupiah = (value) => {
    const v = Number(value || 0);
    if (v >= 1_000_000) return `Rp ${(v / 1_000_000).toFixed(1)}jt`;
    if (v >= 1_000) return `Rp ${(v / 1_000).toFixed(0)}rb`;
    return `Rp ${v}`;
};

const StatCard = ({ title, value, subtitle, accentClass = 'text-gray-600' }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">{title}</h3>
        <p className={`text-3xl font-black mt-2 tracking-tight ${accentClass}`}>{value}</p>
        {subtitle && <span className="text-[10px] text-gray-400 font-medium block mt-1">{subtitle}</span>}
    </div>
);

// ─────────────────────────────────────────────────────────
// Tooltip kustom untuk chart tren harian (Bar/Line/Area)
// ─────────────────────────────────────────────────────────
const TrendTooltip = ({ active, payload, label, metric }) => {
    if (!active || !payload?.length) return null;
    const raw = payload[0].value;
    return (
        <div className="bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl border border-slate-700">
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1">{label}</p>
            <p className="text-sm font-black text-white">
                {metric === 'pendapatan' ? formatRupiah(raw) : `${raw} transaksi`}
            </p>
        </div>
    );
};

// ─────────────────────────────────────────────────────────
// Tooltip kustom untuk donut komposisi Member vs Non-Member
// ─────────────────────────────────────────────────────────
const DonutTooltip = ({ active, payload, metric, total }) => {
    if (!active || !payload?.length) return null;
    const { name, value } = payload[0];
    const pct = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
    return (
        <div className="bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl border border-slate-700">
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1">{name}</p>
            <p className="text-sm font-black text-white">
                {metric === 'pendapatan' ? formatRupiah(value) : `${value} transaksi`}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">{pct}% dari total</p>
        </div>
    );
};

const CHART_TYPES = [
    { key: 'bar',   label: 'Bar',   icon: BarChart3 },
    { key: 'line',  label: 'Line',  icon: TrendingUp },
    //{ key: 'area',  label: 'Area',  icon: Activity },
    { key: 'donut', label: 'Donut', icon: DonutIcon },
];

const RANGE_PRESETS = [
    { key: 'today',   label: 'Hari Ini' },
    { key: '7d',      label: '7 Hari Terakhir' },
    { key: '30d',     label: '30 Hari Terakhir' },
    { key: 'month',   label: 'Bulan Ini' },
];

export default function AdminRevenueReport() {
    const today = todayWib();
    const [startDate, setStartDate] = useState(today);
    const [endDate, setEndDate] = useState(today);
    const [activePreset, setActivePreset] = useState('today');
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // 🌟 State baru: kontrol visualisasi
    const [chartType, setChartType] = useState('bar');
    const [metric, setMetric] = useState('pendapatan'); // 'pendapatan' | 'transaksi'
    const [donutHovered, setDonutHovered] = useState(false);

    const token = localStorage.getItem('admin_token');
    const authHeader = { headers: { Authorization: `Bearer ${token}` } };

    const applyPreset = (key) => {
        let start = todayWib();
        let end = todayWib();

        if (key === '7d') {
            start = addDaysWib(end, -6);
        } else if (key === '30d') {
            start = addDaysWib(end, -29);
        } else if (key === 'month') {
            start = monthFirstWib();
        }

        setStartDate(start);
        setEndDate(end);
        setActivePreset(key);
    };

    const fetchReport = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await axios.get(`${API_URL}/admin/reports/revenue`, {
                ...authHeader,
                params: { start_date: startDate, end_date: endDate },
            });
            setReport(res.data.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Gagal memuat laporan.');
        } finally {
            setLoading(false);
        }
    };

    const downloadFile = async (type) => {
        try {
            const res = await axios.get(`${API_URL}/admin/reports/revenue/export-${type}`, {
                ...authHeader,
                params: { start_date: startDate, end_date: endDate },
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `laporan-pendapatan-${startDate}-sd-${endDate}.${type === 'pdf' ? 'pdf' : 'xlsx'}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            alert('Gagal mengunduh laporan.');
        }
    };

    // 🌟 Data tren harian, disesuaikan dengan metrik yang dipilih
    const trendData = useMemo(() => {
        if (!report) return [];
        return report.breakdown_periode.map((row) => ({
            tanggal: row.tanggal,
            value: metric === 'pendapatan' ? row.total_pendapatan : row.jumlah_transaksi,
        }));
    }, [report, metric]);

    // 🌟 Data komposisi Member vs Non-Member untuk donut
    const donutData = useMemo(() => {
        if (!report) return [];
        const m = report.breakdown_member;
        return [
            {
                name: 'Member',
                value: metric === 'pendapatan' ? m.member.total_pendapatan : m.member.jumlah_transaksi,
            },
            {
                name: 'Non-Member',
                value: metric === 'pendapatan' ? m.non_member.total_pendapatan : m.non_member.jumlah_transaksi,
            },
        ];
    }, [report, metric]);

    const donutTotal = useMemo(() => donutData.reduce((sum, d) => sum + d.value, 0), [donutData]);

    const donutColors = ['#059669', '#94A3B8']; // emerald = Member (konsisten dengan badge "Member Aktif" di seluruh app), slate = Non-Member

    const rataRataPerTransaksi = report && report.ringkasan.total_transaksi > 0
        ? report.ringkasan.total_pendapatan / report.ringkasan.total_transaksi
        : 0;

    const yAxisFormatter = (value) => metric === 'pendapatan' ? formatCompactRupiah(value) : value;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-black text-gray-800">Laporan Pendapatan</h1>
            </div>

            {/* Filter tanggal + preset cepat */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                    <CalendarDays size={14} className="text-gray-400" />
                    <span className="text-xs font-semibold text-gray-500 mr-1">Rentang Cepat:</span>
                    {RANGE_PRESETS.map((p) => (
                        <button
                            key={p.key}
                            onClick={() => applyPreset(p.key)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                                activePreset === p.key
                                    ? 'bg-[#26468A] text-white border-[#26468A]'
                                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                            }`}
                        >
                            {p.label}
                        </button>
                    ))}
                </div>

                <div className="flex flex-wrap items-end gap-4 pt-3 border-t border-gray-100">
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Dari Tanggal</label>
                        <input type="date" value={startDate} onChange={(e) => { setStartDate(e.target.value); setActivePreset(null); }}
                            className="border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Sampai Tanggal</label>
                        <input type="date" value={endDate} onChange={(e) => { setEndDate(e.target.value); setActivePreset(null); }}
                            className="border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                    </div>
                    <button onClick={fetchReport} disabled={loading}
                        className="flex items-center gap-2 bg-[#26468A] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#1d3872] disabled:opacity-50">
                        <Search size={16} /> {loading ? 'Memuat...' : 'Tampilkan'}
                    </button>

                    {report && (
                        <div className="flex gap-2 ml-auto">
                            <button onClick={() => downloadFile('pdf')}
                                className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-100">
                                <FileText size={16} /> Unduh PDF
                            </button>
                            <button onClick={() => downloadFile('excel')}
                                className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-emerald-100">
                                <FileSpreadsheet size={16} /> Unduh Excel
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>}

            {report && (
                <>
                    <p className="text-sm text-gray-500">
                        Periode: <strong>{report.periode.start}</strong> — <strong>{report.periode.end}</strong>
                    </p>

                    {/* Kartu ringkasan */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <StatCard
                            title="Total Pendapatan"
                            value={formatRupiah(report.ringkasan.total_pendapatan)}
                            subtitle="Akumulasi periode terpilih"
                            accentClass="text-emerald-600"
                        />
                        <StatCard
                            title="Total Transaksi"
                            value={report.ringkasan.total_transaksi}
                            subtitle="Kendaraan selesai parkir"
                            accentClass="text-[#26468A]"
                        />
                        <StatCard
                            title="Rata-rata per Transaksi"
                            value={formatRupiah(rataRataPerTransaksi)}
                            subtitle="Total pendapatan ÷ total transaksi"
                            accentClass="text-amber-600"
                        />
                    </div>

                    {/* ── VISUALISASI ── */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                            <div>
                                <h3 className="font-bold text-gray-700">Visualisasi Tren Pendapatan</h3>
                                <p className="text-xs text-gray-400 mt-0.5">
                                    {chartType === 'donut'
                                        ? 'Komposisi Member vs Non-Member pada periode terpilih.'
                                        : 'Perkembangan harian pada rentang tanggal yang dipilih.'}
                                </p>
                            </div>

                            <div className="flex flex-wrap items-center gap-3">
                                {/* Toggle metrik */}
                                <div className="flex bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
                                    {['pendapatan', 'transaksi'].map((m) => (
                                        <button
                                            key={m}
                                            onClick={() => setMetric(m)}
                                            className={`px-3 py-1.5 text-xs font-semibold capitalize transition-colors ${
                                                metric === m ? 'bg-[#26468A] text-white' : 'text-gray-600 hover:bg-gray-100'
                                            }`}
                                        >
                                            {m}
                                        </button>
                                    ))}
                                </div>

                                {/* Toggle tipe chart */}
                                <div className="flex bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
                                    {CHART_TYPES.map(({ key, label, icon: Icon }) => (
                                        <button
                                            key={key}
                                            onClick={() => setChartType(key)}
                                            title={label}
                                            className={`p-2 transition-colors ${
                                                chartType === key ? 'bg-[#26468A] text-white' : 'text-gray-500 hover:bg-gray-100'
                                            }`}
                                        >
                                            <Icon size={15} />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="h-[320px] w-full">
                            {chartType !== 'donut' && trendData.length === 0 && (
                                <div className="flex h-full items-center justify-center text-gray-400 text-sm italic bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                    Tidak ada data pada rentang ini.
                                </div>
                            )}

                            {chartType === 'bar' && trendData.length > 0 && (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={trendData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                        <XAxis dataKey="tanggal" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 11 }} dy={10} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 11 }} tickFormatter={yAxisFormatter} width={60} />
                                        <Tooltip content={<TrendTooltip metric={metric} />} cursor={{ fill: '#E2E6EE' }} />
                                        <Bar dataKey="value" fill="#26468A" radius={[6, 6, 0, 0]} maxBarSize={44} animationDuration={500} />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}

                            {chartType === 'line' && trendData.length > 0 && (
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={trendData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                        <XAxis dataKey="tanggal" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 11 }} dy={10} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 11 }} tickFormatter={yAxisFormatter} width={60} />
                                        <Tooltip content={<TrendTooltip metric={metric} />} cursor={{ stroke: '#26468A', strokeWidth: 1, strokeDasharray: '4 4' }} />
                                        <Line
                                            type="monotone"
                                            dataKey="value"
                                            stroke="#26468A"
                                            strokeWidth={3}
                                            dot={{ r: 3, strokeWidth: 2, fill: '#fff', stroke: '#26468A' }}
                                            activeDot={{ r: 6, fill: '#26468A', stroke: '#fff', strokeWidth: 2 }}
                                            animationDuration={500}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            )}

                            {chartType === 'area' && trendData.length > 0 && (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={trendData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                        <defs>
                                            <linearGradient id="revenueTrendGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#26468A" stopOpacity={0.35} />
                                                <stop offset="95%" stopColor="#26468A" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                        <XAxis dataKey="tanggal" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 11 }} dy={10} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 11 }} tickFormatter={yAxisFormatter} width={60} />
                                        <Tooltip content={<TrendTooltip metric={metric} />} cursor={{ stroke: '#26468A', strokeWidth: 1, strokeDasharray: '4 4' }} />
                                        <Area
                                            type="monotone"
                                            dataKey="value"
                                            stroke="#26468A"
                                            strokeWidth={3}
                                            fill="url(#revenueTrendGradient)"
                                            dot={{ r: 3, strokeWidth: 2, fill: '#fff', stroke: '#26468A' }}
                                            activeDot={{ r: 6, fill: '#26468A', stroke: '#fff', strokeWidth: 2 }}
                                            animationDuration={500}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            )}

                            {chartType === 'donut' && (
                                <div className="relative h-full flex items-center justify-center">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={donutData}
                                                dataKey="value"
                                                nameKey="name"
                                                innerRadius={70}
                                                outerRadius={110}
                                                paddingAngle={3}
                                                animationDuration={500}
                                                onMouseEnter={() => setDonutHovered(true)}
                                                onMouseLeave={() => setDonutHovered(false)}
                                            >
                                                {donutData.map((entry, i) => (
                                                    <Cell key={entry.name} fill={donutColors[i % donutColors.length]} stroke="#fff" strokeWidth={2} />
                                                ))}
                                            </Pie>
                                            <Tooltip content={<DonutTooltip metric={metric} total={donutTotal} />} wrapperStyle={{ zIndex: 40 }} />
                                            <Legend
                                                verticalAlign="bottom"
                                                height={36}
                                                formatter={(value) => <span className="text-xs text-gray-600 font-medium">{value}</span>}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>

                                    {/* Label total di tengah donut — fade saat hover agar tooltip tidak tersamarkan */}
                                    <div className={`absolute inset-0 flex flex-col items-center justify-center pointer-events-none transition-opacity duration-200 ${donutHovered ? 'opacity-0' : 'opacity-100'}`} style={{ marginBottom: 18, zIndex: 0 }}>
                                        <p className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold">Total</p>
                                        <p className="text-lg font-black text-gray-800">
                                            {metric === 'pendapatan' ? formatCompactRupiah(donutTotal) : donutTotal}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Breakdown member vs non-member */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h3 className="font-bold text-gray-700 mb-4">Breakdown Member vs Non-Member</h3>
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-gray-400 border-b">
                                    <th className="pb-2">Status</th><th className="pb-2">Jumlah Transaksi</th><th className="pb-2">Total Pendapatan</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b"><td className="py-2">Member</td><td>{report.breakdown_member.member.jumlah_transaksi}</td><td>{formatRupiah(report.breakdown_member.member.total_pendapatan)}</td></tr>
                                <tr><td className="py-2">Non-Member</td><td>{report.breakdown_member.non_member.jumlah_transaksi}</td><td>{formatRupiah(report.breakdown_member.non_member.total_pendapatan)}</td></tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Breakdown per periode */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h3 className="font-bold text-gray-700 mb-4">Pendapatan per Hari</h3>
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-gray-400 border-b">
                                    <th className="pb-2">Tanggal</th><th className="pb-2">Jumlah Transaksi</th><th className="pb-2">Total Pendapatan</th>
                                </tr>
                            </thead>
                            <tbody>
                                {report.breakdown_periode.map((row, i) => (
                                    <tr key={i} className="border-b last:border-0">
                                        <td className="py-2">{row.tanggal}</td><td>{row.jumlah_transaksi}</td><td>{formatRupiah(row.total_pendapatan)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Breakdown per tarif */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h3 className="font-bold text-gray-700 mb-4">Breakdown per Tarif Berlaku</h3>
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-gray-400 border-b">
                                    <th className="pb-2">Tarif/Jam</th><th className="pb-2">Berlaku Sejak</th><th className="pb-2">Jumlah Transaksi</th><th className="pb-2">Total Pendapatan</th>
                                </tr>
                            </thead>
                            <tbody>
                                {report.breakdown_tarif.map((row, i) => (
                                    <tr key={i} className="border-b last:border-0">
                                        <td className="py-2">{formatRupiah(row.tarif_per_jam)}</td><td>{row.berlaku_sejak}</td><td>{row.jumlah_transaksi}</td><td>{formatRupiah(row.total_pendapatan)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Detail transaksi */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-gray-700">Daftar Transaksi Detail</h3>
                            <span className="text-xs text-gray-400">{report.detail_transaksi.length} transaksi</span>
                        </div>
                        <div className="overflow-auto max-h-96 border border-gray-100 rounded-lg">
                            <table className="w-full text-sm whitespace-nowrap">
                                <thead className="sticky top-0 bg-gray-50 z-10">
                                    <tr className="text-left text-gray-400 border-b">
                                        <th className="py-2 px-4">Plat</th><th className="py-2 px-4">Slot</th><th className="py-2 px-4">Masuk</th>
                                        <th className="py-2 px-4">Keluar</th><th className="py-2 px-4">Durasi</th><th className="py-2 px-4">Status</th><th className="py-2 px-4">Biaya</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {report.detail_transaksi.map((t, i) => (
                                        <tr key={i} className="border-b last:border-0 hover:bg-gray-50">
                                            <td className="py-2 px-4 font-semibold">{t.plate_number}</td>
                                            <td className="px-4">{t.slot_code}</td>
                                            <td className="px-4">{t.entry_time}</td>
                                            <td className="px-4">{t.exit_time}</td>
                                            <td className="px-4">{t.duration_minutes} mnt</td>
                                            <td className="px-4">{t.is_member ? 'Member' : 'Non-Member'}</td>
                                            <td className="px-4">{formatRupiah(t.fee)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}