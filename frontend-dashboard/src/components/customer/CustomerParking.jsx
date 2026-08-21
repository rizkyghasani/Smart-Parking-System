import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SpatialParkingLayout from "../../SpatialParkingLayout";
import { LogIn, LogOut, Map, Car, MapPin, AlertTriangle, Clock, CheckCircle, Receipt, X } from 'lucide-react';
import { echo } from '../../services/echo';

// ==========================================
// KOMPONEN POP-UP / MODAL — Selaras dengan ParkingModal di App.jsx
// ==========================================
function ParkingPopup({ modal, onClose, onChooseOtherSlot }) {
    if (!modal) return null;

    const isTapIn = modal.type === 'tapin';

    // Skema warna disamakan persis dengan App.jsx: emerald untuk tap-in, blue untuk tap-out
    const accentBg   = isTapIn ? 'bg-emerald-500/10' : 'bg-blue-500/10';
    const accentText = isTapIn ? 'text-emerald-400'  : 'text-blue-400';
    const accentBtn  = isTapIn
        ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20'
        : 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/20';
    const Icon = isTapIn ? CheckCircle : Receipt;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="relative w-full max-w-sm mx-4 bg-slate-800 border border-slate-700 rounded-3xl shadow-2xl p-6 text-white"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
                >
                    <X size={18} />
                </button>

                {/* Header ikon + judul, format identik App.jsx */}
                <div className="flex items-center gap-3 mb-5">
                    <div className={`p-2.5 rounded-2xl ${accentBg}`}>
                        <Icon size={22} className={accentText} />
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">
                            {isTapIn ? 'Sirkulasi Masuk' : 'Transaksi Selesai'}
                        </p>
                        <p className="text-lg font-black tracking-tight text-white">
                            {isTapIn ? 'Tap-In Berhasil' : 'Kuitansi Tarif Parkir'}
                        </p>
                    </div>
                </div>

                {/* Kotak Plat Nomor (hanya tampil jika ada, tap-in customer mungkin tidak selalu punya plate di modal) */}
                {modal.plate && (
                    <div className="bg-slate-900 rounded-2xl px-5 py-4 mb-4 border border-slate-700">
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Nomor Plat</p>
                        <p className="text-3xl font-mono font-black tracking-widest text-white text-center">
                            {modal.plate}
                        </p>
                    </div>
                )}

                {/* Baris Informasi */}
                <div className="bg-slate-900 rounded-2xl p-4 mb-4 border border-slate-700 space-y-2 text-xs font-medium text-slate-300">
                    <div className="flex justify-between">
                        <span className="text-slate-500">{isTapIn ? 'Menuju Slot:' : 'Slot Dikosongkan:'}</span>
                        <span className={`font-black text-sm ${accentText}`}>{modal.slotCode}</span>
                    </div>

                    {isTapIn ? (
                    <div className="flex justify-between">
                        <span className="text-slate-500">Nomor Plat:</span>
                        <span className="text-white font-bold tracking-widest">{modal.plate}</span>
                    </div>
                    ) : (
                        <>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Waktu Keluar:</span>
                                <span className="text-white font-bold">{modal.time}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Total Durasi:</span>
                                <span className="text-white font-bold">{modal.duration}</span>
                            </div>
                            <div className="border-t border-slate-700 pt-2 flex justify-between items-center text-sm font-bold mt-1">
                                <span className="text-white">Total Biaya:</span>
                                <span className="text-base font-black text-emerald-400">
                                    Rp {Number(modal.totalFee || 0).toLocaleString('id-ID')}
                                </span>
                            </div>
                        </>
                    )}
                </div>

                {/* CTA Utama */}
                <button
                    onClick={onClose}
                    className={`w-full py-3.5 rounded-2xl font-black text-sm uppercase tracking-widest text-white transition-all shadow-lg ${accentBtn}`}
                >
                    {isTapIn ? 'Oke, Menuju Slot' : 'Selesai & Tutup'}
                </button>

                {/* 🌟 Aksi sekunder — dikecilkan, tidak lagi full-width mencolok seperti sebelumnya */}
                {isTapIn && (
                    <button
                        onClick={onChooseOtherSlot}
                        className="w-full mt-2.5 py-2 rounded-xl text-[11px] font-bold uppercase tracking-widest text-amber-500/80 hover:text-amber-400 hover:bg-amber-500/5 transition-all flex items-center justify-center gap-1.5"
                    >
                        <MapPin size={13} /> Pilih Slot Lain (Simulasi Pelanggaran)
                    </button>
                )}
            </div>
        </div>
    );
}

// ==========================================
// KOMPONEN UTAMA CUSTOMER PARKING
// ==========================================
const CustomerParking = ({ activeTransaction, member, plate, onTransactionChange }) => {
    const [slots, setSlots] = useState([]);
    const [candidates, setCandidates] = useState([]);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [loadingAction, setLoadingAction] = useState(false);

    // State Popup & Interaksi
    const [popupModal, setPopupModal] = useState(null);
    const [isChoosingManualSlot, setIsChoosingManualSlot] = useState(false);
    const [hasPendingViolation, setHasPendingViolation] = useState(false);
    const [allocatedSlotId, setAllocatedSlotId] = useState(null);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
    const token = localStorage.getItem('token') || localStorage.getItem('customer_token');

    const fetchParkingData = async () => {
        try {
            const response = await axios.get(`${API_URL}/parking/slots`);
            if (response.data.status === 'success') {
                setSlots(response.data.data);
                if (response.data.candidates) setCandidates(response.data.candidates);
            }
        } catch (error) {
            console.error('Gagal mengambil data denah:', error);
        }
    };

    // WebSocket Sinkronisasi Real-time
    useEffect(() => {
        fetchParkingData();

        const channel = echo.channel('parking-channel');
        channel.listen('.SlotUpdated', (e) => {
            fetchParkingData();
            if (onTransactionChange) onTransactionChange();
        });

        return () => {
            channel.stopListening('.SlotUpdated');
        };
    }, []);

    useEffect(() => {
        if (activeTransaction) {
            if (activeTransaction.slot) {
                setSelectedSlot(activeTransaction.slot);
            }
            const currentSlotId = activeTransaction.parking_slot_id || activeTransaction.slot?.id;
            if (allocatedSlotId && currentSlotId !== allocatedSlotId) {
                setHasPendingViolation(false);
                setIsChoosingManualSlot(false);
            }
            setAllocatedSlotId(currentSlotId);
        } else {
            setSelectedSlot(null);
            setAllocatedSlotId(null);
            setHasPendingViolation(false);
            setIsChoosingManualSlot(false);
        }
    }, [activeTransaction, allocatedSlotId]);

    const handleTapIn = async () => {
        if (!plate) {
            alert('Plat nomor tidak ditemukan pada profil Anda.');
            return;
        }

        if (!window.confirm(`Proses masuk gerbang untuk kendaraan ${plate}?`)) return;

        setLoadingAction(true);
        try {
            const res = await axios.post(`${API_URL}/parking/tap-in`, {
                plate_number: plate,
                is_member: !!member
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const allocatedSlotCode = res.data?.data?.slot?.slot_code || candidates[0]?.slot_code || 'S1';

            if (onTransactionChange) onTransactionChange();
            await fetchParkingData();

            setPopupModal({
                type: 'tapin',
                plate: plate,
                slotCode: allocatedSlotCode
            });

        } catch (error) {
            alert(error.response?.data?.message || 'Gagal Tap-In');
        } finally {
            setLoadingAction(false);
        }
    };

    const handleTapOut = async () => {
        if (!activeTransaction) return;
        if (!window.confirm('Proses keluar parkir dan hitung biaya?')) return;

        setLoadingAction(true);
        try {
            const slotId = activeTransaction.parking_slot_id || activeTransaction.slot?.id;
            const res = await axios.post(`${API_URL}/parking/tap-out`, { slot_id: slotId });

            if (res.data) {
                const currentSlot = slots.find(s => s.id === slotId);
                setPopupModal({
                    type: 'tapout',
                    plate: res.data.plate_number || activeTransaction.plate_number,
                    slotCode: currentSlot?.slot_code ?? activeTransaction.slot?.slot_code ?? 'Slot',
                    time: res.data.exit_time || new Date().toLocaleTimeString(),
                    duration: res.data.duration || '0 Jam',
                    totalFee: res.data.total_fee || 0
                });
            }

            if (onTransactionChange) onTransactionChange();
            fetchParkingData();
        } catch (error) {
            alert(error.response?.data?.message || 'Gagal memproses kendaraan keluar.');
        } finally {
            setLoadingAction(false);
        }
    };

    const handleSimulateParking = async (clickedSlot) => {
        if (!activeTransaction || hasPendingViolation) return;

        const currentAllocatedId = activeTransaction.parking_slot_id || activeTransaction.slot?.id;
        const isMismatch = clickedSlot.id !== currentAllocatedId;

        let confirmMsg = `Konfirmasi parkir di Slot ${clickedSlot.slot_code}?`;
        if (isMismatch) {
            confirmMsg = `🚨 PERINGATAN PELANGGARAN!\n\nSistem mengalokasikan Anda di Slot ${activeTransaction.slot?.slot_code}, tetapi Anda memilih parkir di Slot ${clickedSlot.slot_code}.\n\nLanjutkan?`;
        }

        if (!window.confirm(confirmMsg)) return;

        setLoadingAction(true);
        try {
            await axios.post(`${API_URL}/parking/simulate-sensor`, {
                transaction_id: activeTransaction.id,
                detected_slot_id: clickedSlot.id
            });

            if (isMismatch) {
                setHasPendingViolation(true);
                setIsChoosingManualSlot(false);
            }

            if (onTransactionChange) onTransactionChange();
            fetchParkingData();
        } catch (error) {
            alert('Gagal menyimulasikan sensor: ' + (error.response?.data?.message || 'Error Server'));
        } finally {
            setLoadingAction(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

            <ParkingPopup
                modal={popupModal}
                onClose={() => setPopupModal(null)}
                onChooseOtherSlot={() => {
                    setPopupModal(null);
                    setIsChoosingManualSlot(true);
                }}
            />

            {/* HEADER BANNER */}
            {activeTransaction ? (
                <div className={`border p-6 rounded-3xl shadow-lg flex flex-col md:flex-row justify-between items-center gap-4 transition-colors ${hasPendingViolation ? 'bg-rose-900/20 border-rose-500/50' : 'bg-emerald-900/40 border-emerald-500/50'}`}>
                    <div className="flex items-center gap-4">
                        <div className={`${hasPendingViolation ? 'bg-rose-500 shadow-rose-500/30' : 'bg-emerald-500 shadow-emerald-500/30'} p-4 rounded-2xl shadow-lg`}>
                            <Car size={32} className="text-white" />
                        </div>
                        <div>
                            <p className={`${hasPendingViolation ? 'text-rose-400' : 'text-emerald-400'} font-bold uppercase tracking-widest text-xs mb-1`}>
                                {hasPendingViolation ? 'Menunggu Konfirmasi Petugas' : 'Sedang Parkir'}
                            </p>
                            <h2 className="text-3xl font-black text-white tracking-widest">{activeTransaction.plate_number}</h2>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right hidden md:block">
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Alokasi Sistem</p>
                            <p className={`text-2xl font-black ${hasPendingViolation ? 'text-rose-400 line-through opacity-70' : 'text-emerald-400'}`}>
                                Slot {activeTransaction.slot?.slot_code || '-'}
                            </p>
                        </div>

                        <button
                            onClick={handleTapOut}
                            disabled={loadingAction || hasPendingViolation}
                            className={`px-6 py-4 rounded-xl font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-lg disabled:opacity-50 ${hasPendingViolation ? 'bg-slate-700 text-slate-400 cursor-not-allowed' : 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-900/50'}`}
                        >
                            {loadingAction ? 'Proses...' : hasPendingViolation ? <><Clock size={20}/> Terkunci</> : <><LogOut size={20}/> Tap Out Keluar</>}
                        </button>
                    </div>
                </div>
            ) : (
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-lg flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                        <h2 className="text-2xl font-black text-white flex items-center gap-2">
                            <MapPin className="text-blue-500"/> Selamat Datang
                        </h2>
                        <p className="text-slate-400 mt-1 text-sm">
                            Kendaraan <span className="font-bold text-white tracking-widest">{plate || 'TIDAK DIKETAHUI'}</span>
                            {member ? ' (Member)' : ' (Reguler)'} siap masuk.
                        </p>
                    </div>
                    <button
                        onClick={handleTapIn}
                        disabled={loadingAction || !plate}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-xl font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-lg shadow-blue-900/50 w-full md:w-auto justify-center disabled:opacity-50"
                    >
                        {loadingAction ? 'Proses...' : <><LogIn size={20}/> Tap In Masuk</>}
                    </button>
                </div>
            )}

            {/* LAYOUT DENAH VISUAL */}
            <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl">
                <div className="mb-6 flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div>
                        <h3 className="text-white font-bold text-lg flex items-center gap-2">
                            <Map className="text-blue-400" size={20}/>
                            {activeTransaction ? 'Peta Navigasi Langsung' : 'Peta Ketersediaan Parkir'}
                        </h3>

                        {hasPendingViolation ? (
                            <div className="mt-3 bg-rose-500/10 border border-rose-500/30 px-4 py-3 rounded-xl inline-flex items-center gap-3">
                                <Clock size={20} className="text-rose-500 animate-pulse flex-shrink-0" />
                                <div>
                                    <p className="text-rose-400 text-xs font-black uppercase tracking-widest">SISTEM TERKUNCI</p>
                                    <p className="text-rose-200/70 text-xs font-medium mt-0.5">
                                        Anda memarkir di slot yang salah. Menunggu petugas (Staff) melakukan *override*.
                                    </p>
                                </div>
                            </div>
                        ) : isChoosingManualSlot ? (
                            <div className="mt-3 bg-amber-500/10 border border-amber-500/30 px-4 py-3 rounded-xl inline-flex items-center gap-3 animate-bounce">
                                <AlertTriangle size={20} className="text-amber-500 flex-shrink-0" />
                                <div>
                                    <p className="text-amber-400 text-xs font-black uppercase tracking-widest">MODE PILIH SLOT LAIN AKTIF</p>
                                    <p className="text-amber-200/70 text-xs font-medium mt-0.5">
                                        Silakan klik kotak slot kosong mana saja di denah bawah untuk mensimulasikan pelanggaran.
                                    </p>
                                </div>
                            </div>
                        ) : activeTransaction ? (
                            <div className="mt-3 bg-blue-500/10 border border-blue-500/30 px-4 py-3 rounded-xl inline-flex items-center gap-3">
                                <CheckCircle size={20} className="text-blue-400 flex-shrink-0" />
                                <div>
                                    <p className="text-blue-400 text-xs font-black uppercase tracking-widest">ALOKASI AKTIF</p>
                                </div>
                            </div>
                        ) : (
                            <p className="text-slate-400 text-sm mt-1">Pantau slot kosong secara real-time dari sistem terpusat.</p>
                        )}
                    </div>
                </div>

                <div className="rounded-xl overflow-hidden border border-slate-800">
                    <SpatialParkingLayout
                        slots={slots}
                        candidates={candidates}
                        selectedSlot={selectedSlot}
                        setSelectedSlot={setSelectedSlot}
                        onRefreshCandidates={fetchParkingData}
                        isCustomerView={true}
                        onSlotClick={(activeTransaction && isChoosingManualSlot && !hasPendingViolation) ? handleSimulateParking : null}
                    />
                </div>
            </div>
        </div>
    );
};

export default CustomerParking;