import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, FileText, Car, User, Palette, CheckCircle, AlertTriangle, Receipt } from 'lucide-react';

// =============================================================
// 🌟 KOMPONEN BARU: Pop-up hasil (menggantikan alert() bawaan browser)
// Dua varian: 'success' (hijau, tampilkan struk ringkas) dan 'error' (merah, pesan gagal)
// =============================================================
function ResultPopup({ result, onClose }) {
    if (!result) return null;

    const isSuccess = result.type === 'success';
    const accentBg   = isSuccess ? 'bg-emerald-500/10' : 'bg-rose-500/10';
    const accentText = isSuccess ? 'text-emerald-400'  : 'text-rose-400';
    const accentBtn  = isSuccess
        ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20'
        : 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/20';
    const Icon = isSuccess ? CheckCircle : AlertTriangle;

    return (
        <div
            className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200"
            onClick={onClose}
        >
            <div
                className="relative w-full max-w-sm bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl p-6 text-white animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
                >
                    <X size={18} />
                </button>

                <div className="flex items-center gap-3 mb-5">
                    <div className={`p-2.5 rounded-2xl ${accentBg}`}>
                        <Icon size={22} className={accentText} />
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">
                            {isSuccess ? 'Verifikasi Berhasil' : 'Verifikasi Gagal'}
                        </p>
                        <p className="text-lg font-black tracking-tight text-white">
                            {isSuccess ? 'Tap-Out Terverifikasi' : 'Terjadi Kesalahan'}
                        </p>
                    </div>
                </div>

                {isSuccess ? (
                    <div className="bg-slate-950 rounded-2xl p-4 mb-5 border border-slate-800 space-y-2 text-xs font-medium text-slate-300">
                        <div className="flex justify-between items-center">
                            <span className="text-slate-500 flex items-center gap-1.5"><FileText size={12}/> Plat STNK</span>
                            <span className="font-mono font-black text-sm text-white tracking-widest">{result.plate}</span>
                        </div>
                        <div className="border-t border-slate-800 pt-2 flex justify-between items-center">
                            <span className="text-slate-500 flex items-center gap-1.5"><Receipt size={12}/> Total Biaya</span>
                            <span className="font-black text-base text-emerald-400">
                                Rp {Number(result.fee || 0).toLocaleString('id-ID')}
                            </span>
                        </div>
                    </div>
                ) : (
                    <div className="bg-slate-950 rounded-2xl p-4 mb-5 border border-slate-800">
                        <p className="text-xs text-rose-200/80 leading-relaxed">{result.message}</p>
                    </div>
                )}

                <button
                    onClick={onClose}
                    className={`w-full py-3.5 rounded-2xl font-black text-sm uppercase tracking-widest
                                text-white transition-all shadow-lg ${accentBtn}`}
                >
                    {isSuccess ? 'Selesai' : 'Coba Lagi'}
                </button>
            </div>
        </div>
    );
}

const ManualVerificationModal = ({ isOpen, onClose, targetTransactionId, onSuccess }) => {
    const [formData, setFormData] = useState({
        verified_plate: '',
        vehicle_model: '',
        vehicle_color: '',
        driver_name: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    // 🌟 State baru untuk pop-up hasil (menggantikan alert())
    const [result, setResult] = useState(null); // null | { type: 'success'|'error', ...data }

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
    const token = localStorage.getItem('staff_token');

    const axiosInstance = axios.create({
        baseURL: API_URL,
        headers: { Authorization: `Bearer ${token}` }
    });

    // Reset form setiap kali modal dibuka untuk transaksi baru
    useEffect(() => {
        if (isOpen) {
            setFormData({
                verified_plate: '',
                vehicle_model: '',
                vehicle_color: '',
                driver_name: ''
            });
            setResult(null);
        }
    }, [isOpen, targetTransactionId]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!window.confirm('Verifikasi data STNK sudah benar dan proses tap-out?')) return;

        setIsSubmitting(true);
        try {
            const payload = {
                transaction_id: targetTransactionId,
                ...formData
            };

            const response = await axiosInstance.post('/staff/verify-tap-out', payload);
            const data = response.data;

            // 🌟 Ganti alert() sukses -> tampilkan ResultPopup
            setResult({
                type: 'success',
                plate: data.plate_number,
                fee: data.total_fee,
            });
        } catch (error) {
            // 🌟 Ganti alert() gagal -> tampilkan ResultPopup
            setResult({
                type: 'error',
                message: error.response?.data?.message || 'Terjadi kesalahan pada server.',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Saat pop-up hasil ditutup: kalau sukses, refresh data induk & tutup modal verifikasi.
    // Kalau error, cukup tutup pop-up-nya saja supaya staff bisa perbaiki & submit ulang.
    const handleCloseResult = () => {
        const wasSuccess = result?.type === 'success';
        setResult(null);
        if (wasSuccess) {
            if (onSuccess) onSuccess();
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[60] p-4 animate-in fade-in zoom-in-95 duration-200">
                <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                    {/* Header Modal */}
                    <div className="p-6 border-b border-slate-800 bg-slate-950/50 flex justify-between items-center sticky top-0 z-10">
                        <div>
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <FileText className="text-blue-500" size={24} /> Verifikasi STNK (Manual)
                            </h3>
                            <p className="text-xs text-slate-400 mt-1">
                                Target ID Transaksi: <span className="font-bold text-emerald-400">#{targetTransactionId || 'TIDAK DIKETAHUI'}</span>
                            </p>
                        </div>
                        <button onClick={onClose} className="text-slate-400 hover:text-white bg-slate-800 p-2 rounded-xl transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Form Content */}
                    <div className="p-6 overflow-y-auto custom-scrollbar">
                        <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl mb-6 flex items-start gap-3">
                            <CheckCircle className="text-blue-400 shrink-0 mt-0.5" size={18} />
                            <p className="text-xs text-blue-200/80 leading-relaxed">
                                Form ini digunakan untuk kendaraan yang masuk menggunakan kartu e-money namun plat nomornya tidak terbaca (UNKNOWN) oleh sistem OCR. Pastikan data yang diinput sesuai dengan STNK fisik.
                            </p>
                        </div>

                        <form id="stnk-verification-form" onSubmit={handleSubmit} className="space-y-5">

                            {/* Plat Nomor */}
                            <div>
                                <label className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-2 flex items-center gap-1.5">
                                    <FileText size={14}/> Plat Nomor Asli (Sesuai STNK)
                                </label>
                                <input
                                    type="text"
                                    name="verified_plate"
                                    value={formData.verified_plate}
                                    onChange={handleInputChange}
                                    className="w-full bg-slate-950 border border-slate-700 text-white font-black tracking-widest text-lg p-3.5 rounded-xl focus:border-blue-500 focus:outline-none uppercase"
                                    placeholder="Contoh: K 141 KU"
                                    required
                                    autoFocus
                                />
                            </div>

                            {/* Jenis & Warna Mobil (Grid 2 Kolom) */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-2 flex items-center gap-1.5">
                                        <Car size={14}/> Jenis / Nama Mobil
                                    </label>
                                    <input
                                        type="text"
                                        name="vehicle_model"
                                        value={formData.vehicle_model}
                                        onChange={handleInputChange}
                                        className="w-full bg-slate-950 border border-slate-700 text-white p-3.5 rounded-xl focus:border-blue-500 focus:outline-none placeholder:text-slate-600"
                                        placeholder="Misal: Honda Brio"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-2 flex items-center gap-1.5">
                                        <Palette size={14}/> Warna Mobil
                                    </label>
                                    <input
                                        type="text"
                                        name="vehicle_color"
                                        value={formData.vehicle_color}
                                        onChange={handleInputChange}
                                        className="w-full bg-slate-950 border border-slate-700 text-white p-3.5 rounded-xl focus:border-blue-500 focus:outline-none placeholder:text-slate-600"
                                        placeholder="Misal: Merah / Hitam"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Nama Pengemudi */}
                            <div>
                                <label className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-2 flex items-center gap-1.5">
                                    <User size={14}/> Nama Pengemudi
                                </label>
                                <input
                                    type="text"
                                    name="driver_name"
                                    value={formData.driver_name}
                                    onChange={handleInputChange}
                                    className="w-full bg-slate-950 border border-slate-700 text-white p-3.5 rounded-xl focus:border-blue-500 focus:outline-none placeholder:text-slate-600 capitalize"
                                    placeholder="Sesuai KTP atau STNK"
                                    required
                                />
                            </div>

                        </form>
                    </div>

                    {/* Footer / Actions */}
                    <div className="p-6 border-t border-slate-800 bg-slate-900 flex gap-3 sticky bottom-0 z-10">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-3.5 rounded-xl font-bold transition-colors text-sm"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            form="stnk-verification-form"
                            disabled={isSubmitting}
                            className="flex-[2] bg-blue-600 hover:bg-blue-500 text-white py-3.5 rounded-xl font-bold transition-colors disabled:opacity-50 text-sm shadow-lg shadow-blue-900/40 flex justify-center items-center gap-2"
                        >
                            {isSubmitting ? 'Memverifikasi...' : <><CheckCircle size={18}/> Verifikasi & Proses Keluar</>}
                        </button>
                    </div>

                </div>
            </div>

            {/* 🌟 Pop-up hasil — dirender di atas modal verifikasi (z-[70] > z-[60]) */}
            <ResultPopup result={result} onClose={handleCloseResult} />
        </>
    );
};

export default ManualVerificationModal;