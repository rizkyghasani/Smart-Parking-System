import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import RevenueConfig from './RevenueConfig';
import StaffManagement from './StaffManagement';
import MemberManagement from './MemberManagement';
import SlotControl from './SlotControl';
import AdminParkingHistory from './AdminParkingHistory';

// ─────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────
const formatRupiah = (value) => `Rp ${Number(value || 0).toLocaleString('id-ID')}`;

// ─────────────────────────────────────────────────────────
// KOMPONEN KECIL: Kartu Statistik (dipakai berulang, jadi diekstrak)
// ─────────────────────────────────────────────────────────
const StatCard = ({ title, value, subtitle, accentClass = 'text-gray-600', pulse = false }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 transition-all hover:shadow-md">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">{title}</h3>
        <p className={`text-3xl font-black mt-2 tracking-tight ${accentClass} ${pulse ? 'animate-pulse' : ''}`}>
            {value}
        </p>
        <span className="text-[10px] text-gray-400 font-medium block mt-1">{subtitle}</span>
    </div>
);

// ─────────────────────────────────────────────────────────
// KOMPONEN KECIL: Tooltip kustom untuk grafik pendapatan
// ─────────────────────────────────────────────────────────
const RevenueTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl border border-slate-700">
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1">{label}</p>
            <p className="text-sm font-black text-emerald-400">{formatRupiah(payload[0].value)}</p>
        </div>
    );
};

// ─────────────────────────────────────────────────────────
// KOMPONEN KECIL: Skeleton loading untuk area grafik
// ─────────────────────────────────────────────────────────
const ChartSkeleton = () => (
    <div className="h-full w-full flex items-end gap-2 px-2 animate-pulse">
        {[40, 65, 50, 80, 55, 70, 45].map((h, i) => (
            <div key={i} className="flex-1 bg-slate-100 rounded-t-lg" style={{ height: `${h}%` }} />
        ))}
    </div>
);

const NAV_ITEMS = [
    { key: 'dashboard', label: 'Dashboard Utama',       icon: '📊' },
    { key: 'revenue',   label: 'Kelola Tarif Parkir',   icon: '💰' },
    { key: 'staff',     label: 'Manajemen Petugas',     icon: '👥' },
    { key: 'slots',     label: 'Manajemen Status Slot', icon: '🅿️' },
    { key: 'members',   label: 'Manajemen Member',      icon: '⭐' },
    { key: 'history',   label: 'Riwayat Transaksi',     icon: '📜' },
];

const TIME_FILTER_OPTIONS = [
    { value: '7_days',    label: '7 Hari Terakhir' },
    { value: '30_days',   label: '30 Hari Terakhir' },
    { value: 'this_year', label: 'Tahun Ini' },
];

const AdminLayout = ({ onLogoutSuccess }) => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const [timeFilter, setTimeFilter] = useState('7_days');
    const [chartData, setChartData] = useState([]);

    const [stats, setStats] = useState({
        total_revenue: 0,
        active_staff_count: 0,
        violation_count: 0,
    });
    const [loadingStats, setLoadingStats] = useState(false);

    const adminUser = JSON.parse(localStorage.getItem('admin_user') || '{}');
    const token = localStorage.getItem('admin_token');

    useEffect(() => {
        if (activeTab === 'dashboard') {
            fetchDashboardStats();
        }
    }, [activeTab, timeFilter]);

    const fetchDashboardStats = async () => {
        setLoadingStats(true);
        try {
            const res = await axios.get('http://localhost:8000/api/admin/dashboard-stats', {
                headers: { Authorization: `Bearer ${token}` },
                params: { filter: timeFilter },
            });
            if (res.data.success) {
                setStats(res.data.data);
                setChartData(res.data.data.chart_data || []);
            }
        } catch (error) {
            console.error('Gagal mengambil ringkasan data statistik dashboard.');
        } finally {
            setLoadingStats(false);
        }
    };

    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            await axios.post('http://localhost:8000/api/admin/auth/logout', {}, {
                headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
            });
        } catch (error) {
            console.error('Sesi backend sudah kedaluwarsa.');
        } finally {
            localStorage.removeItem('admin_token');
            localStorage.removeItem('admin_user');
            setIsLoggingOut(false);
            alert('Anda telah keluar dari sistem secara aman.');
            onLogoutSuccess();
        }
    };

    // ── Ringkasan total pendapatan dari chartData (untuk header grafik) ──
    const chartTotal = chartData.reduce((sum, d) => sum + Number(d.pendapatan || 0), 0);

    const renderDashboard = () => (
        <div className="p-6 h-full flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">
                        Selamat Datang, {adminUser.name || 'Admin'}
                    </h2>
                    <p className="text-sm text-gray-500">
                        Silakan pilih menu di samping untuk mengelola operasional Smart Parking.
                    </p>
                </div>
                <button
                    onClick={fetchDashboardStats}
                    disabled={loadingStats}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 disabled:opacity-60"
                >
                    <span className={loadingStats ? 'animate-spin' : ''}>🔄</span>
                    {loadingStats ? 'Memuat...' : 'Refresh Data'}
                </button>
            </div>

            {/* Kartu Statistik */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-2">
                <StatCard
                    title="Total Kas Masuk"
                    value={formatRupiah(stats.total_revenue)}
                    subtitle="Akumulasi pendapatan keseluruhan"
                    accentClass="text-emerald-600"
                />
                <StatCard
                    title="Akun Staf Aktif"
                    value={<>{stats.active_staff_count} <span className="text-xs font-normal text-gray-400">Petugas</span></>}
                    subtitle="Siap bertugas di sirkulasi pos"
                    accentClass="text-blue-600"
                />
                <StatCard
                    title="Log Pelanggaran"
                    value={<>{stats.violation_count} <span className="text-xs font-normal text-gray-400">Alarms</span></>}
                    subtitle="Mismatch kamera AI YOLOv8"
                    accentClass={stats.violation_count > 0 ? 'text-rose-600' : 'text-gray-600'}
                    pulse={stats.violation_count > 0}
                />
            </div>

            {/* GRAFIK PENDAPATAN */}
            <div className="mt-8 bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex-1 min-h-[350px]">
                <div className="flex justify-between items-center mb-2 flex-wrap gap-3">
                    <div>
                        <h3 className="text-lg font-bold text-gray-800">Tren Pendapatan Parkir</h3>
                        <p className="text-xs text-gray-500">Visualisasi pemasukan kotor dari transaksi selesai.</p>
                    </div>
                    <select
                        value={timeFilter}
                        onChange={(e) => setTimeFilter(e.target.value)}
                        className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2 font-semibold cursor-pointer outline-none"
                    >
                        {TIME_FILTER_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>

                {chartData.length > 0 && (
                    <p className="text-2xl font-black text-emerald-600 tracking-tight mb-4">
                        {formatRupiah(chartTotal)}
                        <span className="text-xs font-medium text-gray-400 ml-2">total pada rentang ini</span>
                    </p>
                )}

                <div className="h-[250px] w-full">
                    {loadingStats ? (
                        <ChartSkeleton />
                    ) : chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                <defs>
                                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#059669" stopOpacity={0.35} />
                                        <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis
                                    dataKey="tanggal"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#9CA3AF', fontSize: 12 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#9CA3AF', fontSize: 12 }}
                                    tickFormatter={(value) => `Rp ${(value / 1000).toLocaleString('id-ID')}k`}
                                    width={60}
                                />
                                <Tooltip
                                    content={<RevenueTooltip />}
                                    cursor={{ stroke: '#059669', strokeWidth: 1, strokeDasharray: '4 4' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="pendapatan"
                                    stroke="#059669"
                                    strokeWidth={3}
                                    fill="url(#revenueGradient)"
                                    dot={{ r: 3, strokeWidth: 2, fill: '#fff', stroke: '#059669' }}
                                    activeDot={{ r: 6, fill: '#059669', stroke: '#fff', strokeWidth: 2 }}
                                    animationDuration={600}
                                    animationEasing="ease-out"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex h-full items-center justify-center text-gray-400 text-sm italic bg-slate-50 rounded-xl border border-dashed border-slate-200">
                            Tidak ada data transaksi pada rentang waktu ini.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    const renderContent = () => {
        switch (activeTab) {
            case 'revenue': return <RevenueConfig />;
            case 'staff':   return <StaffManagement />;
            case 'slots':   return <SlotControl />;
            case 'members': return <MemberManagement />;
            case 'history': return <AdminParkingHistory />;
            case 'dashboard':
            default:        return renderDashboard();
        }
    };

    return (
        <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
            {/* ── SIDEBAR ──────────────────────────────────────────── */}
            <aside className={`bg-slate-900 text-slate-200 flex flex-col justify-between shadow-lg transition-all duration-300 ease-in-out overflow-hidden ${sidebarOpen ? 'w-64' : 'w-0'}`}>
                <div>
                    <div className="p-5 border-b border-slate-800 flex items-center space-x-3 whitespace-nowrap">
                        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white text-lg flex-shrink-0">P</div>
                        <span className="font-bold text-lg tracking-wider text-white">PARKING ADMIN</span>
                    </div>
                    <nav className="p-4 space-y-2">
                        {NAV_ITEMS.map(({ key, label, icon }) => (
                            <button
                                key={key}
                                onClick={() => setActiveTab(key)}
                                className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all whitespace-nowrap flex items-center gap-3 ${activeTab === key ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'}`}
                            >
                                <span className="text-lg opacity-80">{icon}</span>
                                <span>{label}</span>
                            </button>
                        ))}
                    </nav>
                </div>
                <div className="p-4 border-t border-slate-800">
                    <button
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className="w-full text-left px-4 py-3 rounded-lg text-sm font-medium text-rose-400 hover:bg-slate-800 hover:text-rose-300 disabled:text-slate-600 transition-all flex items-center gap-3 whitespace-nowrap"
                    >
                        <span className="text-lg opacity-80">❌</span>
                        <span>{isLoggingOut ? 'Mencabut Sesi...' : 'Keluar Sistem'}</span>
                    </button>
                </div>
            </aside>

            {/* ── MAIN CONTENT ─────────────────────────────────────── */}
            <main className="flex-1 flex flex-col overflow-y-auto min-w-0">
                <header className="bg-white h-16 border-b border-gray-200 flex items-center justify-between px-6 shadow-sm flex-shrink-0">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setSidebarOpen((prev) => !prev)}
                            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-all"
                            title={sidebarOpen ? 'Tutup sidebar' : 'Buka sidebar'}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                {sidebarOpen
                                    ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />}
                            </svg>
                        </button>
                        <span className="text-sm font-medium text-gray-500">Sistem Parkir Cerdas &bull; Panel Admin</span>
                    </div>
                    <div className="flex items-center space-x-3">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-sm text-gray-700 font-medium capitalize">Mode {adminUser.role || 'Administrator'}</span>
                    </div>
                </header>
                <div className="p-8 h-[calc(100vh-4rem)] overflow-y-auto">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200/80 min-h-full">
                        {renderContent()}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;