import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    Bell, AlertTriangle, CheckCircle, Info, ArrowRightLeft, 
    Clock, CheckCheck, FileText, Filter, ChevronLeft, ChevronRight 
} from 'lucide-react';

const NotificationPage = ({ notifications, refreshData, onNavigateToMonitor, onOpenManualVerification }) => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
    const token = localStorage.getItem('staff_token');

    // 🌟 STATE UNTUK FILTER DAN PAGINASI
    const [filterUnread, setFilterUnread] = useState(false);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        setCurrentPage(1);
    }, [filterUnread, itemsPerPage]);

    const unreadCount = notifications.filter(n => n.read_at === null).length;

    // 🌟 LOGIKA FILTER & PAGINASI
    const filteredNotifications = notifications.filter(n => filterUnread ? n.read_at === null : true);
    
    const isAll = itemsPerPage === 'all';
    const totalItems = filteredNotifications.length;
    const totalPages = isAll ? 1 : Math.ceil(totalItems / itemsPerPage);
    
    const currentData = isAll 
        ? filteredNotifications 
        : filteredNotifications.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handleNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
    };

    const handlePrevPage = () => {
        if (currentPage > 1) setCurrentPage(prev => prev - 1);
    };

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

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) + ', ' + 
               date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
    };

    return (
        <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm min-h-[500px] flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 pb-4 border-b border-gray-100">
                <div>
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <Bell className="text-blue-500" size={24} /> Pusat Notifikasi
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Pusat kendali peringatan sistem, panggilan bantuan, dan pelanggaran area.
                    </p>
                </div>
                {unreadCount > 0 && (
                    <button
                        onClick={handleClearAll}
                        className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-600 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors"
                    >
                        <CheckCheck size={16} /> Tandai Semua Dibaca ({unreadCount})
                    </button>
                )}
            </div>

            {/* TOOLBAR FILTER & PAGINASI */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mb-4 bg-gray-50 p-3 rounded-xl border border-gray-100">
                <button 
                    onClick={() => setFilterUnread(!filterUnread)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all border ${
                        filterUnread 
                            ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200' 
                            : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-100'
                    }`}
                >
                    <Filter size={14} /> {filterUnread ? 'Menampilkan: Belum Dibaca' : 'Tampilkan Belum Dibaca Saja'}
                </button>

                <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                    <label>Tampilkan:</label>
                    <select 
                        value={itemsPerPage} 
                        onChange={(e) => setItemsPerPage(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                        className="bg-white border border-gray-200 text-gray-700 px-2 py-1.5 rounded-lg focus:outline-none focus:border-blue-500 cursor-pointer font-medium"
                    >
                        <option value={10}>10 Baris</option>
                        <option value={30}>30 Baris</option>
                        <option value={50}>50 Baris</option>
                        <option value="all">Semua Data</option>
                    </select>
                </div>
            </div>

            {/* List Notifikasi */}
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-4 max-h-[calc(100vh-16rem)]">
                {currentData.length > 0 ? (
                    currentData.map((notif) => {
                        const isViolation = notif.type === 'violation';
                        const isManualRequest = notif.type === 'manual_tapout_request';
                        const isRead = notif.read_at !== null;
                        
                        // 🌟 DETEKSI NOTIFIKASI ESKALASI
                        const isEscalation = notif.title.includes('[ESKALASI ADMIN]');

                        return (
                            <div
                                key={notif.id}
                                className={`relative p-5 rounded-2xl border transition-all flex flex-col md:flex-row gap-5 items-start md:items-center justify-between ${
                                    isRead
                                        ? 'bg-gray-50/50 border-gray-200 opacity-70'
                                        : isEscalation // 🌟 STYLING KHUSUS ESKALASI
                                            ? 'bg-rose-50 border-rose-400 shadow-md shadow-rose-200 ring-1 ring-rose-400'
                                            : isViolation
                                                ? 'bg-rose-50 border-rose-200 shadow-sm shadow-rose-100'
                                                : isManualRequest
                                                    ? 'bg-amber-50 border-amber-200 shadow-sm shadow-amber-100'
                                                    : 'bg-white border-blue-200 shadow-sm'
                                }`}
                            >
                                <div className="flex gap-4 items-start">
                                    <div className="flex-shrink-0 mt-1">
                                        {isEscalation ? (
                                            <div className="bg-rose-600 p-2.5 rounded-xl text-white animate-pulse"><AlertTriangle size={20} /></div>
                                        ) : isViolation ? (
                                            <div className="bg-rose-100 p-2.5 rounded-xl text-rose-600"><AlertTriangle size={20} /></div>
                                        ) : isManualRequest ? (
                                            <div className="bg-amber-100 p-2.5 rounded-xl text-amber-600"><FileText size={20} /></div>
                                        ) : (
                                            <div className="bg-blue-100 p-2.5 rounded-xl text-blue-600"><Info size={20} /></div>
                                        )}
                                    </div>

                                    <div>
                                        <h4 className={`text-base font-bold tracking-tight ${isEscalation ? 'text-rose-700 uppercase font-black' : isViolation ? 'text-rose-700' : isManualRequest ? 'text-amber-700' : 'text-gray-800'}`}>
                                            {notif.title}
                                            {!isRead && <span className={`ml-3 text-[9px] text-white px-2 py-0.5 rounded-full animate-pulse uppercase tracking-widest align-middle ${isEscalation ? 'bg-rose-600' : 'bg-blue-500'}`}>Baru</span>}
                                        </h4>
                                        <p className="text-sm text-gray-600 mt-1">
                                            {notif.body}
                                        </p>
                                        <div className="flex items-center gap-4 mt-2">
                                            <span className="text-xs text-gray-400 font-bold flex items-center gap-1.5">
                                                <Clock size={12} /> {formatTime(notif.created_at)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Tombol Aksi */}
                                <div className="w-full md:w-auto flex flex-col sm:flex-row gap-2 mt-4 md:mt-0">
                                    {(isViolation || (isEscalation && notif.type === 'violation')) && !isRead && (
                                        <button
                                            onClick={() => { handleMarkAsRead(notif.id, isRead); onNavigateToMonitor(); }}
                                            className="bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-md shadow-rose-200"
                                        >
                                            <ArrowRightLeft size={14} /> Pindah Slot
                                        </button>
                                    )}

                                    {(isManualRequest || (isEscalation && notif.type === 'manual_tapout_request')) && !isRead && (
                                        <button
                                            onClick={() => { 
                                                handleMarkAsRead(notif.id, isRead); 
                                                if (onOpenManualVerification && notif.transaction_id) onOpenManualVerification(notif.transaction_id); 
                                            }}
                                            className="bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-md shadow-amber-200"
                                        >
                                            <FileText size={14} /> Proses STNK
                                        </button>
                                    )}

                                    {!isRead && (
                                        <button
                                            onClick={() => handleMarkAsRead(notif.id, isRead)}
                                            className="bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-bold px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors"
                                        >
                                            <CheckCircle size={14} /> Tandai Selesai
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4 py-20">
                        <CheckCircle size={64} className="text-emerald-100" />
                        <div className="text-center">
                            <p className="font-bold tracking-widest uppercase text-base text-gray-500">Semua Terkendali</p>
                            <p className="text-sm mt-1">
                                {filterUnread ? 'Tidak ada notifikasi yang belum dibaca.' : 'Tidak ada notifikasi baru saat ini.'}
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* FOOTER PAGINASI */}
            {!isAll && totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                        Halaman {currentPage} dari {totalPages}
                    </span>
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={handlePrevPage}
                            disabled={currentPage === 1}
                            className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-100 disabled:opacity-50 transition-all cursor-pointer"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <button 
                            onClick={handleNextPage}
                            disabled={currentPage === totalPages}
                            className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-100 disabled:opacity-50 transition-all cursor-pointer"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationPage;