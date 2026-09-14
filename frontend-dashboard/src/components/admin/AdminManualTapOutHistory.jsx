import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { 
    ClipboardList, Car, User, Calendar, FileText, 
    Clock, Palette, Search, Eye, X, MapPin, Receipt
} from 'lucide-react';
import { wibDate, wibTime } from '../../utils/time';

const AdminManualTapOutHistory = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState(null);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
    const token = localStorage.getItem('admin_token');

    const axiosInstance = axios.create({
        baseURL: API_URL,
        headers: { Authorization: `Bearer ${token}` }
    });

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await axiosInstance.get('/admin/manual-verifications');
                setHistory(res.data.data);
            } catch (error) {
                console.error("Gagal mengambil riwayat verifikasi admin:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    useEffect(() => {
        if (!selectedItem) return;
        const handleKey = (e) => { if (e.key === 'Escape') setSelectedItem(null); };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [selectedItem]);

    const formatDateTime = (dateString) => {
        if (!dateString) return '-';
        return {
            date: wibDate(dateString, { day: 'numeric', month: 'short', year: 'numeric' }),
            time: `${wibTime(dateString)} WIB`
        };
    };

    return (
        <div className="bg-white p-6 rounded-2xl border border-[#E2E6EE] shadow-sm min-h-[500px] flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-xl font-bold text-[#101828] flex items-center gap-2">
                        <ClipboardList className="text-[#26468A]" size={24} /> Riwayat Verifikasi STNK
                    </h2>
                    <p className="text-sm text-[#667085] mt-1">Pantau daftar tap-out manual yang dilakukan oleh petugas lapangan.</p>
                </div>
            </div>

            {/* Tabel Data */}
            <div className="overflow-x-auto rounded-xl border border-[#E2E6EE] custom-scrollbar flex-1 max-h-[calc(100vh-16rem)]">
                <table className="w-full text-left text-sm relative">
                    <thead className="bg-[#F3F5F9] sticky top-0 z-10 shadow-sm">
                        <tr className="text-[#667085] text-xs uppercase tracking-widest font-bold border-b border-[#E2E6EE]">
                            <th className="py-4 px-5">Waktu Tap-Out</th>
                            <th className="py-4 px-5">Plat Verifikasi</th>
                            <th className="py-4 px-5">Info Kendaraan</th>
                            <th className="py-4 px-5">Pengemudi</th>
                            <th className="py-4 px-5 text-center">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="5" className="py-12 text-center text-[#98A2B3] font-medium">Memuat data riwayat...</td></tr>
                        ) : history.length > 0 ? (
                            history.map((item) => {
                                const { date, time } = formatDateTime(item.created_at);
                                return (
                                    <tr key={item.id} className="border-b border-[#E2E6EE] hover:bg-[#F3F5F9]/70 transition-colors">
                                        <td className="py-4 px-5">
                                            <div className="flex flex-col gap-1">
                                                <span className="inline-flex items-center gap-1.5 text-[#101828] font-bold">
                                                    <Calendar size={14} className="text-[#26468A]"/> {date}
                                                </span>
                                                <span className="inline-flex items-center gap-1.5 text-[#667085] text-xs font-medium">
                                                    <Clock size={14} /> {time}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-5">
                                            <span className="inline-flex items-center justify-center px-3 py-1.5 bg-[#26468A] text-white font-black tracking-widest rounded-lg shadow-sm">
                                                {item.verified_plate}
                                            </span>
                                        </td>
                                        <td className="py-4 px-5">
                                            <div className="flex flex-col gap-1 text-xs">
                                                <span className="font-bold text-[#101828] flex items-center gap-1.5">
                                                    <Car size={14} className="text-[#98A2B3]"/> {item.vehicle_model}
                                                </span>
                                                <span className="text-[#667085] flex items-center gap-1.5 capitalize">
                                                    <Palette size={14} className="text-[#98A2B3]"/> {item.vehicle_color}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-5">
                                            <span className="inline-flex items-center gap-2 font-bold text-[#475467] capitalize bg-[#F3F5F9] px-3 py-1.5 rounded-lg border border-[#E2E6EE]">
                                                <User size={14} className="text-[#98A2B3]"/> {item.driver_name}
                                            </span>
                                        </td>
                                        <td className="py-4 px-5 text-center">
                                            <button 
                                                onClick={() => setSelectedItem(item)}
                                                className="inline-flex items-center gap-2 bg-[#F3F5F9] hover:bg-[#E2E6EE] text-[#26468A] px-3 py-2 rounded-lg text-xs font-bold transition-colors border border-[#E2E6EE]"
                                            >
                                                <Eye size={14} /> Detail
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan="5" className="py-16 text-center text-[#98A2B3]">
                                    <div className="flex flex-col items-center justify-center gap-3">
                                        <FileText size={48} className="text-[#E2E6EE]" />
                                        <p className="font-bold tracking-widest uppercase text-sm">Belum Ada Riwayat</p>
                                        <p className="text-xs">Data tap-out manual akan muncul di sini.</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* MODAL DETAIL */}
            {selectedItem && (
                <div
                    className="fixed inset-0 bg-[#101828]/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-200"
                    onClick={() => setSelectedItem(null)}
                >
                    <div
                        className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-[#E2E6EE] overflow-hidden flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="bg-[#F3F5F9] p-6 flex justify-between items-start border-b border-[#E2E6EE]">
                            <div>
                                <h3 className="text-xl font-black text-[#101828] flex items-center gap-2">
                                    <FileText className="text-[#26468A]" size={24} /> Detail Verifikasi
                                </h3>
                                <p className="text-xs text-[#98A2B3] mt-1 uppercase tracking-widest font-bold">
                                    ID Transaksi: #{selectedItem.transaction?.id || 'Unknown'}
                                </p>
                            </div>
                            <button onClick={() => setSelectedItem(null)} className="text-[#98A2B3] hover:text-[#101828] bg-white p-2 rounded-xl border border-[#E2E6EE] hover:bg-[#EEF1F5] transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 space-y-5 overflow-y-auto max-h-[70vh] custom-scrollbar">
                            
                            {/* Info Kendaraan & Pengemudi */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-[#F3F5F9] p-4 rounded-xl border border-[#E2E6EE]">
                                    <p className="text-[10px] text-[#98A2B3] uppercase tracking-widest font-bold mb-1">Plat Verifikasi</p>
                                    <p className="text-lg font-black text-[#101828] tracking-widest">{selectedItem.verified_plate}</p>
                                </div>
                                <div className="bg-[#F3F5F9] p-4 rounded-xl border border-[#E2E6EE]">
                                    <p className="text-[10px] text-[#98A2B3] uppercase tracking-widest font-bold mb-1">Pengemudi</p>
                                    <p className="text-sm font-bold text-[#101828] capitalize">{selectedItem.driver_name}</p>
                                </div>
                                <div className="bg-[#F3F5F9] p-4 rounded-xl border border-[#E2E6EE]">
                                    <p className="text-[10px] text-[#98A2B3] uppercase tracking-widest font-bold mb-1">Kendaraan</p>
                                    <p className="text-sm font-bold text-[#101828]">{selectedItem.vehicle_model}</p>
                                </div>
                                <div className="bg-[#F3F5F9] p-4 rounded-xl border border-[#E2E6EE]">
                                    <p className="text-[10px] text-[#98A2B3] uppercase tracking-widest font-bold mb-1">Warna</p>
                                    <p className="text-sm font-bold text-[#101828] capitalize">{selectedItem.vehicle_color}</p>
                                </div>
                            </div>

                            {/* Detail Transaksi Parkir */}
                            {selectedItem.transaction && (
                                <div className="bg-[#26468A]/5 p-5 rounded-xl border border-[#26468A]/10 space-y-3">
                                    <h4 className="text-xs font-black text-[#26468A] uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <MapPin size={14} /> Informasi Parkir
                                    </h4>
                                    
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-[#667085] font-medium">Slot Alokasi:</span>
                                        <span className="font-bold text-[#26468A]">{selectedItem.transaction.slot?.slot_code || '-'}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-[#667085] font-medium">Waktu Masuk:</span>
                                        <span className="font-bold text-[#101828]">
                                            {formatDateTime(selectedItem.transaction.entry_time).date} - {formatDateTime(selectedItem.transaction.entry_time).time}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-[#667085] font-medium">Waktu Keluar:</span>
                                        <span className="font-bold text-[#101828]">
                                            {formatDateTime(selectedItem.transaction.exit_time).date} - {formatDateTime(selectedItem.transaction.exit_time).time}
                                        </span>
                                    </div>
                                    
                                    <div className="pt-3 mt-3 border-t border-[#26468A]/10 flex justify-between items-center">
                                        <span className="text-[#667085] font-bold text-xs uppercase tracking-widest flex items-center gap-1.5">
                                            <Receipt size={14} /> Total Biaya
                                        </span>
                                        <span className="text-xl font-black text-emerald-600">
                                            Rp {Number(selectedItem.transaction.fee || selectedItem.transaction.total_fee || 0).toLocaleString('id-ID')}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 border-t border-[#E2E6EE] bg-[#F3F5F9] flex justify-end">
                            <button 
                                onClick={() => setSelectedItem(null)} 
                                className="bg-[#26468A] hover:bg-[#1d3872] text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-colors"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminManualTapOutHistory;
