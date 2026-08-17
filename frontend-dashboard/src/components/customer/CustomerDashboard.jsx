import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CustomerHistory from './CustomerHistory';
import CustomerParking from './CustomerParking'; // 🌟 Import Komponen Baru
import { User, Car, ShieldCheck, LogOut, RefreshCw, LayoutDashboard, History, Map as MapIcon } from 'lucide-react';

const CustomerDashboard = ({ onLogoutSuccess }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('parking'); // 🌟 Set default ke 'parking' (Self Service)
    const [refreshing, setRefreshing] = useState(false);
    const [historyPage, setHistoryPage] = useState(1);
    const [historyLimit, setHistoryLimit] = useState(10);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

    const handleLogout = () => {
        localStorage.removeItem('customer_token');
        onLogoutSuccess();
    };

    // 🌟 Pindahkan fungsi fetchDashboard ke luar agar bisa dipanggil ulang oleh child
    const fetchDashboardData = async () => {
        try {
            const token = localStorage.getItem('customer_token');
            if (!token) {
                handleLogout();
                return;
            }

            const response = await axios.get(`${API_URL}/customer/dashboard?page=${historyPage}&limit=${historyLimit}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setData(response.data.data);
        } catch (err) {
            console.error("Gagal memuat dashboard:", err);
            if (err.response?.status === 401) {
                alert("Sesi berakhir. Silakan login kembali.");
                handleLogout();
            }
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();

        // Optional: Setup WebSocket listener for membership status updates here...
    }, [historyPage, historyLimit]);

    const handleManualRefresh = () => {
        setRefreshing(true);
        fetchDashboardData();
    };

    if (loading) return <div className="p-10 bg-slate-950 min-h-screen text-white text-center flex items-center justify-center">Memuat ruang kemudi Anda...</div>;
    if (!data) return null;

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col">
            
            {/* ==========================================
                1. NAVBAR INDUK (LAYOUT UTAMA)
            ========================================== */}
            <nav className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50 shadow-lg">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/20 rounded-lg">
                            <Car className="text-blue-400" size={20} />
                        </div>
                        <span className="text-white font-black text-xl tracking-tight hidden sm:block">
                            Smart<span className="text-blue-500">Park</span>
                        </span>
                    </div>

                    <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                        <button onClick={() => setActiveTab('parking')} className={`flex items-center gap-2 px-3 sm:px-5 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${activeTab === 'parking' ? 'bg-slate-800 text-blue-400 shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}>
                            <MapIcon size={16} /> <span className="hidden sm:inline">Area Parkir</span>
                        </button>
                        <button onClick={() => setActiveTab('profile')} className={`flex items-center gap-2 px-3 sm:px-5 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${activeTab === 'profile' ? 'bg-slate-800 text-blue-400 shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}>
                            <User size={16} /> <span className="hidden sm:inline">Profil</span>
                        </button>
                        <button onClick={() => setActiveTab('history')} className={`flex items-center gap-2 px-3 sm:px-5 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${activeTab === 'history' ? 'bg-slate-800 text-blue-400 shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}>
                            <History size={16} /> <span className="hidden sm:inline">Riwayat</span>
                        </button>
                    </div>

                    <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-rose-400 hover:text-rose-300 font-bold transition-colors bg-rose-500/10 hover:bg-rose-500/20 px-3 sm:px-4 py-2 rounded-lg">
                        <LogOut size={16} /> <span className="hidden sm:inline">Keluar</span>
                    </button>
                </div>
            </nav>

            {/* ==========================================
                2. KONTEN DINAMIS BERDASARKAN TAB
            ========================================== */}
            <div className="flex-1 max-w-7xl mx-auto p-6 w-full space-y-6 mt-2">
                
                {/* 🌟 TAB 1: AREA PARKIR (TAP-IN / MAP) 🌟 */}
                {activeTab === 'parking' && (
                    <CustomerParking 
                        activeTransaction={data.active_transaction} 
                        member={data.member}    /* 👈 Tambahkan ini */
                        plate={data.plate}
                        onTransactionChange={fetchDashboardData} // Lempar fungsi ini agar Child bisa minta Parent refresh
                    />
                )}

                {/* TAB 2: PROFIL & MEMBERSHIP */}
                {activeTab === 'profile' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-md">
                                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><User size={20} className="text-blue-400"/> Identitas Kendaraan</h2>
                                <div className="space-y-3">
                                    <p className="text-sm text-slate-400">Nama Lengkap: <span className="font-bold text-white ml-1">{data.name}</span></p>
                                    <p className="text-sm text-slate-400">No. Kontak: <span className="text-slate-300 ml-1">{data.phone}</span></p>
                                    <div className="mt-4 p-4 bg-slate-950 rounded-xl flex items-center gap-4 border border-slate-700/50">
                                        <div className="p-3 bg-blue-500/10 rounded-lg"><Car className="text-blue-400" size={24} /></div>
                                        <div>
                                            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Plat Nomor</p>
                                            <p className="text-xl font-mono font-black tracking-widest text-white mt-1">{data.plate}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-md flex flex-col justify-between">
                                <h2 className="text-lg font-semibold mb-4 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <ShieldCheck size={20} className={data.member?.is_active ? "text-emerald-400" : "text-rose-400"}/> Status Membership
                                    </div>
                                    <button onClick={handleManualRefresh} className={`p-2 rounded-lg bg-slate-800 border border-slate-700 hover:text-blue-400 transition-all ${refreshing ? 'animate-spin' : ''}`}>
                                        <RefreshCw size={16} className={refreshing ? 'text-blue-400' : 'text-slate-400'} />
                                    </button>
                                </h2>
                                
                                <div className="text-center py-4 bg-slate-950 rounded-xl border border-slate-800">
                                    <div className={`font-black text-4xl tracking-tight ${data.member?.is_active ? 'text-emerald-400' : 'text-rose-400'}`}>
                                        {data.member ? (data.member.is_active ? 'AKTIF' : 'NONAKTIF') : 'NON-MEMBER'}
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-slate-800/50">
                                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Berlaku Hingga</p>
                                        <p className="text-lg font-bold text-white mt-1">
                                            {data.member?.expired_at ? new Date(data.member.expired_at).toLocaleDateString('id-ID') : '-'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB 3: RIWAYAT */}
                {activeTab === 'history' && (
                        <CustomerHistory 
                            transactions={data?.transactions} 
                            limit={historyLimit}
                            setLimit={setHistoryLimit}
                            page={historyPage}
                            setPage={setHistoryPage}
                        />
                    )}

            </div>
        </div>
    );
};

export default CustomerDashboard;