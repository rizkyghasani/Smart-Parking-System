import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CustomerHistory from './CustomerHistory';
import CustomerParking from './CustomerParking';
import TopUpModal from './TopUpModal';
import { User, Car, ShieldCheck, LogOut, RefreshCw, LayoutDashboard, History, Map as MapIcon, Wallet, Plus } from 'lucide-react';
import { wibDate, wibDateTime } from '../../utils/time';
import { formatRupiah } from '../../utils/formatRupiah';

const FONT_STYLE = `@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@500;600;700&display=swap');`;

const CustomerDashboard = ({ onLogoutSuccess }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('parking');
    const [refreshing, setRefreshing] = useState(false);
    const [historyPage, setHistoryPage] = useState(1);
    const [historyLimit, setHistoryLimit] = useState(10);
    const [showTopUpModal, setShowTopUpModal] = useState(false);
    const [topUpNotice, setTopUpNotice] = useState(null);
    const [topupHistory, setTopupHistory] = useState([]);
    const [topupLoading, setTopupLoading] = useState(false);

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

    // 🌟 Fungsi ambil riwayat top-up (dipakai di tab Profil)
    const fetchTopUpHistory = async () => {
        const token = localStorage.getItem('customer_token');
        if (!token) return;
        setTopupLoading(true);
        try {
            const response = await axios.get(`${API_URL}/customer/topup/history?limit=10`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTopupHistory(response.data.data?.history?.data || []);
        } catch (err) {
            console.error("Gagal memuat riwayat top-up:", err);
        } finally {
            setTopupLoading(false);
        }
    };

    // Callback Top-Up sukses: sinkronkan saldo + riwayat
    const handleTopUpSuccess = (balance) => {
        setData((prev) => (prev ? { ...prev, balance } : prev));
        setTopUpNotice(null);
        fetchTopUpHistory();
    };

    // Dipanggil CustomerParking saat tap-out ditolak 403 (saldo kurang)
    const handleTopUpNeeded = (message) => {
        setTopUpNotice(message || 'Saldo Anda tidak mencukupi untuk membayar biaya parkir.');
        setShowTopUpModal(true);
    };

    useEffect(() => {
        fetchDashboardData();
        fetchTopUpHistory();

        // Optional: Setup WebSocket listener for membership status updates here...
    }, [historyPage, historyLimit]);

    const handleManualRefresh = () => {
        setRefreshing(true);
        fetchDashboardData();
    };

    if (loading) return <div className="p-10 bg-[#F3F5F9] min-h-screen flex items-center justify-center text-[#667085]">Memuat ruang kemudi Anda...</div>;
    if (!data) return null;

    return (
        <div className="min-h-screen bg-[#F3F5F9] flex flex-col" style={{ fontFamily: "'Manrope', sans-serif" }}>
            <style>{FONT_STYLE}</style>

            {/* ==========================================
                1. NAVBAR INDUK (LAYOUT UTAMA)
            ========================================== */}
            <nav className="bg-white border-b border-[#E2E6EE] sticky top-0 z-50 shadow-sm">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#26468A]/10 rounded-lg">
                            <Car className="text-[#26468A]" size={20} />
                        </div>
                        <span className="text-[#101828] font-black text-xl tracking-tight hidden sm:block">
                            Smart<span className="text-[#26468A]">Park</span>
                        </span>
                    </div>

                    <div className="flex items-center gap-1 bg-[#F3F5F9] p-1 rounded-xl border border-[#E2E6EE]">
                        <button onClick={() => setActiveTab('parking')} className={`flex items-center gap-2 px-3 sm:px-5 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${activeTab === 'parking' ? 'bg-white text-[#26468A] shadow-sm' : 'text-[#667085] hover:text-[#26468A]'}`}>
                            <MapIcon size={16} /> <span className="hidden sm:inline">Area Parkir</span>
                        </button>
                        <button onClick={() => setActiveTab('profile')} className={`flex items-center gap-2 px-3 sm:px-5 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${activeTab === 'profile' ? 'bg-white text-[#26468A] shadow-sm' : 'text-[#667085] hover:text-[#26468A]'}`}>
                            <User size={16} /> <span className="hidden sm:inline">Profil</span>
                        </button>
                        <button onClick={() => setActiveTab('history')} className={`flex items-center gap-2 px-3 sm:px-5 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${activeTab === 'history' ? 'bg-white text-[#26468A] shadow-sm' : 'text-[#667085] hover:text-[#26468A]'}`}>
                            <History size={16} /> <span className="hidden sm:inline">Riwayat</span>
                        </button>
                    </div>

                    <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-rose-600 hover:text-rose-500 font-bold transition-colors bg-rose-50 hover:bg-rose-100 px-3 sm:px-4 py-2 rounded-lg">
                        <LogOut size={16} /> <span className="hidden sm:inline">Keluar</span>
                    </button>
                </div>
            </nav>

            {/* ==========================================
                2. KONTEN DINAMIS BERDASARKAN TAB
            ========================================== */}
            <div className="flex-1 max-w-7xl mx-auto p-6 w-full space-y-6 mt-6">
                
                {/* 🌟 TAB 1: AREA PARKIR (TAP-IN / MAP) 🌟 */}
                {activeTab === 'parking' && (
                    <CustomerParking 
                        activeTransaction={data.active_transaction} 
                        member={data.member}    /* 👈 Tambahkan ini */
                        plate={data.plate}
                        onTransactionChange={fetchDashboardData} // Lempar fungsi ini agar Child bisa minta Parent refresh
                        onTopUpNeeded={handleTopUpNeeded} // Buka modal top-up saat tap-out 403 (saldo kurang)
                    />
                )}

                {/* TAB 2: PROFIL & MEMBERSHIP */}
                {activeTab === 'profile' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white p-6 rounded-2xl border border-[#E2E6EE] shadow-sm">
                                <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-[#101828]"><User size={20} className="text-[#26468A]"/> Identitas Kendaraan</h2>
                                <div className="space-y-3">
                                    <p className="text-sm text-[#667085]">Nama Lengkap: <span className="font-bold text-[#101828] ml-1">{data.name}</span></p>
                                    <p className="text-sm text-[#667085]">No. Kontak: <span className="text-[#475467] ml-1">{data.phone}</span></p>
                                    <div className="mt-4 p-4 bg-[#F3F5F9] rounded-xl flex items-center gap-4 border border-[#E2E6EE]">
                                        <div className="p-3 bg-[#26468A]/10 rounded-lg"><Car className="text-[#26468A]" size={24} /></div>
                                        <div>
                                            <p className="text-[10px] text-[#98A2B3] uppercase tracking-widest font-bold">Plat Nomor</p>
                                            <p className="text-xl font-mono font-black tracking-widest text-[#101828] mt-1">{data.plate}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-2xl border border-[#E2E6EE] shadow-sm flex flex-col justify-between">
                                <h2 className="text-lg font-bold mb-4 flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-[#101828]">
                                        <ShieldCheck size={20} className={data.member?.is_active ? "text-emerald-600" : "text-rose-600"}/> Status Membership
                                    </div>
                                    <button onClick={handleManualRefresh} className={`p-2 rounded-lg bg-white border border-[#E2E6EE] text-[#475467] hover:text-[#26468A] transition-all ${refreshing ? 'animate-spin' : ''}`}>
                                        <RefreshCw size={16} className={refreshing ? 'text-[#26468A]' : 'text-[#98A2B3]'} />
                                    </button>
                                </h2>
                                
                                <div className="text-center py-4 bg-[#F3F5F9] rounded-xl border border-[#E2E6EE]">
                                    <div className={`font-black text-4xl tracking-tight ${data.member?.is_active ? 'text-emerald-600' : 'text-rose-600'}`}>
                                        {data.member ? (data.member.is_active ? 'AKTIF' : 'NONAKTIF') : 'NON-MEMBER'}
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-[#E2E6EE]">
                                        <p className="text-xs text-[#98A2B3] font-bold uppercase tracking-widest">Berlaku Hingga</p>
                                        <p className="text-lg font-bold text-[#101828] mt-1">
                                            {data.member?.expired_at ? wibDate(data.member.expired_at) : '-'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* 💰 KARTU SALDO E-WALLET + RIWAYAT TOP-UP */}
                            <div className="md:col-span-2 bg-white p-6 rounded-2xl border border-[#E2E6EE] shadow-sm">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
                                    <div>
                                        <h2 className="text-lg font-bold flex items-center gap-2 text-[#101828]">
                                            <Wallet size={20} className="text-emerald-600"/> Saldo E-Wallet
                                        </h2>
                                        <div className="mt-3 flex items-end gap-3">
                                            <span className="font-black text-4xl tracking-tight text-[#101828]">
                                                {formatRupiah(data.balance)}
                                            </span>
                                            <span className="text-xs text-[#98A2B3] font-bold uppercase tracking-widest mb-1.5">siap dibayar</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => { setTopUpNotice(null); setShowTopUpModal(true); }}
                                        className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-sm text-white bg-emerald-600 hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-600/20"
                                    >
                                        <Plus size={16}/> Top Up Sekarang
                                    </button>
                                </div>

                                <div className="border-t border-[#E2E6EE] pt-4">
                                    <h3 className="text-sm font-bold text-[#475467] mb-3 flex items-center gap-2">
                                        <History size={16} className="text-[#98A2B3]"/> Riwayat Top-Up
                                    </h3>
                                    {topupLoading ? (
                                        <p className="text-sm text-[#98A2B3]">Memuat riwayat...</p>
                                    ) : topupHistory.length === 0 ? (
                                        <p className="text-sm text-[#98A2B3]">Belum ada transaksi top-up.</p>
                                    ) : (
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-sm">
                                                <thead>
                                                    <tr className="text-[11px] text-[#98A2B3] uppercase tracking-widest font-bold border-b border-[#E2E6EE]">
                                                        <th className="text-left py-2.5 pr-3">Waktu</th>
                                                        <th className="text-right py-2.5 pr-3">Nominal</th>
                                                        <th className="text-left py-2.5 pr-3">Metode</th>
                                                        <th className="text-left py-2.5">Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {topupHistory.map((t) => (
                                                        <tr key={t.id} className="border-b border-[#F3F5F9]">
                                                            <td className="py-3 pr-3 text-[#475467] font-medium whitespace-nowrap">{wibDateTime(t.created_at)}</td>
                                                            <td className="py-3 pr-3 text-right font-bold text-[#101828] whitespace-nowrap">{formatRupiah(t.amount)}</td>
                                                            <td className="py-3 pr-3 capitalize text-[#667085] whitespace-nowrap">{t.payment_method.replace(/_/g, ' ')}</td>
                                                            <td className="py-3">
                                                                <span className={`inline-flex px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider ${t.status === 'success' ? 'bg-emerald-50 text-emerald-600' : t.status === 'failed' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'}`}>
                                                                    {t.status}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
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

            {/* 💰 MODAL TOP-UP SALDO */}
            <TopUpModal
                isOpen={showTopUpModal}
                onClose={() => setShowTopUpModal(false)}
                onSuccess={handleTopUpSuccess}
                notice={topUpNotice}
            />
        </div>
    );
};

export default CustomerDashboard;