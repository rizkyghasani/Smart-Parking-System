import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Wallet, CalendarClock, CalendarDays, UserRound, History,
    CheckCircle2, AlertTriangle, Loader2, ArrowRight,
} from 'lucide-react';

const RevenueConfig = () => {
    const [ratePerHour, setRatePerHour] = useState('');
    const [effectiveFrom, setEffectiveFrom] = useState('');
    
    // State Baru untuk Data Audit & History
    const [activeTarif, setActiveTarif] = useState(null);
    const [history, setHistory] = useState([]);
    
    const [loading, setLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const token = localStorage.getItem('admin_token');

    useEffect(() => {
        loadTarifData();
    }, []);

    // Fungsi massal untuk mengambil data tarif aktif dan riwayat lengkap
    const loadTarifData = async () => {
        setLoading(true);
        try {
            const headers = { Authorization: `Bearer ${token}` };
            
            // Jalankan request secara paralel agar loading lebih cepat
            const [latestRes, historyRes] = await Promise.all([
                axios.get('http://localhost:8000/api/admin/revenue-config/latest', { headers }),
                axios.get('http://localhost:8000/api/admin/revenue-config', { headers })
            ]);

            if (latestRes.data.data) {
                setActiveTarif(latestRes.data.data);
                // Set default input form mengikuti nilai aktif saat ini
                setRatePerHour(latestRes.data.data.rate_per_hour);
            }
            if (historyRes.data.data) {
                setHistory(historyRes.data.data);
            }
        } catch (err) {
            console.error('Gagal memuat data log tarif.');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setMessage({ type: '', text: '' });

        const formData = new FormData();
        formData.append('rate_per_hour', ratePerHour);
        formData.append('effective_from', effectiveFrom);

        try {
            await axios.post('http://localhost:8000/api/admin/revenue-config', formData, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });
            setMessage({ type: 'success', text: 'Tarif baru berhasil dijadwalkan.' });
            setEffectiveFrom(''); // Reset input tanggal
            loadTarifData();     // Refresh data tampilan kartu dan tabel riwayat
        } catch (err) {
            setMessage({ type: 'error', text: 'Gagal menyimpan tarif baru ke server.' });
        } finally {
            setIsSaving(false);
            setTimeout(() => setMessage({ type: '', text: '' }), 4000);
        }
    };

    if (loading && history.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center gap-3 p-16 text-gray-400">
                <Loader2 size={22} className="animate-spin text-gray-400" />
                <p className="text-sm font-medium">Memuat log audit data tarif...</p>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-8 max-w-6xl mx-auto">

            {/* HEADER */}
            <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-slate-900 text-white shrink-0">
                    <Wallet size={20} />
                </div>
                <div>
                    <h3 className="text-xl font-black text-slate-800 tracking-tight">Manajemen Log Tarif Parkir</h3>
                    <p className="text-sm text-gray-500 mt-0.5">Kelola skema biaya dan pantau histori audit pembaruan tarif operasional.</p>
                </div>
            </div>

            {/* ALERT */}
            {message.text && (
                <div className={`px-4 py-3 rounded-xl text-sm font-semibold border flex items-center gap-2.5 transition-all ${
                    message.type === 'success'
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                        : 'bg-rose-50 border-rose-200 text-rose-700'
                }`}>
                    {message.type === 'success'
                        ? <CheckCircle2 size={16} className="shrink-0" />
                        : <AlertTriangle size={16} className="shrink-0" />}
                    {message.text}
                </div>
            )}

            {/* BARIS ATAS: RINGKASAN TARIF AKTIF & FORM INPUT */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* 1. KARTU TARIF AKTIF SAAT INI */}
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-md flex flex-col justify-between">
                    <div>
                        <span className="text-[10px] font-bold uppercase tracking-widest bg-white/20 px-2.5 py-1 rounded-full">Tarif Berlaku</span>
                        <h4 className="text-4xl font-black mt-4 tracking-tight">
                            Rp {activeTarif ? activeTarif.rate_per_hour.toLocaleString('id-ID') : '0'} <span className="text-xs font-normal opacity-80">/ jam</span>
                        </h4>
                    </div>
                    <div className="mt-8 pt-4 border-t border-white/10 text-xs space-y-2 opacity-90">
                        <p className="flex items-center gap-2">
                            <CalendarDays size={13} className="shrink-0 opacity-80" />
                            <span className="font-semibold">Mulai Sejak:</span>
                            {activeTarif ? new Date(activeTarif.effective_from).toLocaleDateString('id-ID', { dateStyle: 'long' }) : '-'}
                        </p>
                        <p className="flex items-center gap-2">
                            <UserRound size={13} className="shrink-0 opacity-80" />
                            <span className="font-semibold">Oleh Admin:</span>
                            {activeTarif?.creator?.name || 'Sistem (Default)'}
                        </p>
                    </div>
                </div>

                {/* 2. FORMULIR ATUR TARIF BARU */}
                <form onSubmit={handleSave} className="lg:col-span-2 bg-slate-50 border border-gray-200 rounded-2xl p-6 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2 flex items-center gap-2 border-b border-gray-200 pb-3 mb-1">
                        <CalendarClock size={15} className="text-slate-400" />
                        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Jadwalkan Perubahan Tarif</h4>
                    </div>
                    <div>
                        <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Nominal Tarif Baru (Rp)</label>
                        <input 
                            type="number"
                            required
                            value={ratePerHour}
                            onChange={(e) => setRatePerHour(e.target.value)}
                            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                            placeholder="Maks: 4000"
                        />
                    </div>
                    <div>
                        <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Tanggal Efektif Berlaku</label>
                        <input 
                            type="date"
                            required
                            value={effectiveFrom}
                            onChange={(e) => setEffectiveFrom(e.target.value)}
                            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                        />
                    </div>
                    <div className="sm:col-span-2 flex justify-end pt-2">
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="bg-slate-900 hover:bg-slate-800 disabled:bg-slate-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs tracking-wide shadow-sm transition-all flex items-center gap-2"
                        >
                            {isSaving
                                ? <><Loader2 size={14} className="animate-spin" /> Menyimpan...</>
                                : <>Terapkan Tarif <ArrowRight size={14} /></>}
                        </button>
                    </div>
                </form>
            </div>

            {/* BARIS BAWAH: TABEL RIWAYAT AUDIT DATA */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="p-5 border-b border-gray-100 bg-slate-50/50 flex items-center gap-2">
                    <History size={14} className="text-slate-400" />
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Riwayat Perubahan & Log Audit Tarif</h4>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-100/70 border-b border-gray-200 text-gray-600 text-[11px] font-bold uppercase tracking-wider">
                                <th className="px-6 py-3">No</th>
                                <th className="px-6 py-3">Tarif Per Jam</th>
                                <th className="px-6 py-3">Tanggal Efektif</th>
                                <th className="px-6 py-3">Dibuat Oleh (Admin)</th>
                                <th className="px-6 py-3">Email Pembuat</th>
                                <th className="px-6 py-3">Tanggal Input</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
                            {history.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-10 text-center text-gray-400 font-medium bg-white">
                                        Belum ada riwayat perubahan tarif di database.
                                    </td>
                                </tr>
                            ) : (
                                history.map((item, index) => (
                                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors bg-white">
                                        <td className="px-6 py-3.5 font-medium text-gray-400">{index + 1}</td>
                                        <td className="px-6 py-3.5 font-bold text-slate-900 tabular-nums">Rp {item.rate_per_hour.toLocaleString('id-ID')}</td>
                                        <td className="px-6 py-3.5 font-semibold text-blue-600">
                                            {new Date(item.effective_from).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
                                        </td>
                                        <td className="px-6 py-3.5 font-medium capitalize">
                                            {item.creator?.name || <span className="text-gray-400 italic">Sistem</span>}
                                        </td>
                                        <td className="px-6 py-3.5 text-gray-500 font-mono">{item.creator?.email || '-'}</td>
                                        <td className="px-6 py-3.5 text-gray-400">
                                            {new Date(item.created_at).toLocaleDateString('id-ID', { dateStyle: 'short' })}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default RevenueConfig;