import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { History, Search, ChevronDown, ChevronLeft, ChevronRight, Clock, MapPin, Car, RefreshCw, X, CreditCard, AlertTriangle, ShieldCheck, FileText } from 'lucide-react';
import { wibDateTime } from '../../utils/time';

const AdminParkingHistory = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [search, setSearch] = useState('');
    const [lastPage, setLastPage] = useState(1);
    const [totalData, setTotalData] = useState(0);

    const [selectedTx, setSelectedTx] = useState(null);

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

    useEffect(() => {
        if (!selectedTx) return;
        const handleKey = (e) => { if (e.key === 'Escape') setSelectedTx(null); };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [selectedTx]);

    const handleManualRefresh = () => {
        if (isRefreshing || loading) return;
        fetchTransactions(true);
    };

    const formatRupiah = (v) => `Rp ${Number(v || 0).toLocaleString('id-ID')}`;

    const getStatusBadge = (tx) => {
        if (tx.requires_manual_verification && !tx.exit_time) {
            return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 text-[#C97A1D] text-[11px] font-semibold"><AlertTriangle size={12} /> Verifikasi Manual</span>;
        }
        if (tx.is_violation) {
            return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-50 text-rose-600 text-[11px] font-semibold"><AlertTriangle size={12} /> Pelanggaran</span>;
        }
        if (tx.exit_time) {
            return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-600 text-[11px] font-semibold"><ShieldCheck size={12} /> Selesai</span>;
        }
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#26468A]/10 text-[#26468A] text-[11px] font-semibold"><Clock size={12} /> Aktif</span>;
    };

    // ── TABEL ──────────────────────────────────────────────────────
    const renderTable = () => (
        <div className="overflow-x-auto overflow-y-auto max-h-[600px] border border-[#E2E6EE] rounded-xl custom-scrollbar relative">
            {loading && (
                <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-20 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-[#E2E6EE] border-t-[#26468A]"></div>
                </div>
            )}
            <table className="w-full text-left text-sm">
                <thead className="bg-[#F3F5F9] sticky top-0 z-10">
                    <tr className="text-[#667085] text-xs font-semibold uppercase tracking-wide border-b border-[#E2E6EE]">
                        <th className="py-3.5 px-5 whitespace-nowrap bg-[#F3F5F9]">Status</th>
                        <th className="py-3.5 px-5 whitespace-nowrap bg-[#F3F5F9]">Waktu & Durasi</th>
                        <th className="py-3.5 px-5 whitespace-nowrap bg-[#F3F5F9]">Kendaraan & Slot</th>
                        <th className="py-3.5 px-5 whitespace-nowrap bg-[#F3F5F9]">Tipe Pelanggan</th>
                        <th className="py-3.5 px-5 whitespace-nowrap bg-[#F3F5F9]">Total Pendapatan</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E6EE]">
                    {transactions.length > 0 ? (
                        transactions.map((tx) => (
                            <tr
                                key={tx.id}
                                onClick={() => setSelectedTx(tx)}
                                className="hover:bg-[#F3F5F9]/70 transition-colors cursor-pointer"
                            >
                                <td className="py-4 px-5">{getStatusBadge(tx)}</td>
                                <td className="py-4 px-5">
                                    <div className="text-[#101828] font-medium">
                                        {wibDateTime(tx.entry_time, { day: '2-digit', month: 'short', year: undefined })}
                                    </div>
                                    <div className="text-xs text-[#98A2B3] flex items-center gap-1.5 mt-1">
                                        <Clock size={12} /> {tx.duration_minutes !== null ? `${tx.duration_minutes} Menit` : 'Aktif / Belum Selesai'}
                                    </div>
                                </td>
                                <td className="py-4 px-5">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-[#F3F5F9] border border-[#E2E6EE] rounded-lg">
                                            <Car size={16} className="text-[#98A2B3]" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-[#101828] tracking-wide text-sm">{tx.plate_number}</p>
                                            <p className="text-xs text-[#667085] font-medium mt-0.5 flex items-center gap-1">
                                                <MapPin size={11} /> Slot {tx.slot?.slot_code || '-'}
                                            </p>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-4 px-5">
                                    {tx.is_member ? (
                                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Member
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#98A2B3]">
                                            <span className="w-1.5 h-1.5 rounded-full bg-[#E2E6EE]" /> Umum
                                        </span>
                                    )}
                                </td>
                                <td className="py-4 px-5">
                                    <div className={`font-semibold ${tx.exit_time ? 'text-[#101828]' : 'text-[#98A2B3]'}`}>
                                        {tx.exit_time ? formatRupiah(tx.fee) : 'Proses...'}
                                    </div>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="5" className="py-16 text-center text-[#98A2B3] text-sm">
                                Data transaksi tidak ditemukan.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );

    // ── DETAIL MODAL ───────────────────────────────────────────────
    const renderDetailModal = () => {
        if (!selectedTx) return null;
        const tx = selectedTx;
        const slotMismatch = tx.detected_slot_id && tx.detected_slot_id !== tx.parking_slot_id;

        return (
            <div
                className="fixed inset-0 bg-[#101828]/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={() => setSelectedTx(null)}
            >
                <div
                    className="bg-white rounded-2xl shadow-2xl border border-[#E2E6EE] w-full max-w-lg max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E6EE]">
                        <div>
                            <h3 className="text-base font-bold text-[#101828]">Detail Transaksi</h3>
                            <p className="text-xs text-[#98A2B3] font-mono mt-0.5">#{tx.id}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            {getStatusBadge(tx)}
                            <button
                                onClick={() => setSelectedTx(null)}
                                className="p-1.5 rounded-lg hover:bg-[#F3F5F9] text-[#98A2B3] hover:text-[#101828] transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="p-6 space-y-5 overflow-y-auto flex-1 custom-scrollbar">

                        {/* Kendaraan & Identitas */}
                        <div className="bg-[#F3F5F9] rounded-xl p-4 border border-[#E2E6EE]">
                            <h4 className="text-xs font-semibold text-[#98A2B3] uppercase tracking-wide mb-3 flex items-center gap-1.5">
                                <Car size={13} /> Kendaraan & Identitas
                            </h4>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                    <span className="text-[#98A2B3] text-xs block">Plat Nomor</span>
                                    <span className="font-bold text-[#101828] font-mono tracking-wide">{tx.plate_number}</span>
                                </div>
                                <div>
                                    <span className="text-[#98A2B3] text-xs block">No. Kartu RFID</span>
                                    <span className="font-semibold text-[#475467] font-mono text-xs">{tx.card_id}</span>
                                </div>
                                <div>
                                    <span className="text-[#98A2B3] text-xs block">Tipe Pelanggan</span>
                                    {tx.is_member ? (
                                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Member Aktif
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#667085]">
                                            <span className="w-1.5 h-1.5 rounded-full bg-[#E2E6EE]" /> Pengunjung Umum
                                        </span>
                                    )}
                                </div>
                                {tx.customer?.user && (
                                    <div>
                                        <span className="text-[#98A2B3] text-xs block">Pemilik Akun</span>
                                        <span className="font-semibold text-[#475467] text-xs">{tx.customer.user.name}</span>
                                        <span className="text-[#98A2B3] text-[10px] block">{tx.customer.user.email}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Parkir */}
                        <div className="bg-[#F3F5F9] rounded-xl p-4 border border-[#E2E6EE]">
                            <h4 className="text-xs font-semibold text-[#98A2B3] uppercase tracking-wide mb-3 flex items-center gap-1.5">
                                <MapPin size={13} /> Informasi Parkir
                            </h4>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                    <span className="text-[#98A2B3] text-xs block">Slot Dialokasikan</span>
                                    <span className="font-bold text-[#101828]">{tx.slot?.slot_code || '-'}</span>
                                    {tx.slot && (
                                        <span className="text-[#98A2B3] text-[10px] block">
                                            ({tx.slot.x_coord}, {tx.slot.y_coord})
                                        </span>
                                    )}
                                </div>
                                <div>
                                    {/* <span className="text-[#98A2B3] text-xs block">Slot Terdeteksi Kamera</span>
                                    {tx.detectedSlot ? (
                                        <div>
                                            <span className="font-semibold text-[#475467] text-xs">{tx.detectedSlot.slot_code}</span>
                                            {slotMismatch && (
                                                <span className="ml-2 inline-flex items-center gap-1 text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">
                                                    <AlertTriangle size={10} /> Mismatch
                                                </span>
                                            )}
                                        </div>
                                    ) : (
                                        <span className="text-[#98A2B3] text-xs">Tidak terdeteksi</span>
                                    )} */}
                                </div>
                            </div>
                        </div>

                        {/* Waktu */}
                        <div className="bg-[#F3F5F9] rounded-xl p-4 border border-[#E2E6EE]">
                            <h4 className="text-xs font-semibold text-[#98A2B3] uppercase tracking-wide mb-3 flex items-center gap-1.5">
                                <Clock size={13} /> Waktu & Durasi
                            </h4>
                            <div className="grid grid-cols-3 gap-3 text-sm">
                                <div>
                                    <span className="text-[#98A2B3] text-xs block">Masuk</span>
                                    <span className="font-semibold text-[#101828] text-xs">
                                        {wibDateTime(tx.entry_time)}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-[#98A2B3] text-xs block">Keluar</span>
                                    {tx.exit_time ? (
                                        <span className="font-semibold text-[#101828] text-xs">
                                            {wibDateTime(tx.exit_time)}
                                        </span>
                                    ) : (
                                        <span className="text-[#26468A] text-xs font-semibold">Masih Aktif</span>
                                    )}
                                </div>
                                <div>
                                    <span className="text-[#98A2B3] text-xs block">Durasi</span>
                                    <span className="font-semibold text-[#101828] text-xs">
                                        {tx.duration_minutes !== null ? `${tx.duration_minutes} menit` : '—'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Finansial */}
                        <div className="bg-[#F3F5F9] rounded-xl p-4 border border-[#E2E6EE]">
                            <h4 className="text-xs font-semibold text-[#98A2B3] uppercase tracking-wide mb-3 flex items-center gap-1.5">
                                <CreditCard size={13} /> Finansial
                            </h4>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                    <span className="text-[#98A2B3] text-xs block">Tarif / Jam</span>
                                    <span className="font-semibold text-[#475467] text-xs">
                                        {tx.revenue_config ? formatRupiah(tx.revenue_config.rate_per_hour) : '—'}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-[#98A2B3] text-xs block">Total Biaya</span>
                                    {tx.is_member ? (
                                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                                            Rp 0 (Member)
                                        </span>
                                    ) : (
                                        <span className="font-bold text-[#101828] text-base">
                                            {tx.exit_time ? formatRupiah(tx.fee) : '—'}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Verifikasi Manual */}
                        {tx.requires_manual_verification && (
                            <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                                <h4 className="text-xs font-semibold text-[#C97A1D] uppercase tracking-wide mb-3 flex items-center gap-1.5">
                                    <FileText size={13} /> Verifikasi Manual
                                </h4>
                                {tx.manualVerification ? (
                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        <div>
                                            <span className="text-[#98A2B3] text-xs block">Plat Terverifikasi</span>
                                            <span className="font-bold text-[#101828] font-mono">{tx.manualVerification.verified_plate}</span>
                                        </div>
                                        <div>
                                            <span className="text-[#98A2B3] text-xs block">Nama Pengemudi</span>
                                            <span className="font-semibold text-[#475467] text-xs">{tx.manualVerification.driver_name}</span>
                                        </div>
                                        <div>
                                            <span className="text-[#98A2B3] text-xs block">Model Kendaraan</span>
                                            <span className="font-semibold text-[#475467] text-xs">{tx.manualVerification.vehicle_model}</span>
                                        </div>
                                        <div>
                                            <span className="text-[#98A2B3] text-xs block">Warna Kendaraan</span>
                                            <span className="font-semibold text-[#475467] text-xs">{tx.manualVerification.vehicle_color}</span>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-xs text-[#C97A1D]">Menunggu verifikasi oleh petugas.</p>
                                )}
                            </div>
                        )}

                        {/* Pelanggaran */}
                        {tx.is_violation && (
                            <div className="bg-rose-50 rounded-xl p-4 border border-rose-100">
                                <h4 className="text-xs font-semibold text-rose-600 uppercase tracking-wide mb-1 flex items-center gap-1.5">
                                    <AlertTriangle size={13} /> Catatan Pelanggaran
                                </h4>
                                <p className="text-xs text-rose-500">
                                    Transaksi ini tercatat melanggar aturan parkir
                                    {slotMismatch ? ' (slot terdeteksi berbeda dari alokasi)' : ''}.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 border-t border-[#E2E6EE] flex justify-end">
                        <button
                            onClick={() => setSelectedTx(null)}
                            className="px-4 py-2 rounded-xl bg-[#F3F5F9] hover:bg-[#E2E6EE] text-[#475467] text-xs font-semibold transition-colors border border-[#E2E6EE]"
                        >
                            Tutup
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // ── MAIN RENDER ────────────────────────────────────────────────
    return (
        <div className="bg-white p-6 rounded-2xl border border-[#E2E6EE] shadow-sm">
            {/* HEADER, SEARCH & LIMIT */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5 pb-4 border-b border-[#E2E6EE]">
                <div>
                    <h2 className="text-xl font-bold text-[#101828] flex items-center gap-2">
                        <History size={20} className="text-[#98A2B3]" /> Riwayat Seluruh Transaksi
                    </h2>
                    <p className="text-sm text-[#667085] mt-1">Total {totalData} transaksi tercatat di sistem.</p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3">
                    <div className="relative w-full sm:w-64">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#98A2B3]" />
                        <input 
                            type="text"
                            placeholder="Cari plat nomor..."
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                            className="w-full bg-[#F3F5F9] border border-[#E2E6EE] text-[#101828] text-sm rounded-xl py-2.5 pl-9 pr-4 focus:outline-none focus:border-[#26468A] focus:bg-white transition-colors placeholder:text-[#98A2B3]"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-xs text-[#98A2B3] font-medium whitespace-nowrap">Limit:</span>
                        <div className="relative">
                            <select 
                                value={limit}
                                onChange={(e) => { setLimit(e.target.value === 'all' ? 'all' : Number(e.target.value)); setPage(1); }}
                                className="appearance-none bg-[#F3F5F9] border border-[#E2E6EE] text-[#101828] text-sm py-2.5 pl-3.5 pr-9 rounded-xl focus:outline-none focus:border-[#26468A] cursor-pointer font-semibold"
                            >
                                <option value={10}>10</option>
                                <option value={25}>25</option>
                                <option value={50}>50</option>
                                <option value={100}>100</option>
                                <option value="all">Semua</option>
                            </select>
                            <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#98A2B3] pointer-events-none" />
                        </div>
                    </div>

                    <button
                        onClick={handleManualRefresh}
                        disabled={isRefreshing || loading}
                        title="Refresh data"
                        className="p-2.5 bg-[#F3F5F9] hover:bg-[#E2E6EE] border border-[#E2E6EE] rounded-xl text-[#667085] hover:text-[#101828] transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                    >
                        <RefreshCw size={15} className={isRefreshing ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            {renderTable()}

            {/* KONTROL PAGINATION */}
            {totalData > 0 && (
                <div className="mt-5 flex items-center justify-between pt-4 border-t border-[#E2E6EE]">
                    <span className="text-xs text-[#667085]">
                        Halaman <span className="font-semibold text-[#101828]">{page}</span> dari <span className="font-semibold text-[#101828]">{lastPage}</span>
                    </span>
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => setPage(page - 1)}
                            disabled={page === 1}
                            className="p-2 bg-[#F3F5F9] hover:bg-[#E2E6EE] border border-[#E2E6EE] rounded-lg text-[#667085] hover:text-[#101828] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <button 
                            onClick={() => setPage(page + 1)}
                            disabled={page === lastPage}
                            className="p-2 bg-[#F3F5F9] hover:bg-[#E2E6EE] border border-[#E2E6EE] rounded-lg text-[#667085] hover:text-[#101828] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            )}

            {renderDetailModal()}
        </div>
    );
};

export default AdminParkingHistory;
