import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    ClipboardList, Car, User, Calendar, FileText, 
    Clock, Palette, Search, Eye, X, MapPin, Receipt
} from 'lucide-react';

const AdminManualTapOutHistory = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // State untuk Modal Detail
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

    const formatDateTime = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return {
            date: date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
            time: date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB'
        };
    };

    return (
        <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm min-h-[500px] flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <ClipboardList className="text-indigo-600" size={24} /> Riwayat Verifikasi STNK
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">Pantau daftar tap-out manual yang dilakukan oleh petugas lapangan.</p>
                </div>
            </div>

            {/* Tabel Data */}
            <div className="overflow-x-auto rounded-xl border border-gray-200 custom-scrollbar flex-1 max-h-[calc(100vh-16rem)]">
                <table className="w-full text-left text-sm relative">
                    <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
                        <tr className="text-gray-500 text-xs uppercase tracking-widest font-bold border-b border-gray-200">
                            <th className="py-4 px-5">Waktu Tap-Out</th>
                            <th className="py-4 px-5">Plat Verifikasi</th>
                            <th className="py-4 px-5">Info Kendaraan</th>
                            <th className="py-4 px-5">Pengemudi</th>
                            <th className="py-4 px-5 text-center">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="5" className="py-12 text-center text-gray-400 font-medium">Memuat data riwayat...</td></tr>
                        ) : history.length > 0 ? (
                            history.map((item) => {
                                const { date, time } = formatDateTime(item.created_at);
                                return (
                                    <tr key={item.id} className="border-b border-gray-100 hover:bg-indigo-50/40 transition-colors">
                                        <td className="py-4 px-5">
                                            <div className="flex flex-col gap-1">
                                                <span className="inline-flex items-center gap-1.5 text-gray-800 font-bold">
                                                    <Calendar size={14} className="text-indigo-500"/> {date}
                                                </span>
                                                <span className="inline-flex items-center gap-1.5 text-gray-500 text-xs font-medium">
                                                    <Clock size={14} /> {time}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-5">
                                            <span className="inline-flex items-center justify-center px-3 py-1.5 bg-slate-900 text-white font-black tracking-widest rounded-lg border border-slate-700 shadow-md">
                                                {item.verified_plate}
                                            </span>
                                        </td>
                                        <td className="py-4 px-5">
                                            <div className="flex flex-col gap-1 text-xs">
                                                <span className="font-bold text-gray-800 flex items-center gap-1.5">
                                                    <Car size={14} className="text-slate-400"/> {item.vehicle_model}
                                                </span>
                                                <span className="text-gray-500 flex items-center gap-1.5 capitalize">
                                                    <Palette size={14} className="text-slate-400"/> {item.vehicle_color}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-5">
                                            <span className="inline-flex items-center gap-2 font-bold text-gray-700 capitalize bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200">
                                                <User size={14} className="text-gray-500"/> {item.driver_name}
                                            </span>
                                        </td>
                                        <td className="py-4 px-5 text-center">
                                            <button 
                                                onClick={() => setSelectedItem(item)}
                                                className="inline-flex items-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 px-3 py-2 rounded-lg text-xs font-bold transition-colors border border-indigo-200"
                                            >
                                                <Eye size={14} /> Detail
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan="5" className="py-16 text-center text-gray-400">
                                    <div className="flex flex-col items-center justify-center gap-3">
                                        <FileText size={48} className="text-gray-300" />
                                        <p className="font-bold tracking-widest uppercase text-sm">Belum Ada Riwayat</p>
                                        <p className="text-xs">Data tap-out manual akan muncul di sini.</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* 🌟 MODAL DETAIL TRANSAKSI */}
            {selectedItem && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-200">
                    <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
                        
                        {/* Modal Header */}
                        <div className="bg-slate-900 p-6 flex justify-between items-start">
                            <div>
                                <h3 className="text-xl font-black text-white flex items-center gap-2">
                                    <FileText className="text-indigo-400" size={24} /> Detail Verifikasi
                                </h3>
                                <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-bold">
                                    ID Transaksi: #{selectedItem.transaction?.id || 'Unknown'}
                                </p>
                            </div>
                            <button onClick={() => setSelectedItem(null)} className="text-slate-400 hover:text-white bg-slate-800 p-2 rounded-xl transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
                            
                            {/* Info Kendaraan & Pengemudi */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                    <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-1">Plat Verifikasi</p>
                                    <p className="text-lg font-black text-gray-800 tracking-widest">{selectedItem.verified_plate}</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                    <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-1">Pengemudi</p>
                                    <p className="text-sm font-bold text-gray-800 capitalize">{selectedItem.driver_name}</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                    <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-1">Kendaraan</p>
                                    <p className="text-sm font-bold text-gray-800">{selectedItem.vehicle_model}</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                    <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-1">Warna</p>
                                    <p className="text-sm font-bold text-gray-800 capitalize">{selectedItem.vehicle_color}</p>
                                </div>
                            </div>

                            {/* Detail Transaksi Parkir */}
                            {selectedItem.transaction && (
                                <div className="bg-indigo-50/50 p-5 rounded-2xl border border-indigo-100 space-y-3">
                                    <h4 className="text-xs font-black text-indigo-800 uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <MapPin size={14} /> Informasi Parkir
                                    </h4>
                                    
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-500 font-medium">Slot Alokasi:</span>
                                        <span className="font-bold text-indigo-700">{selectedItem.transaction.slot?.slot_code || '-'}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-500 font-medium">Waktu Masuk:</span>
                                        <span className="font-bold text-gray-800">
                                            {formatDateTime(selectedItem.transaction.entry_time).date} - {formatDateTime(selectedItem.transaction.entry_time).time}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-500 font-medium">Waktu Keluar:</span>
                                        <span className="font-bold text-gray-800">
                                            {formatDateTime(selectedItem.transaction.exit_time).date} - {formatDateTime(selectedItem.transaction.exit_time).time}
                                        </span>
                                    </div>
                                    
                                    <div className="pt-3 mt-3 border-t border-indigo-200/50 flex justify-between items-center">
                                        <span className="text-gray-500 font-bold text-xs uppercase tracking-widest flex items-center gap-1.5">
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
                        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
                            <button 
                                onClick={() => setSelectedItem(null)} 
                                className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-colors"
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