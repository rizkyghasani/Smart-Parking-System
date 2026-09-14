import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    Bell, AlertTriangle, CheckCircle, Info, Clock, 
    RotateCcw, User, FileText, CheckCheck, Filter, Trash2
} from 'lucide-react';
import { wibDate, wibTime } from '../../utils/time';

const AdminNotificationPage = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterUnresolved, setFilterUnresolved] = useState(false);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
    const token = localStorage.getItem('admin_token');

    const axiosInstance = axios.create({
        baseURL: API_URL,
        headers: { Authorization: `Bearer ${token}` }
    });

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const res = await axiosInstance.get('/admin/notifications');
            setNotifications(res.data.data);
        } catch (error) {
            console.error("Gagal mengambil notifikasi admin:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const handleRetrigger = async (id) => {
        if (!window.confirm("Kirim ulang peringatan ini ke seluruh staf (Eskalasi)?")) return;
        
        try {
            await axiosInstance.post(`/admin/notifications/${id}/retrigger`);
            alert('Notifikasi berhasil dieskalasi ke staf lapangan.');
            fetchNotifications(); 
        } catch (error) {
            alert('Gagal melakukan eskalasi: ' + (error.response?.data?.message || 'Error server.'));
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Hapus riwayat notifikasi ini secara permanen?")) return;
        
        try {
            await axiosInstance.delete(`/admin/notifications/${id}`);
            fetchNotifications();
        } catch (error) {
            alert('Gagal menghapus: ' + (error.response?.data?.message || 'Error server.'));
        }
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return '-';
        return `${wibDate(dateString, { day: 'numeric', month: 'short' })}, ${wibTime(dateString)} WIB`;
    };

    const currentData = filterUnresolved 
        ? notifications.filter(n => n.resolved_by === null && n.type !== 'info') 
        : notifications;

    return (
        <div className="bg-white p-6 rounded-2xl border border-[#E2E6EE] shadow-sm min-h-[500px] flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 pb-4 border-b border-[#E2E6EE]">
                <div>
                    <h2 className="text-xl font-bold text-[#101828] flex items-center gap-2">
                        <Bell size={20} className="text-[#98A2B3]" /> Supervisi Notifikasi
                    </h2>
                    <p className="text-sm text-[#667085] mt-1">
                        Pantau penanganan peringatan sistem dan lakukan eskalasi jika tugas diabaikan staf.
                    </p>
                </div>
                <button 
                    onClick={fetchNotifications}
                    className="flex items-center gap-2 bg-[#F3F5F9] hover:bg-[#E2E6EE] text-[#475467] px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors border border-[#E2E6EE]"
                >
                    <RotateCcw size={14} /> Refresh Data
                </button>
            </div>

            {/* Toolbar Filter */}
            <div className="flex justify-between items-center gap-3 mb-5">
                <button 
                    onClick={() => setFilterUnresolved(!filterUnresolved)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all border ${
                        filterUnresolved 
                            ? 'bg-[#26468A] text-white border-[#26468A]' 
                            : 'bg-white text-[#667085] border-[#E2E6EE] hover:bg-[#F3F5F9]'
                    }`}
                >
                    <Filter size={13} /> {filterUnresolved ? 'Menampilkan: Belum Ditangani' : 'Tampilkan Belum Ditangani Saja'}
                </button>
            </div>

            {/* List Notifikasi */}
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3 max-h-[calc(100vh-16rem)]">
                {loading ? (
                    <div className="py-12 text-center text-[#98A2B3] text-sm">Memuat data supervisi...</div>
                ) : currentData.length > 0 ? (
                    currentData.map((notif) => {
                        const isViolation = notif.type === 'violation';
                        const isManualRequest = notif.type === 'manual_tapout_request';
                        const isInfo = notif.type === 'info';
                        
                        const isResolved = notif.resolved_by !== null || isInfo;
                        const isEscalation = notif.title.includes('[ESKALASI ADMIN]');

                        const accentBorder = isEscalation
                            ? 'border-l-rose-500'
                            : isViolation
                                ? 'border-l-rose-300'
                                : isManualRequest
                                    ? 'border-l-amber-300'
                                    : isInfo
                                        ? 'border-l-[#26468A]/30'
                                        : 'border-l-[#E2E6EE]';

                        return (
                            <div
                                key={notif.id}
                                className={`relative p-4 rounded-xl border border-[#E2E6EE] border-l-4 ${accentBorder} bg-white hover:bg-[#F3F5F9]/50 transition-colors flex flex-col md:flex-row gap-4 items-start md:items-center justify-between ${isResolved ? 'opacity-70 hover:opacity-100' : ''}`}
                            >
                                <div className="flex gap-3.5 items-start w-full md:w-auto">
                                    <div className="flex-shrink-0 mt-0.5 text-[#98A2B3]">
                                        {isEscalation ? (
                                            <AlertTriangle size={18} className="text-rose-500" />
                                        ) : isViolation ? (
                                            <AlertTriangle size={18} className="text-rose-400" />
                                        ) : isManualRequest ? (
                                            <FileText size={18} className="text-[#C97A1D]" />
                                        ) : (
                                            <Info size={18} className="text-[#26468A]" />
                                        )}
                                    </div>

                                    <div className="flex-1">
                                        <h4 className={`text-sm font-semibold tracking-tight ${isEscalation ? 'text-rose-600' : 'text-[#101828]'}`}>
                                            {notif.title}
                                        </h4>
                                        <p className="text-sm text-[#667085] mt-0.5 leading-relaxed">
                                            {notif.body}
                                        </p>
                                        <span className="text-xs text-[#98A2B3] flex items-center gap-1.5 mt-2">
                                            <Clock size={11} /> {formatDateTime(notif.created_at)}
                                        </span>
                                    </div>
                                </div>

                                {/* Area Status / Aksi */}
                                <div className="w-full md:w-auto flex items-center gap-2 mt-3 md:mt-0 min-w-[200px] justify-end">
                                    {isResolved ? (
                                        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                                            <div className="text-right">
                                                <p className="text-xs font-medium text-[#475467] flex items-center justify-end gap-1.5">
                                                    <span className={`w-1.5 h-1.5 rounded-full ${isInfo ? 'bg-[#26468A]' : 'bg-emerald-500'}`} />
                                                    {isInfo ? 'Log aktivitas' : 'Sudah ditangani'}
                                                </p>
                                                {(!isInfo || notif.resolver_name) && (
                                                    <p className="text-[11px] text-[#98A2B3] mt-0.5">
                                                        {notif.resolver_name || 'Sistem'} · {formatDateTime(notif.resolved_at || notif.created_at)}
                                                    </p>
                                                )}
                                            </div>

                                            <button
                                                onClick={() => handleDelete(notif.id)}
                                                className="p-2 text-[#E2E6EE] hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                                                title="Hapus riwayat ini"
                                            >
                                                <Trash2 size={15} />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                                            <span className="text-xs font-medium text-[#C97A1D] flex items-center gap-1.5">
                                                <span className="w-1.5 h-1.5 rounded-full bg-[#C97A1D] animate-pulse" />
                                                Menunggu petugas
                                            </span>
                                            
                                            <button
                                                onClick={() => handleRetrigger(notif.id)}
                                                className="bg-[#26468A] hover:bg-[#1d3872] text-white text-xs font-semibold px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap"
                                            >
                                                Eskalasi
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-[#98A2B3] space-y-3 py-20">
                        <CheckCircle size={40} className="text-[#E2E6EE]" />
                        <div className="text-center">
                            <p className="font-semibold text-sm text-[#667085]">Supervisi Aman</p>
                            <p className="text-xs text-[#98A2B3] mt-1">
                                {filterUnresolved ? 'Semua notifikasi sudah ditangani oleh staf.' : 'Belum ada riwayat notifikasi sistem.'}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminNotificationPage;
