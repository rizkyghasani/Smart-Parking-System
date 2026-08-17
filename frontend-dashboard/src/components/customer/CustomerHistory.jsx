import React from 'react';
import { History, Clock, MapPin, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

const CustomerHistory = ({ transactions, limit, setLimit, page, setPage }) => {
    
    // Karena sekarang dari Laravel bentuknya pagination object, array datanya ada di dalam properti .data
    const displayedTransactions = transactions?.data || [];
    const lastPage = transactions?.last_page || 1;
    const totalData = transactions?.total || 0;

    return (
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-md animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* HEADER & DROPDOWN AREA */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <History size={20} className="text-blue-400"/> Riwayat Parkir Anda
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">Total {totalData} riwayat transaksi ditemukan</p>
                </div>
                
                {/* Dropdown Limit Server-Side */}
                <div className="flex items-center gap-3 text-sm">
                    <span className="text-slate-400 font-medium">Tampilkan:</span>
                    <div className="relative">
                        <select 
                            value={limit}
                            onChange={(e) => {
                                setLimit(Number(e.target.value));
                                setPage(1); // Reset ke halaman 1 setiap kali mengubah limit
                            }}
                            className="appearance-none bg-slate-950 border border-slate-700 text-white py-2 pl-4 pr-10 rounded-xl focus:outline-none focus:border-blue-500 transition-colors font-bold cursor-pointer"
                        >
                            <option value={5}>5 Data</option>
                            <option value={10}>10 Data</option>
                            <option value={25}>25 Data</option>
                            <option value={50}>50 Data</option>
                        </select>
                        <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                </div>
            </div>

            {/* TABEL RIWAYAT */}
            <div className="overflow-x-auto overflow-y-auto max-h-[450px] rounded-xl border border-slate-700/50 custom-scrollbar">
                <table className="w-full text-left relative">
                    <thead className="bg-slate-950 sticky top-0 z-10 shadow-md">
                        <tr className="text-slate-400 text-xs uppercase tracking-widest font-bold border-b border-slate-800">
                            <th className="py-4 px-4 whitespace-nowrap bg-slate-950">Waktu & Durasi</th>
                            <th className="py-4 px-4 whitespace-nowrap text-center bg-slate-950">Slot Parkir</th>
                            <th className="py-4 px-4 whitespace-nowrap bg-slate-950">Total Biaya & Tipe</th>
                        </tr>
                    </thead>
                    <tbody>
                        {displayedTransactions.length > 0 ? (
                            displayedTransactions.map((tx) => {
                                const slotCode = tx.slot?.slot_code || tx.parking_slot?.slot_code || '-';
                                
                                return (
                                    <tr key={tx.id} className="border-b border-slate-800/50 hover:bg-slate-800/50 transition-colors">
                                        <td className="py-4 px-4">
                                            <div className="text-sm font-mono text-slate-200">
                                                {new Date(tx.entry_time).toLocaleString('id-ID', { 
                                                    day: 'numeric', month: 'short', year: 'numeric', 
                                                    hour: '2-digit', minute: '2-digit' 
                                                })}
                                            </div>
                                            {tx.duration_minutes !== null && (
                                                <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-1 font-medium">
                                                    <Clock size={12} /> {tx.duration_minutes} Menit
                                                </div>
                                            )}
                                        </td>
                                        <td className="py-4 px-4 text-center">
                                            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-950 border border-slate-700 rounded-lg">
                                                <MapPin size={14} className={slotCode !== '-' ? "text-emerald-400" : "text-slate-500"} />
                                                <span className="font-black text-white tracking-widest">
                                                    {slotCode}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4">
                                            <div className="font-bold text-white text-sm mb-1.5">
                                                Rp {tx.fee?.toLocaleString('id-ID') || 0}
                                            </div>
                                            <div>
                                                {tx.is_member ? (
                                                    <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-black rounded-md uppercase tracking-wider border border-emerald-500/20">
                                                        Member
                                                    </span>
                                                ) : (
                                                    <span className="px-2.5 py-0.5 bg-slate-700/50 text-slate-300 text-[10px] font-black rounded-md uppercase tracking-wider border border-slate-700">
                                                        Normal
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan="3" className="py-12 text-center text-slate-500 italic bg-slate-900/50">
                                    Belum ada riwayat transaksi parkir.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* 🌟 KONTROL PAGINASI (PREV / NEXT) */}
            {totalData > 0 && (
                <div className="mt-6 flex items-center justify-between border-t border-slate-800 pt-4">
                    <span className="text-xs text-slate-500">
                        Halaman <span className="font-bold text-white">{page}</span> dari <span className="font-bold text-white">{lastPage}</span>
                    </span>
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => setPage(page - 1)}
                            disabled={page === 1}
                            className="p-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-400 hover:text-white hover:border-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <button 
                            onClick={() => setPage(page + 1)}
                            disabled={page === lastPage}
                            className="p-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-400 hover:text-white hover:border-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomerHistory;