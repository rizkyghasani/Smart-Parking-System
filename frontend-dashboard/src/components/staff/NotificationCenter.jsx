import React from 'react';
import axios from 'axios';
import { X, AlertTriangle, CheckCircle, Info, ArrowRightLeft, Clock, CheckCheck, FileText } from 'lucide-react';

const NotificationCenter = ({ isOpen, onClose, notifications, refreshData, onNavigateToMonitor, onOpenManualVerification }) => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
    const token = localStorage.getItem('staff_token');

    const unreadCount = notifications.filter(n => n.read_at === null).length;

    const handleMarkAsRead = async (id, isRead) => {
        if (isRead) return;
        try {
            await axios.patch(`${API_URL}/staff/notifications/${id}/read`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            refreshData();
        } catch (error) {
            console.error('Gagal menandai notifikasi dibaca', error);
        }
    };

    const handleClearAll = async () => {
        if (unreadCount === 0) return;
        if (!window.confirm(`Tandai ${unreadCount} notifikasi sebagai sudah dibaca?`)) return;
        try {
            await axios.patch(`${API_URL}/staff/notifications/clear-all`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            refreshData();
        } catch (error) {
            console.error('Gagal menandai semua notifikasi', error);
        }
    };

    const handleActionClick = (id, isRead) => {
        handleMarkAsRead(id, isRead);
        onNavigateToMonitor();
    };

    // 🌟 BARU: aksi khusus untuk permintaan tap-out manual
    const handleManualVerificationClick = (notif) => {
        handleMarkAsRead(notif.id, notif.read_at !== null);
        if (onOpenManualVerification && notif.transaction_id) {
            onOpenManualVerification(notif.transaction_id);
        }
        onClose(); // tutup panel notif supaya modal verifikasi terlihat jelas
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
    };

    return (
        <>
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity"
                    onClick={onClose}
                />
            )}

            <div className={`fixed top-0 right-0 h-full w-full max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'} flex flex-col`}>

                <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950">
                    <div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            Pusat Notifikasi
                        </h2>
                        <p className="text-sm text-slate-400 mt-1">Peringatan sistem & pelanggaran area.</p>
                    </div>
                    <button onClick={onClose} className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {unreadCount > 0 && (
                    <div className="px-6 py-3 border-b border-slate-800 bg-slate-950/50 flex justify-between items-center">
                        <span className="text-xs text-slate-500 font-medium">
                            {unreadCount} belum dibaca
                        </span>
                        <button
                            onClick={handleClearAll}
                            className="text-xs text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1.5 transition-colors"
                        >
                            <CheckCheck size={14} /> Tandai Semua Dibaca
                        </button>
                    </div>
                )}

                <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                    {notifications.length > 0 ? (
                        notifications.map((notif) => {
                            const isViolation = notif.type === 'violation';
                            const isManualRequest = notif.type === 'manual_tapout_request';
                            const isRead = notif.read_at !== null;

                            return (
                                <div
                                    key={notif.id}
                                    className={`relative p-5 rounded-2xl border transition-all ${
                                        isRead
                                            ? 'bg-slate-950/50 border-slate-800 opacity-60'
                                            : isViolation
                                                ? 'bg-rose-950/30 border-rose-500/30 shadow-lg shadow-rose-900/20'
                                                : isManualRequest
                                                    ? 'bg-amber-950/30 border-amber-500/30 shadow-lg shadow-amber-900/20'
                                                    : 'bg-slate-800 border-slate-700'
                                    }`}
                                >
                                    {!isRead && (
                                        <span className="absolute top-4 right-4 w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                                    )}

                                    <div className="flex gap-4">
                                        <div className="flex-shrink-0 mt-1">
                                            {isViolation ? (
                                                <div className="bg-rose-500/20 p-2 rounded-lg text-rose-500">
                                                    <AlertTriangle size={20} />
                                                </div>
                                            ) : isManualRequest ? (
                                                <div className="bg-amber-500/20 p-2 rounded-lg text-amber-500">
                                                    <FileText size={20} />
                                                </div>
                                            ) : (
                                                <div className="bg-blue-500/20 p-2 rounded-lg text-blue-400">
                                                    <Info size={20} />
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-1">
                                            <h4 className={`text-sm font-bold tracking-wide ${isViolation ? 'text-rose-400' : isManualRequest ? 'text-amber-400' : 'text-white'}`}>
                                                {notif.title}
                                            </h4>
                                            <p className="text-sm text-slate-300 mt-1 leading-relaxed">
                                                {notif.body}
                                            </p>

                                            <div className="flex items-center gap-4 mt-3">
                                                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-1">
                                                    <Clock size={12} /> {formatTime(notif.created_at)}
                                                </span>
                                            </div>

                                            {isViolation && !isRead && (
                                                <button
                                                    onClick={() => handleActionClick(notif.id, isRead)}
                                                    className="mt-4 w-full bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold uppercase tracking-widest py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors"
                                                >
                                                    <ArrowRightLeft size={14} /> Tindak Lanjuti (Override)
                                                </button>
                                            )}

                                            {/* 🌟 BARU: tombol khusus permintaan tap-out manual */}
                                            {isManualRequest && !isRead && (
                                                <button
                                                    onClick={() => handleManualVerificationClick(notif)}
                                                    className="mt-4 w-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-widest py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors"
                                                >
                                                    <FileText size={14} /> Proses Verifikasi STNK
                                                </button>
                                            )}

                                            {!isViolation && !isManualRequest && !isRead && (
                                                <button
                                                    onClick={() => handleMarkAsRead(notif.id, isRead)}
                                                    className="mt-3 text-xs text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1"
                                                >
                                                    <CheckCircle size={14} /> Tandai Dibaca
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-3">
                            <CheckCircle size={48} className="text-emerald-500/50" />
                            <p className="font-bold tracking-widest uppercase text-sm">Semua Aman</p>
                            <p className="text-xs">Tidak ada notifikasi baru saat ini.</p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default NotificationCenter;