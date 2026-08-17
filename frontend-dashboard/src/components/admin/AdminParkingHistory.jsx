import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { History, Search, ChevronDown, ChevronLeft, ChevronRight, Clock, MapPin, Car } from 'lucide-react';

const AdminParkingHistory = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // State untuk Pagination & Search
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [search, setSearch] = useState('');
    const [lastPage, setLastPage] = useState(1);
    const [totalData, setTotalData] = useState(0);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
    
    // Gunakan token admin (sesuaikan dengan nama key di localStorage kamu, misal 'token' atau 'admin_token')
    const token = localStorage.getItem('token') || localStorage.getItem('admin_token');

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_URL}/admin/transactions`, {
                headers: { Authorization: `Bearer ${token}` },
                params: { page, limit, search }
            });
            
            if (response.data.status === 'success') {
                setTransactions(response.data.data.data);
                setLastPage(response.data.data.last_page);
                setTotalData(response.data.data.total);
            }
        } catch (error) {
            console.error("Gagal mengambil data riwayat admin:", error);
        } finally {
            setLoading(false);
        }
    };

    // Trigger fetch ketika page, limit, atau search berubah
    useEffect(() => {
        // Gunakan debounce sederhana untuk search agar tidak spam API saat mengetik
        const delayDebounce = setTimeout(() => {
            fetchTransactions();
        }, 500);

        return () => clearTimeout(delayDebounce);
    }, [page, limit, search]);

    return (
        <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl">
            {/* HEADER, SEARCH & LIMIT */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <History className="text-blue-500" size={24} /> Riwayat Seluruh Transaksi
                    </h2>
                    <p className="text-sm text-slate-400 mt-1">Total {totalData} transaksi tercatat di sistem.</p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                    {/* Search Bar */}
                    <div className="relative w-full sm:w-64">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input 
                            type="text"
                            placeholder="Cari Plat Nomor..."
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setPage(1); // Reset ke halaman 1 saat mencari
                            }}
                            className="w-full bg-slate-950 border border-slate-700 text-white text-sm rounded-xl py-2 pl-10 pr-4 focus:outline-none focus:border-blue-500 transition-colors"
                        />
                    </div>

                    {/* Limit Dropdown */}
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500 uppercase tracking-widest font-bold">Limit:</span>
                        <div className="relative">
                            <select 
                                value={limit}
                                onChange={(e) => {
                                    // 🌟 BACA VALUE, JIKA BUKAN 'all', UBAH JADI NUMBER
                                    const val = e.target.value;
                                    setLimit(val === 'all' ? 'all' : Number(val));
                                    setPage(1);
                                }}
                                className="appearance-none bg-slate-950 border border-slate-700 text-white text-sm py-2 pl-4 pr-10 rounded-xl focus:outline-none focus:border-blue-500 cursor-pointer font-bold"
                            >
                                <option value={10}>10</option>
                                <option value={25}>25</option>
                                <option value={50}>50</option>
                                <option value={100}>100</option>
                                {/* 🌟 TAMBAHKAN OPSI SEMUA DI SINI */}
                                <option value="all">Semua</option>
                            </select>
                            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        </div>
                    </div>
                </div>
            </div>

            {/* TABEL DATA */}
            <div className="overflow-x-auto overflow-y-auto max-h-[600px] border border-slate-700/50 rounded-xl custom-scrollbar relative">
                {loading && (
                    <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm z-20 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                )}
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-950 sticky top-0 z-10 shadow-md">
                        <tr className="text-slate-400 text-xs uppercase tracking-widest font-bold border-b border-slate-800">
                            <th className="py-4 px-5 whitespace-nowrap bg-slate-950">Waktu & Durasi</th>
                            <th className="py-4 px-5 whitespace-nowrap bg-slate-950">Kendaraan & Slot</th>
                            <th className="py-4 px-5 whitespace-nowrap bg-slate-950">Tipe Pelanggan</th>
                            <th className="py-4 px-5 whitespace-nowrap bg-slate-950">Total Pendapatan</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.length > 0 ? (
                            transactions.map((tx) => (
                                <tr key={tx.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                                    {/* Waktu & Durasi */}
                                    <td className="py-4 px-5">
                                        <div className="font-mono text-slate-200">
                                            {new Date(tx.entry_time).toLocaleString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                        <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-1 font-medium">
                                            <Clock size={12} /> {tx.duration_minutes !== null ? `${tx.duration_minutes} Menit` : 'Aktif / Belum Selesai'}
                                        </div>
                                    </td>

                                    {/* Plat & Slot */}
                                    <td className="py-4 px-5">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-slate-950 border border-slate-700 rounded-lg">
                                                <Car size={16} className="text-slate-400" />
                                            </div>
                                            <div>
                                                <p className="font-black text-white tracking-widest text-base">{tx.plate_number}</p>
                                                <p className="text-xs text-emerald-400 font-bold mt-0.5 flex items-center gap-1">
                                                    <MapPin size={12} /> Slot {tx.slot?.slot_code || '-'}
                                                </p>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Tipe Pelanggan */}
                                    <td className="py-4 px-5">
                                        {tx.is_member ? (
                                            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-[10px] font-black rounded-lg uppercase tracking-wider border border-emerald-500/20">
                                                Member
                                            </span>
                                        ) : (
                                            <span className="px-3 py-1 bg-slate-700/50 text-slate-300 text-[10px] font-black rounded-lg uppercase tracking-wider border border-slate-700">
                                                Umum
                                            </span>
                                        )}
                                    </td>

                                    {/* Biaya */}
                                    <td className="py-4 px-5">
                                        <div className={`font-black ${tx.exit_time ? 'text-white' : 'text-slate-500'}`}>
                                            {tx.exit_time ? `Rp ${tx.fee?.toLocaleString('id-ID') || 0}` : 'Proses...'}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" className="py-16 text-center text-slate-500 italic bg-slate-900/50">
                                    Data transaksi tidak ditemukan.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* KONTROL PAGINATION */}
            {totalData > 0 && (
                <div className="mt-6 flex items-center justify-between border-t border-slate-800 pt-5">
                    <span className="text-sm text-slate-400">
                        Menampilkan Halaman <span className="font-bold text-white">{page}</span> dari <span className="font-bold text-white">{lastPage}</span>
                    </span>
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => setPage(page - 1)}
                            disabled={page === 1}
                            className="p-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-400 hover:text-white hover:border-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <button 
                            onClick={() => setPage(page + 1)}
                            disabled={page === lastPage}
                            className="p-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-400 hover:text-white hover:border-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminParkingHistory;