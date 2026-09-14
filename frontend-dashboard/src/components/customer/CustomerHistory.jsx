import React from 'react';
import { History, Clock, MapPin, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { wibDateTime } from '../../utils/time';

const CustomerHistory = ({ transactions, limit, setLimit, page, setPage }) => {
    
    // Karena sekarang dari Laravel bentuknya pagination object, array datanya ada di dalam properti .data
    const displayedTransactions = transactions?.data || [];
    const lastPage = transactions?.last_page || 1;
    const totalData = transactions?.total || 0;

    return (
        <div className="bg-white p-6 rounded-2xl border border-[#E2E6EE] shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* HEADER & DROPDOWN AREA */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-lg font-bold flex items-center gap-2 text-[#101828]">
                        <History size={20} className="text-[#26468A]"/> Riwayat Parkir Anda
                    </h2>
                    <p className="text-xs text-[#98A2B3] mt-1">Total {totalData} riwayat transaksi ditemukan</p>
                </div>
                
                {/* Dropdown Limit Server-Side */}
                <div className="flex items-center gap-3 text-sm">
                    <span className="text-[#667085] font-medium">Tampilkan:</span>
                    <div className="relative">
                        <select 
                            value={limit}
                            onChange={(e) => {
                                setLimit(Number(e.target.value));
                                setPage(1); // Reset ke halaman 1 setiap kali mengubah limit
                            }}
                            className="appearance-none bg-white border border-[#E2E6EE] text-[#101828] py-2 pl-4 pr-10 rounded-xl focus:outline-none focus:border-[#26468A] transition-colors font-bold cursor-pointer"
                        >
                            <option value={5}>5 Data</option>
                            <option value={10}>10 Data</option>
                            <option value={25}>25 Data</option>
                            <option value={50}>50 Data</option>
                        </select>
                        <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#98A2B3] pointer-events-none" />
                    </div>
                </div>
            </div>

            {/* TABEL RIWAYAT */}
            <div className="overflow-x-auto overflow-y-auto max-h-[450px] rounded-xl border border-[#E2E6EE] custom-scrollbar">
                <table className="w-full text-left relative">
                    <thead className="bg-white sticky top-0 z-10">
                        <tr className="text-[#667085] text-xs uppercase tracking-widest font-bold border-b border-[#E2E6EE]">
                            <th className="py-4 px-4 whitespace-nowrap bg-white">Waktu & Durasi</th>
                            <th className="py-4 px-4 whitespace-nowrap text-center bg-white">Slot Parkir</th>
                            <th className="py-4 px-4 whitespace-nowrap bg-white">Total Biaya & Tipe</th>
                        </tr>
                    </thead>
                    <tbody>
                        {displayedTransactions.length > 0 ? (
                            displayedTransactions.map((tx) => {
                                const slotCode = tx.slot?.slot_code || tx.parking_slot?.slot_code || '-';
                                
                                return (
                                    <tr key={tx.id} className="border-b border-[#E2E6EE] hover:bg-[#26468A]/[0.04] transition-colors">
                                        <td className="py-4 px-4">
                                            <div className="text-sm font-mono text-[#101828]">
                                                {wibDateTime(tx.entry_time)}
                                            </div>
                                            {tx.duration_minutes !== null && (
                                                <div className="text-[11px] text-[#98A2B3] flex items-center gap-1.5 mt-1 font-medium">
                                                    <Clock size={12} /> {tx.duration_minutes} Menit
                                                </div>
                                            )}
                                        </td>
                                        <td className="py-4 px-4 text-center">
                                            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#F3F5F9] border border-[#E2E6EE] rounded-lg">
                                                <MapPin size={14} className={slotCode !== '-' ? "text-emerald-600" : "text-[#98A2B3]"} />
                                                <span className="font-black text-[#101828] tracking-widest">
                                                    {slotCode}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4">
                                            <div className="font-bold text-[#101828] text-sm mb-1.5">
                                                Rp {tx.fee?.toLocaleString('id-ID') || 0}
                                            </div>
                                            <div>
                                                {tx.is_member ? (
                                                    <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-600 text-[10px] font-black rounded-md uppercase tracking-wider border border-emerald-200">
                                                        Member
                                                    </span>
                                                ) : (
                                                    <span className="px-2.5 py-0.5 bg-slate-100 text-[#667085] text-[10px] font-black rounded-md uppercase tracking-wider border border-[#E2E6EE]">
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
                                <td colSpan="3" className="py-12 text-center text-[#98A2B3] italic bg-[#F3F5F9]">
                                    Belum ada riwayat transaksi parkir.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* 🌟 KONTROL PAGINASI (PREV / NEXT) */}
            {totalData > 0 && (
                <div className="mt-6 flex items-center justify-between border-t border-[#E2E6EE] pt-4">
                    <span className="text-xs text-[#98A2B3]">
                        Halaman <span className="font-bold text-[#101828]">{page}</span> dari <span className="font-bold text-[#101828]">{lastPage}</span>
                    </span>
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => setPage(page - 1)}
                            disabled={page === 1}
                            className="p-2 bg-white border border-[#E2E6EE] rounded-lg text-[#667085] hover:text-[#26468A] hover:border-[#26468A] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <button 
                            onClick={() => setPage(page + 1)}
                            disabled={page === lastPage}
                            className="p-2 bg-white border border-[#E2E6EE] rounded-lg text-[#667085] hover:text-[#26468A] hover:border-[#26468A] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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