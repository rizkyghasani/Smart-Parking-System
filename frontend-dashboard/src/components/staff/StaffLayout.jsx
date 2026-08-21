import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { echo } from '../../services/echo';
import SpatialParkingLayout from '../../SpatialParkingLayout';
import LiveSlotMonitor from './LiveSlotMonitor';
import NotificationCenter from './NotificationCenter';
import ManualVerificationModal from './ManualVerificationModal';
import ManualTapOutHistory from './ManualTapOutHistory';
import NotificationPage from './NotificationPage';
import { LayoutDashboard, List, Bell, Car, X, LogOut, FileText, ClipboardList } from 'lucide-react';

const StaffLayout = ({ onLogout }) => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    // State untuk Modal Verifikasi STNK (Mobil UNKNOWN)
    const [showStnkModal, setShowStnkModal] = useState(false);
    const [targetTxIdForStnk, setTargetTxIdForStnk] = useState(null);

    const [dashboardStats, setDashboardStats] = useState(null);
    const [slots, setSlots] = useState([]);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [notifications, setNotifications] = useState([]);

    const [showManualTapOutModal, setShowManualTapOutModal] = useState(false);
    const [manualPlateInput, setManualPlateInput] = useState('');
    const [loadingManualTapOut, setLoadingManualTapOut] = useState(false);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
    const token = localStorage.getItem('staff_token');
    const staffUser = JSON.parse(localStorage.getItem('staff_user') || '{}');

    const axiosInstance = axios.create({
        baseURL: API_URL,
        headers: { Authorization: `Bearer ${token}` }
    });

    const fetchData = useCallback(async () => {
        try {
            const [statsRes, slotsRes, notifRes] = await Promise.all([
                axiosInstance.get('/staff/dashboard'),
                axiosInstance.get('/parking/slots'),
                axiosInstance.get('/staff/notifications')
            ]);
            setDashboardStats(statsRes.data.data);
            setSlots(slotsRes.data.data);
            setNotifications(notifRes.data.data);
        } catch (error) {
            console.error("Gagal mengambil data staff:", error);
        }
    }, []);

    const fetchNotificationsOnly = useCallback(async () => {
        try {
            const res = await axiosInstance.get('/staff/notifications');
            setNotifications(res.data.data);
        } catch (error) {
            console.error("Gagal mengambil notifikasi:", error);
        }
    }, []);

    useEffect(() => {
        fetchData();

        // WebSocket listener untuk update slot & stats real-time (instan kalau berhasil terkirim)
        const channel = echo.channel('parking-channel');
        channel.listen('.SlotUpdated', (e) => {
            setSlots(prev => prev.map(slot => slot.id === e.slot.id ? { ...slot, ...e.slot } : slot));
            fetchData();
        });

        // Polling notifikasi tiap 8 detik
        const notifInterval = setInterval(fetchNotificationsOnly, 8000);

        // 🌟 BARU: Polling cadangan untuk dashboard stats & denah tiap 10 detik.
        // Ini jaring pengaman kalau broadcast WebSocket (.SlotUpdated) gagal terkirim
        const dataInterval = setInterval(fetchData, 10000);

        return () => {
            channel.stopListening('.SlotUpdated');
            clearInterval(notifInterval);
            clearInterval(dataInterval);
        };
    }, [fetchData, fetchNotificationsOnly]);

    const handleStaffTapOut = async (slotId) => {
        if(!window.confirm('Proses tap-out manual untuk slot ini?')) return;
        try {
            await axiosInstance.post(`/staff/tap-out/${slotId}`);
            alert('Tap-out manual berhasil.');
            fetchData();
        } catch (error) {
            alert('Gagal tap-out: ' + (error.response?.data?.message || 'Error'));
        }
    };

    const handleManualTapOutSubmit = async (e) => {
        e.preventDefault();
        if (!manualPlateInput.trim()) {
            alert('Silakan masukkan nomor plat kendaraan.');
            return;
        }

        if (!window.confirm(`Proses keluar manual untuk kendaraan dengan plat ${manualPlateInput.toUpperCase()}?`)) return;

        setLoadingManualTapOut(true);
        try {
            const response = await axiosInstance.post('/staff/tap-out-by-plate', {
                plate_number: manualPlateInput.trim()
            });

            const data = response.data;
            alert(`Tap-Out Manual Berhasil!\nPlat: ${data.plate_number || manualPlateInput}\nTotal Biaya: Rp ${Number(data.total_fee || 0).toLocaleString('id-ID')}`);
            
            setManualPlateInput('');
            setShowManualTapOutModal(false);
            fetchData();
        } catch (error) {
            alert('Gagal Tap-Out: ' + (error.response?.data?.message || 'Kendaraan tidak ditemukan atau sudah keluar.'));
        } finally {
            setLoadingManualTapOut(false);
        }
    };

    const handleLogout = async () => {
        setIsLoggingOut(true);
        localStorage.removeItem('staff_token');
        localStorage.removeItem('staff_user');
        setIsLoggingOut(false);
        
        if (typeof onLogout === 'function') {
            onLogout();
        } else {
            window.location.reload(); 
        }
    };

    // 🌟 Fungsi untuk mentrigger modal Verifikasi STNK jika dibutuhkan
    // Bisa dipanggil dari komponen anak (seperti NotificationCenter) dengan passing function
    const openStnkVerification = (transactionId) => {
        setTargetTxIdForStnk(transactionId);
        setShowStnkModal(true);
    };

    const navItems = [
        { key: 'dashboard', label: 'Area Parkir & Status', icon: <LayoutDashboard size={18} /> },
        { key: 'monitor',   label: 'Live Monitoring Slot', icon: <List size={18} /> },
        { key: 'history',   label: 'Riwayat Tap-Out Manual', icon: <ClipboardList size={18} /> },
        { key: 'notifications', label: 'Pusat Notifikasi', icon: <Bell size={18} /> },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'monitor': return <LiveSlotMonitor />;
            case 'history': return <ManualTapOutHistory />;
            case 'notifications': return (
                <NotificationPage 
                    notifications={notifications}
                    refreshData={fetchData}
                    onNavigateToMonitor={() => setActiveTab('monitor')}
                    onOpenManualVerification={openStnkVerification}
                />
            );
            case 'dashboard':
            default:
                if (!dashboardStats) return <div className="p-10 text-center text-gray-500">Memuat Panel Staff...</div>;
                return (
                    <div className="p-6 h-full flex flex-col">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800">
                                    Selamat Bertugas, {staffUser.name || 'Petugas'}
                                </h2>
                                <p className="text-sm text-gray-500">Pantau ketersediaan slot parkir secara real-time.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
                                <p className="text-xs text-gray-500 uppercase font-bold tracking-widest">Tersedia</p>
                                <p className="text-3xl font-black text-emerald-600 mt-1">{dashboardStats.slots.available}</p>
                            </div>
                            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
                                <p className="text-xs text-gray-500 uppercase font-bold tracking-widest">Terisi</p>
                                <p className="text-3xl font-black text-blue-600 mt-1">{dashboardStats.slots.occupied}</p>
                            </div>
                            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
                                <p className="text-xs text-gray-500 uppercase font-bold tracking-widest">Transaksi Aktif</p>
                                <p className="text-3xl font-black text-gray-800 mt-1">{dashboardStats.active_transactions_count}</p>
                            </div>
                            <button
                                onClick={() => setActiveTab('monitor')}
                                className="bg-rose-50 p-5 rounded-2xl border border-rose-200 shadow-sm text-left hover:bg-rose-100 hover:border-rose-300 hover:shadow-md active:scale-[0.98] transition-all cursor-pointer"
                            >
                                <p className="text-xs text-rose-600 uppercase font-bold tracking-widest">Pelanggaran</p>
                                <p className="text-3xl font-black text-rose-600 mt-1">{dashboardStats.slots.violation}</p>
                            </button>
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex-1">
                            <div className="mb-4">
                                <h3 className="text-lg font-bold text-gray-800">Denah Visual Layout</h3>
                            </div>
                            <div className="rounded-xl overflow-hidden border border-gray-200 bg-slate-900 p-2">
                                <SpatialParkingLayout 
                                    slots={slots}
                                    selectedSlot={selectedSlot}
                                    setSelectedSlot={setSelectedSlot}
                                    handleTapOut={handleStaffTapOut} 
                                />
                            </div>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
            <aside className={`bg-slate-900 text-slate-200 flex flex-col justify-between shadow-lg transition-all duration-300 ease-in-out overflow-hidden ${sidebarOpen ? 'w-64' : 'w-0'}`}>
                <div>
                    <div className="p-5 border-b border-slate-800 flex items-center space-x-3 whitespace-nowrap">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center font-bold text-white text-lg flex-shrink-0">
                            S
                        </div>
                        <span className="font-bold text-lg tracking-wider text-white">STAFF PANEL</span>
                    </div>
                    <nav className="p-4 space-y-2">
                        {navItems.map(({ key, label, icon }) => (
                        <button
                            key={key}
                            onClick={() => setActiveTab(key)}
                            className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all whitespace-nowrap flex items-center justify-between cursor-pointer ${activeTab === key ? 'bg-emerald-600 text-white shadow-md' : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'}`}
                        >
                            <div className="flex items-center gap-3">
                                <span className="opacity-80">{icon}</span>
                                <span>{label}</span>
                            </div>
                            
                            {/* Munculkan Badge Angka jika menu tersebut adalah notifications dan ada pesan baru */}
                            {key === 'notifications' && notifications.filter(n => n.read_at === null).length > 0 && (
                                <span className="bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-md animate-pulse">
                                    {notifications.filter(n => n.read_at === null).length}
                                </span>
                            )}
                        </button>
                        ))}
                    </nav>
                </div>
                <div className="p-4 border-t border-slate-800">
                    <button onClick={handleLogout} disabled={isLoggingOut} className="w-full text-left px-4 py-3 rounded-lg text-sm font-medium text-rose-400 hover:bg-slate-800 hover:text-rose-300 disabled:text-slate-600 transition-all flex items-center gap-3 whitespace-nowrap cursor-pointer">
                        <span className="opacity-80"></span>
                        <span>{isLoggingOut ? 'Memproses..' : 'Keluar'}</span>
                    </button>
                </div>
            </aside>

            <main className="flex-1 flex flex-col overflow-y-auto min-w-0">
                <header className="bg-white h-16 border-b border-gray-200 flex items-center justify-between px-6 shadow-sm flex-shrink-0">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setSidebarOpen(prev => !prev)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-all cursor-pointer">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                {sidebarOpen ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />}
                            </svg>
                        </button>
                        <span className="text-sm font-medium text-gray-500">Operasional Parkir Lapangan</span>
                    </div>
                    <div className="flex items-center space-x-4">
                        <button 
                            onClick={() => setIsNotifOpen(true)}
                            className="relative text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                        >
                            <Bell size={20} />
                            {notifications.filter(n => n.read_at === null).length > 0 && (
                                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] font-black w-4 h-4 flex items-center justify-center rounded-full shadow-md animate-pulse">
                                    {notifications.filter(n => n.read_at === null).length}
                                </span>
                            )}
                        </button>
                        <div className="flex items-center space-x-2 border-l border-gray-200 pl-4">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-sm text-gray-700 font-medium">Online</span>
                        </div>
                    </div>
                </header>
                <div className="p-8 h-[calc(100vh-4rem)] overflow-y-auto">
                    {renderContent()}
                </div>
            </main>

                <NotificationCenter 
                    isOpen={isNotifOpen} 
                    onClose={() => setIsNotifOpen(false)} 
                    notifications={notifications}
                    refreshData={fetchData}
                    onNavigateToMonitor={() => {
                        setActiveTab('monitor');
                        setIsNotifOpen(false);
                    }}
                    onOpenManualVerification={openStnkVerification}  
                />

            {/* MODAL MANUAL TAP-OUT BERDASARKAN PLAT */}
            {showManualTapOutModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-900 border border-slate-700 p-6 rounded-3xl w-full max-w-md shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <Car className="text-rose-500" size={20} /> Manual Tap-Out Kendaraan
                            </h3>
                            <button 
                                onClick={() => setShowManualTapOutModal(false)}
                                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleManualTapOutSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs text-slate-400 uppercase tracking-widest font-bold mb-2">
                                    Masukkan Nomor Plat Terdaftar
                                </label>
                                <input 
                                    type="text" 
                                    className="w-full bg-slate-950 border border-slate-700 text-white font-black tracking-widest text-lg p-3.5 rounded-xl focus:border-blue-500 focus:outline-none uppercase"
                                    placeholder="Contoh: K 141 KU"
                                    value={manualPlateInput}
                                    onChange={(e) => setManualPlateInput(e.target.value)}
                                    required
                                    autoFocus
                                />
                                <p className="text-xs text-slate-500 mt-2">
                                    Sistem akan mencari transaksi aktif berdasarkan plat nomor ini, memproses keluar, dan menghitung total biaya secara otomatis.
                                </p>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button 
                                    type="button" 
                                    onClick={() => setShowManualTapOutModal(false)} 
                                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-3 rounded-xl font-bold transition-colors text-sm cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={loadingManualTapOut} 
                                    className="flex-1 bg-rose-600 hover:bg-rose-500 text-white py-3 rounded-xl font-bold transition-colors disabled:opacity-50 text-sm shadow-lg shadow-rose-900/40 cursor-pointer"
                                >
                                    {loadingManualTapOut ? 'Memproses...' : 'Proses Keluar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* 🌟 RENDER MODAL VERIFIKASI STNK (UNTUK UNKNOWN PLAT) */}
            <ManualVerificationModal 
                isOpen={showStnkModal}
                onClose={() => setShowStnkModal(false)}
                targetTransactionId={targetTxIdForStnk}
                onSuccess={fetchData} 
            />

        </div>
    );
};

export default StaffLayout;