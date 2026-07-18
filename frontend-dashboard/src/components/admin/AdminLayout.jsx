import React, { useState, useEffect } from 'react';
import axios from 'axios';
import RevenueConfig from './RevenueConfig';
import StaffManagement from './StaffManagement';
import MemberManagement from './MemberManagement'; // Sesuaikan path foldernya
import SlotControl from './SlotControl';

const AdminLayout = ({ onLogoutSuccess }) => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(true); // ← state sidebar

    const [stats, setStats] = useState({
        total_revenue: 0,
        active_staff_count: 0,
        violation_count: 0
    });
    const [loadingStats, setLoadingStats] = useState(false);

    const adminUser = JSON.parse(localStorage.getItem('admin_user') || '{}');
    const token = localStorage.getItem('admin_token');

    useEffect(() => {
        if (activeTab === 'dashboard') {
            fetchDashboardStats();
        }
    }, [activeTab]);

    const fetchDashboardStats = async () => {
        setLoadingStats(true);
        try {
            const res = await axios.get('http://localhost:8000/api/admin/dashboard-stats', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) setStats(res.data.data);
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
                headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
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

    const navItems = [
        { key: 'dashboard', label: 'Dashboard Utama',      icon: '' },
        { key: 'revenue',   label: 'Kelola Tarif Parkir',  icon: '' },
        { key: 'staff',     label: 'Manajemen Petugas',    icon: '' },
        { key: 'slots',     label: 'Manajemen Status Slot', icon: '' },
        { key: 'members',   label: 'Manajemen Member',      icon: '' },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'revenue':   return <RevenueConfig />;
            case 'staff':     return <StaffManagement />;
            case 'slots':     return <SlotControl />;
            case 'members':   return <MemberManagement />;
            case 'dashboard':
            default:
                return (
                    <div className="p-6">
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
                                className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
                            >
                                {loadingStats ? '🔄 Memuat...' : '🔄 Refresh Data'}
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 transition-all hover:shadow-md">
                                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Total Pendapatan</h3>
                                <p className="text-3xl font-black text-emerald-600 mt-2 tracking-tight">
                                    Rp {stats.total_revenue.toLocaleString('id-ID')}
                                </p>
                                <span className="text-[10px] text-gray-400 font-medium block mt-1">Akumulasi pendapatan kas</span>
                            </div>
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 transition-all hover:shadow-md">
                                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Akun Staf Aktif</h3>
                                <p className="text-3xl font-black text-blue-600 mt-2 tracking-tight">
                                    {stats.active_staff_count}{' '}
                                    <span className="text-xs font-normal text-gray-400">Petugas</span>
                                </p>
                                <span className="text-[10px] text-gray-400 font-medium block mt-1">Siap bertugas di sirkulasi pos</span>
                            </div>
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 transition-all hover:shadow-md">
                                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Log Pelanggaran</h3>
                                <p className={`text-3xl font-black mt-2 tracking-tight ${stats.violation_count > 0 ? 'text-rose-600 animate-pulse' : 'text-gray-600'}`}>
                                    {stats.violation_count}{' '}
                                    <span className="text-xs font-normal text-gray-400">Alarms</span>
                                </p>
                                <span className="text-[10px] text-gray-400 font-medium block mt-1">Mismatch kamera AI YOLOv8</span>
                            </div>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">

            {/* ── SIDEBAR ──────────────────────────────────────────── */}
            <aside
                className={`
                    bg-slate-900 text-slate-200 flex flex-col justify-between shadow-lg
                    transition-all duration-300 ease-in-out overflow-hidden
                    ${sidebarOpen ? 'w-64' : 'w-0'}
                `}
            >
                {/* Logo */}
                <div>
                    <div className="p-5 border-b border-slate-800 flex items-center space-x-3 whitespace-nowrap">
                        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white text-lg flex-shrink-0">
                            P
                        </div>
                        <span className="font-bold text-lg tracking-wider text-white">PARKING ADMIN</span>
                    </div>

                    {/* Nav items */}
                    <nav className="p-4 space-y-2">
                        {navItems.map(({ key, label, icon }) => (
                            <button
                                key={key}
                                onClick={() => setActiveTab(key)}
                                className={`
                                    w-full text-left px-4 py-3 rounded-lg text-sm font-medium
                                    transition-all whitespace-nowrap flex items-center gap-2
                                    ${activeTab === key
                                        ? 'bg-blue-600 text-white shadow-md'
                                        : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
                                    }
                                `}
                            >
                                <span>{icon}</span>
                                <span>{label}</span>
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Logout */}
                <div className="p-4 border-t border-slate-800">
                    <button
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className="w-full text-left px-4 py-3 rounded-lg text-sm font-medium text-rose-400 hover:bg-slate-800 hover:text-rose-300 disabled:text-slate-600 transition-all flex items-center space-x-2 whitespace-nowrap"
                    >
                        <span>❌</span>
                        <span>{isLoggingOut ? 'Mencabut Sesi...' : 'Keluar Sistem'}</span>
                    </button>
                </div>
            </aside>

            {/* ── MAIN CONTENT ─────────────────────────────────────── */}
            <main className="flex-1 flex flex-col overflow-y-auto min-w-0">

                {/* Header */}
                <header className="bg-white h-16 border-b border-gray-200 flex items-center justify-between px-6 shadow-sm flex-shrink-0">
                    <div className="flex items-center gap-4">

                        {/* ← TOMBOL TOGGLE SIDEBAR */}
                        <button
                            onClick={() => setSidebarOpen(prev => !prev)}
                            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-all"
                            title={sidebarOpen ? 'Tutup sidebar' : 'Buka sidebar'}
                        >
                            {/* Hamburger / Close icon */}
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="w-5 h-5"
                                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                            >
                                {sidebarOpen
                                    ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                                }
                            </svg>
                        </button>

                        <span className="text-sm font-medium text-gray-500">
                            Sistem Parkir Cerdas &bull; Panel Admin
                        </span>
                    </div>

                    <div className="flex items-center space-x-3">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-sm text-gray-700 font-medium capitalize">
                            Mode {adminUser.role || 'Administrator'}
                        </span>
                    </div>
                </header>

                {/* Content */}
                <div className="p-8">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200/80 min-h-[500px]">
                        {renderContent()}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;