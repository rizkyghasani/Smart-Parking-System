import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { History, Search, ChevronDown, ChevronLeft, ChevronRight, Clock, MapPin, Car, RefreshCw } from 'lucide-react';

const AdminParkingHistory = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [search, setSearch] = useState('');
    const [lastPage, setLastPage] = useState(1);
    const [totalData, setTotalData] = useState(0);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
    const token = localStorage.getItem('token') || localStorage.getItem('admin_token');

    const fetchTransactions = async (isManualRefresh = false) => {
        if (isManualRefresh) {
            setIsRefreshing(true);
        } else {
            setLoading(true);
        }
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
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            fetchTransactions();
        }, 500);

        return () => clearTimeout(delayDebounce);
    }, [page, limit, search]);

    const handleManualRefresh = () => {
        if (isRefreshing || loading) return;
        fetchTransactions(true);
    };

    return (
        <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm">
            {/* HEADER, SEARCH & LIMIT */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5 pb-4 border-b border-gray-100">
                <div>
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <History size={20} className="text-gray-400" /> Riwayat Seluruh Transaksi
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">Total {totalData} transaksi tercatat di sistem.</p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3">
                    {/* Search Bar */}
                    <div className="relative w-full sm:w-64">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input 
                            type="text"
                            placeholder="Cari plat nomor..."
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setPage(1);
                            }}
                            className="w-full bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-xl py-2.5 pl-9 pr-4 focus:outline-none focus:border-gray-400 focus:bg-white transition-colors"
                        />
                    </div>

                    {/* Limit Dropdown */}
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400 font-medium whitespace-nowrap">Limit:</span>
                        <div className="relative">
                            <select 
                                value={limit}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setLimit(val === 'all' ? 'all' : Number(val));
                                    setPage(1);
                                }}
                                className="appearance-none bg-gray-50 border border-gray-200 text-gray-700 text-sm py-2.5 pl-3.5 pr-9 rounded-xl focus:outline-none focus:border-gray-400 cursor-pointer font-semibold"
                            >
                                <option value={10}>10</option>
                                <option value={25}>25</option>
                                <option value={50}>50</option>
                                <option value={100}>100</option>
                                <option value="all">Semua</option>
                            </select>
                            <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        </div>
                    </div>

                    {/* Tombol Refresh Manual */}
                    <button
                        onClick={handleManualRefresh}
                        disabled={isRefreshing || loading}
                        title="Refresh data"
                        className="p-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-gray-500 hover:text-gray-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                    >
                        <RefreshCw size={15} className={isRefreshing ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            {/* TABEL DATA */}
            <div className="overflow-x-auto overflow-y-auto max-h-[600px] border border-gray-200 rounded-xl custom-scrollbar relative">
                {loading && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-20 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-gray-600"></div>
                    </div>
                )}
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 sticky top-0 z-10">
                        <tr className="text-gray-500 text-xs font-semibold uppercase tracking-wide border-b border-gray-200">
                            <th className="py-3.5 px-5 whitespace-nowrap bg-gray-50">Waktu & Durasi</th>
                            <th className="py-3.5 px-5 whitespace-nowrap bg-gray-50">Kendaraan & Slot</th>
                            <th className="py-3.5 px-5 whitespace-nowrap bg-gray-50">Tipe Pelanggan</th>
                            <th className="py-3.5 px-5 whitespace-nowrap bg-gray-50">Total Pendapatan</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {transactions.length > 0 ? (
                            transactions.map((tx) => (
                                <tr key={tx.id} className="hover:bg-gray-50/70 transition-colors">
                                    {/* Waktu & Durasi */}
                                    <td className="py-4 px-5">
                                        <div className="text-gray-700 font-medium">
                                            {new Date(tx.entry_time).toLocaleString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                        <div className="text-xs text-gray-400 flex items-center gap-1.5 mt-1">
                                            <Clock size={12} /> {tx.duration_minutes !== null ? `${tx.duration_minutes} Menit` : 'Aktif / Belum Selesai'}
                                        </div>
                                    </td>

                                    {/* Plat & Slot */}
                                    <td className="py-4 px-5">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-gray-50 border border-gray-200 rounded-lg">
                                                <Car size={16} className="text-gray-400" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-800 tracking-wide text-sm">{tx.plate_number}</p>
                                                <p className="text-xs text-gray-500 font-medium mt-0.5 flex items-center gap-1">
                                                    <MapPin size={11} /> Slot {tx.slot?.slot_code || '-'}
                                                </p>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Tipe Pelanggan */}
                                    <td className="py-4 px-5">
                                        {tx.is_member ? (
                                            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Member
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500">
                                                <span className="w-1.5 h-1.5 rounded-full bg-gray-300" /> Umum
                                            </span>
                                        )}
                                    </td>

                                    {/* Biaya */}
                                    <td className="py-4 px-5">
                                        <div className={`font-semibold ${tx.exit_time ? 'text-gray-800' : 'text-gray-400'}`}>
                                            {tx.exit_time ? `Rp ${tx.fee?.toLocaleString('id-ID') || 0}` : 'Proses...'}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" className="py-16 text-center text-gray-400 text-sm">
                                    Data transaksi tidak ditemukan.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* KONTROL PAGINATION */}
            {totalData > 0 && (
                <div className="mt-5 flex items-center justify-between pt-4 border-t border-gray-100">
                    <span className="text-xs text-gray-500">
                        Halaman <span className="font-semibold text-gray-700">{page}</span> dari <span className="font-semibold text-gray-700">{lastPage}</span>
                    </span>
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => setPage(page - 1)}
                            disabled={page === 1}
                            className="p-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-gray-500 hover:text-gray-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <button 
                            onClick={() => setPage(page + 1)}
                            disabled={page === lastPage}
                            className="p-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-gray-500 hover:text-gray-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminParkingHistory;