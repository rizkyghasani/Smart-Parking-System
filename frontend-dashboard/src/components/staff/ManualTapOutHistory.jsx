import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ClipboardList, Car, User, Calendar, FileText, Clock, Palette } from 'lucide-react';

const ManualTapOutHistory = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
    const token = localStorage.getItem('staff_token');

    const axiosInstance = axios.create({
        baseURL: API_URL,
        headers: { Authorization: `Bearer ${token}` }
    });

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await axiosInstance.get('/staff/manual-verifications');
                setHistory(res.data.data);
            } catch (error) {
                console.error("Gagal mengambil riwayat manual verifikasi:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, []);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return {
            date: date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
            time: date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB'
        };
    };

    return (
        <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm min-h-[500px] flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <ClipboardList className="text-blue-500" size={24} /> Riwayat Verifikasi STNK (Manual)
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">Daftar kendaraan yang keluar menggunakan bantuan pengecekan fisik STNK.</p>
                </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-gray-200 custom-scrollbar flex-1 max-h-[calc(100vh-16rem)]">
                <table className="w-full text-left text-sm relative">
                    <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
                        <tr className="text-gray-500 text-xs uppercase tracking-widest font-bold border-b border-gray-200">
                            <th className="py-4 px-5">Waktu Tap-Out</th>
                            <th className="py-4 px-5">Plat Verifikasi</th>
                            <th className="py-4 px-5">Info Kendaraan</th>
                            <th className="py-4 px-5">Pengemudi</th>
                            <th className="py-4 px-5">ID Transaksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="5" className="py-12 text-center text-gray-400 font-medium">Memuat data riwayat...</td></tr>
                        ) : history.length > 0 ? (
                            history.map((item) => {
                                const { date, time } = formatDate(item.created_at);
                                return (
                                    <tr key={item.id} className="border-b border-gray-100 hover:bg-blue-50/50 transition-colors">
                                        <td className="py-4 px-5">
                                            <div className="flex flex-col gap-1">
                                                <span className="inline-flex items-center gap-1.5 text-gray-800 font-bold">
                                                    <Calendar size={14} className="text-blue-500"/> {date}
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
                                        <td className="py-4 px-5">
                                            <div className="flex flex-col gap-1">
                                                <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded w-fit border border-blue-100">
                                                    #{item.transaction_id}
                                                </span>
                                            </div>
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
        </div>
    );
};

export default ManualTapOutHistory;