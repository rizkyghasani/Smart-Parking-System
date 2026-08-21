import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { echo } from '../../services/echo';
import { Map, Clock, ArrowRightLeft, X, AlertTriangle, CheckCircle } from 'lucide-react';

const LiveSlotMonitor = () => {
    const [activeTransactions, setActiveTransactions] = useState([]);
    const [slots, setSlots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tick, setTick] = useState(0);

    const [showModal, setShowModal] = useState(false);
    const [overrideForm, setOverrideForm] = useState({ transaction_id: '', old_slot_code: '', plate: '', new_slot_id: '', reason: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
    const token = localStorage.getItem('staff_token');

    const axiosInstance = axios.create({
        baseURL: API_URL,
        headers: { Authorization: `Bearer ${token}` }
    });

    const fetchData = async () => {
        try {
            const [transRes, slotsRes] = await Promise.all([
                axiosInstance.get('/staff/active-transactions'),
                axiosInstance.get('/parking/slots')
            ]);
            setActiveTransactions(transRes.data.data);
            setSlots(slotsRes.data.data);
        } catch (error) {
            console.error("Gagal mengambil data monitoring:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();

        const channel = echo.channel('parking-channel');
        channel.listen('.SlotUpdated', (e) => {
            setSlots(prev => prev.map(slot => slot.id === e.slot.id ? { ...slot, ...e.slot } : slot));
            fetchData(); 
        });

        const interval = setInterval(() => setTick(t => t + 1), 60000); 

        return () => {
            channel.stopListening('.SlotUpdated');
            clearInterval(interval);
        };
    }, []);

    const getLiveDuration = (entryTime) => {
        const diffMs = new Date() - new Date(entryTime);
        const diffMins = Math.floor(diffMs / 60000);
        const hours = Math.floor(diffMins / 60);
        const mins = diffMins % 60;
        if (hours > 0) return `${hours}j ${mins}m`;
        return `${mins} Menit`;
    };

    const handleOpenOverride = (tx, physicalCode) => {
        setOverrideForm({
            transaction_id: tx.id,
            old_slot_code: tx.slot?.slot_code,
            plate: tx.plate_number,
            new_slot_id: '', // Diarahkan untuk milih slot baru
            reason: `Penyesuaian ke Slot ${physicalCode}`
        });
        setShowModal(true);
    };

    const handleOverrideSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await axiosInstance.post('/staff/override-slot', overrideForm);
            alert('✅ Kendaraan berhasil di-override / dipindahkan.');
            setShowModal(false);
            fetchData(); // Refresh data untuk memicu perubahan warna
        } catch (error) {
            alert('Gagal override: ' + (error.response?.data?.message || 'Pastikan slot tersedia.'));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm min-h-[500px] animate-in fade-in zoom-in-95 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <Map className="text-blue-500" size={24} /> Live Slot Monitoring
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">Pantau kendaraan aktif dan sinkronkan posisi fisik vs alokasi.</p>
                </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-gray-200 custom-scrollbar max-h-[500px] overflow-y-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 sticky top-0 z-10">
                        <tr className="text-gray-500 text-xs uppercase tracking-widest font-bold border-b border-gray-200">
                            <th className="py-4 px-5">Slot Alokasi vs Fisik</th>
                            <th className="py-4 px-5">Plat Nomor</th>
                            <th className="py-4 px-5">Durasi Parkir</th>
                            <th className="py-4 px-5 text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="4" className="py-8 text-center text-gray-400">Memuat data realtime...</td></tr>
                        ) : activeTransactions.length > 0 ? (
                            activeTransactions.map((tx) => {
                                // 🌟 LOGIKA CERDAS BARU: Sinkronisasi Fisik vs Alokasi
                                const currentAllocatedSlot = slots.find(s => s.id === tx.parking_slot_id);
                                const currentDetectedSlot = slots.find(s => s.id === tx.detected_slot_id);

                                const allocatedCode = currentAllocatedSlot?.slot_code || tx.slot?.slot_code || '-';
                                // Jika CCTV belum mendeteksi (null), asumsikan fisik sama dengan alokasi sementara
                                const physicalCode = currentDetectedSlot?.slot_code || allocatedCode;

                                // Pengecekan Pelanggaran: Hanya terjadi jika kode slot fisik BERBEDA dengan alokasi
                                let isViolation = false;
                                if (allocatedCode !== physicalCode) {
                                    isViolation = true;
                                }

                                // 🛡️ THE FIX: Jika sudah di override (Alokasi = Fisik), paksa violation jadi FALSE!
                                if (allocatedCode === physicalCode) {
                                    isViolation = false;
                                }

                                return (
                                    <tr key={tx.id} className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${isViolation ? 'bg-rose-50/60' : ''}`}>
                                        <td className="py-4 px-5">
                                            <div className="flex flex-col gap-1.5">
                                                {/* Baris Alokasi Sistem */}
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] uppercase font-bold text-gray-400 w-20">Alokasi:</span>
                                                    <span className="inline-flex items-center justify-center px-2.5 py-0.5 bg-blue-100 text-blue-700 font-bold text-xs rounded-md">
                                                        Slot {allocatedCode}
                                                    </span>
                                                </div>

                                                {/* Baris Fisik / CCTV */}
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] uppercase font-bold text-gray-400 w-20">Fisik:</span>
                                                    <span className={`inline-flex items-center justify-center px-2.5 py-0.5 font-black text-xs rounded-md transition-all ${isViolation ? 'bg-rose-600 text-white animate-pulse shadow-md shadow-rose-500/30' : 'bg-emerald-100 text-emerald-700'}`}>
                                                        Slot {physicalCode}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Badge Dinamis (Sesuai dengan Status Fisik=Alokasi) */}
                                            {isViolation ? (
                                                <div className="mt-2">
                                                    <span className="inline-flex items-center gap-1 bg-rose-100 text-rose-700 text-[10px] font-bold px-2 py-0.5 rounded border border-rose-200 animate-pulse">
                                                        <AlertTriangle size={12} /> Melanggar Jalur Alokasi!
                                                    </span>
                                                </div>
                                            ) : (
                                                <div className="mt-2">
                                                    <span className="inline-flex items-center gap-1 text-emerald-600 text-[10px] font-bold px-1 py-0.5">
                                                        <CheckCircle size={12} /> Jalur Sesuai
                                                    </span>
                                                </div>
                                            )}
                                        </td>

                                        <td className="py-4 px-5 font-black text-gray-800 tracking-widest text-base">
                                            {tx.plate_number}
                                        </td>

                                        <td className="py-4 px-5">
                                            <div className="flex items-center gap-1.5 text-emerald-700 font-bold bg-emerald-100 px-2 py-1 rounded w-fit border border-emerald-200">
                                                <Clock size={14} /> {getLiveDuration(tx.entry_time)}
                                            </div>
                                        </td>

                                        <td className="py-4 px-5 text-right">
                                            <button 
                                                onClick={() => handleOpenOverride(tx, physicalCode)}
                                                className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all ${isViolation ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/30' : 'bg-amber-100 hover:bg-amber-200 text-amber-700'}`}
                                            >
                                                <ArrowRightLeft size={14} /> {isViolation ? 'Selesaikan (Override)' : 'Pindah Slot'}
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr><td colSpan="4" className="py-12 text-center text-gray-400 italic">Tidak ada kendaraan yang sedang parkir.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* MODAL OVERRIDE */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-6 rounded-3xl w-full max-w-md border border-gray-200 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-5">
                            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                <ArrowRightLeft className="text-amber-500" size={20} /> Override Slot Manual
                            </h3>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-700 bg-gray-100 p-1.5 rounded-lg transition-colors"><X size={20}/></button>
                        </div>
                        
                        <form onSubmit={handleOverrideSubmit} className="space-y-4">
                            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 text-center">
                                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-1">Target Kendaraan</p>
                                <p className="text-2xl font-black text-gray-800 tracking-widest">{overrideForm.plate}</p>
                                <p className="text-sm text-gray-500 mt-1">Alokasi Awal: <span className="text-rose-500 font-black">{overrideForm.old_slot_code}</span></p>
                            </div>

                            <div>
                                <label className="block text-xs text-gray-500 uppercase tracking-widest font-bold mb-2">Pindah Ke Slot Baru</label>
                                <select 
                                    className="w-full bg-white border border-gray-300 text-gray-700 p-3 rounded-xl focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                                    value={overrideForm.new_slot_id}
                                    onChange={(e) => setOverrideForm({...overrideForm, new_slot_id: e.target.value})}
                                    required
                                >
                                    <option value="">-- Pilih Slot Kosong / Target --</option>
                                    {slots
                                        .filter(s => s.status === 'available' || s.status === 'violation')
                                        .sort((a, b) => a.slot_code.localeCompare(b.slot_code, undefined, { numeric: true }))
                                        .map(slot => (
                                            <option key={slot.id} value={slot.id}>Slot {slot.slot_code} {slot.status === 'violation' ? '(Lokasi Fisik Saat Ini)' : ''}</option>
                                        ))
                                    }
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs text-gray-500 uppercase tracking-widest font-bold mb-2">Alasan Pemindahan</label>
                                <input 
                                    type="text" 
                                    className="w-full bg-white border border-gray-300 text-gray-700 p-3 rounded-xl focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                                    placeholder="Cth: Penyesuaian parkir fisik..."
                                    value={overrideForm.reason}
                                    onChange={(e) => setOverrideForm({...overrideForm, reason: e.target.value})}
                                    required
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-bold transition-colors">Batal</button>
                                <button type="submit" disabled={isSubmitting} className="flex-1 bg-amber-500 hover:bg-amber-600 text-white py-3 rounded-xl font-bold transition-colors disabled:opacity-50 shadow-lg shadow-amber-500/30">
                                    {isSubmitting ? 'Memproses...' : 'Terapkan Override'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LiveSlotMonitor;