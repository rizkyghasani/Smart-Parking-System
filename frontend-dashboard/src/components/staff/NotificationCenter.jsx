import React from 'react';
import axios from 'axios';
import { X, AlertTriangle, CheckCircle, Info, ArrowRightLeft, Clock, CheckCheck, FileText, Bell } from 'lucide-react';
import { wibTime } from '../../utils/time';

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

    const formatTime = (dateString) => `${wibTime(dateString)} WIB`;

    return (
        <>
            {isOpen && (
                <div
                    className="fixed inset-0 bg-[#101828]/50 backdrop-blur-sm z-50 transition-opacity"
                    onClick={onClose}
                />
            )}

            <div className={`fixed top-0 right-0 h-full w-full max-w-md bg-white border-l border-[#E2E6EE] shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'} flex flex-col`}>

                <div className="p-6 border-b border-[#E2E6EE] flex justify-between items-center bg-[#F3F5F9]">
                    <div>
                        <h2 className="text-xl font-bold text-[#101828] flex items-center gap-2">
                            <Bell className="text-[#26468A]" size={24} /> Pusat Notifikasi
                        </h2>
                        <p className="text-sm text-[#667085] mt-1">Peringatan sistem & pelanggaran area.</p>
                    </div>
                    <button onClick={onClose} className="p-2 bg-white hover:bg-[#EEF1F5] text-[#98A2B3] hover:text-[#101828] rounded-xl transition-colors border border-[#E2E6EE] cursor-pointer">
                        <X size={20} />
                    </button>
                </div>

                {unreadCount > 0 && (
                    <div className="px-6 py-3 border-b border-[#E2E6EE] bg-[#F3F5F9]/60 flex justify-between items-center">
                        <span className="text-xs text-[#667085] font-medium">
                            {unreadCount} belum dibaca
                        </span>
                        <button
                            onClick={handleClearAll}
                            className="text-xs text-[#26468A] hover:text-[#1d3872] font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
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
                                            ? 'bg-[#F3F5F9]/50 border-[#E2E6EE] opacity-60'
                                            : isViolation
                                                ? 'bg-rose-50 border-rose-300 shadow-lg shadow-rose-100'
                                                : isManualRequest
                                                    ? 'bg-amber-50 border-amber-300 shadow-lg shadow-amber-100'
                                                    : 'bg-white border-[#E2E6EE]'
                                    }`}
                                >
                                    {!isRead && (
                                        <span className="absolute top-4 right-4 w-2 h-2 rounded-full bg-[#26468A] animate-pulse"></span>
                                    )}

                                    <div className="flex gap-4">
                                        <div className="flex-shrink-0 mt-1">
                                            {isViolation ? (
                                                <div className="bg-rose-100 p-2 rounded-lg text-rose-600">
                                                    <AlertTriangle size={20} />
                                                </div>
                                            ) : isManualRequest ? (
                                                <div className="bg-[#C97A1D]/10 p-2 rounded-lg text-[#C97A1D]">
                                                    <FileText size={20} />
                                                </div>
                                            ) : (
                                                <div className="bg-[#26468A]/10 p-2 rounded-lg text-[#26468A]">
                                                    <Info size={20} />
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-1">
                                            <h4 className={`text-sm font-bold tracking-wide ${isViolation ? 'text-rose-700' : isManualRequest ? 'text-[#C97A1D]' : 'text-[#101828]'}`}>
                                                {notif.title}
                                            </h4>
                                            <p className="text-sm text-[#475467] mt-1 leading-relaxed">
                                                {notif.body}
                                            </p>

                                            <div className="flex items-center gap-4 mt-3">
                                                <span className="text-[10px] text-[#98A2B3] font-bold uppercase tracking-widest flex items-center gap-1">
                                                    <Clock size={12} /> {formatTime(notif.created_at)}
                                                </span>
                                            </div>

                                            {isViolation && !isRead && (
                                                <button
                                                    onClick={() => handleActionClick(notif.id, isRead)}
                                                    className="mt-4 w-full bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold uppercase tracking-widest py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-md shadow-rose-200 cursor-pointer"
                                                >
                                                    <ArrowRightLeft size={14} /> Tindak Lanjuti (Override)
                                                </button>
                                            )}

                                            {/* 🌟 BARU: tombol khusus permintaan tap-out manual */}
                                            {isManualRequest && !isRead && (
                                                <button
                                                    onClick={() => handleManualVerificationClick(notif)}
                                                    className="mt-4 w-full bg-[#C97A1D] hover:bg-[#b06a17] text-white text-xs font-bold uppercase tracking-widest py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-md shadow-[#C97A1D]/30 cursor-pointer"
                                                >
                                                    <FileText size={14} /> Proses Verifikasi STNK
                                                </button>
                                            )}

                                            {!isViolation && !isManualRequest && !isRead && (
                                                <button
                                                    onClick={() => handleMarkAsRead(notif.id, isRead)}
                                                    className="mt-3 text-xs text-[#26468A] hover:text-[#1d3872] font-bold flex items-center gap-1 cursor-pointer"
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
                        <div className="h-full flex flex-col items-center justify-center text-[#98A2B3] space-y-3">
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