import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SpatialParkingLayout from "../../SpatialParkingLayout";
import { LogIn, LogOut, Map, Car, MapPin, CheckCircle, Receipt, X } from 'lucide-react';

// ==========================================
// KOMPONEN MODAL (Kuitansi & Sukses)
// ==========================================
function ParkingModal({ modal, onClose }) {
  if (!modal) return null;
 
  const isTapIn = modal.type === 'tapin';
  const accentBg    = isTapIn ? 'bg-emerald-500/10' : 'bg-blue-500/10';
  const accentText  = isTapIn ? 'text-emerald-400'  : 'text-blue-400';
  const accentBtn   = isTapIn
    ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20'
    : 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/20';
  const Icon        = isTapIn ? CheckCircle : Receipt;
 
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="relative w-full max-w-sm mx-4 bg-slate-800 border border-slate-700 rounded-3xl shadow-2xl p-6 text-white animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors">
          <X size={18} />
        </button>
 
        <div className="flex items-center gap-3 mb-5">
          <div className={`p-2.5 rounded-2xl ${accentBg}`}><Icon size={22} className={accentText} /></div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">{isTapIn ? 'Sirkulasi Masuk' : 'Transaksi Selesai'}</p>
            <p className="text-lg font-black tracking-tight text-white">{isTapIn ? 'Tap-In Berhasil' : 'Kuitansi Tarif Parkir'}</p>
          </div>
        </div>
 
        <div className="bg-slate-900 rounded-2xl px-5 py-4 mb-4 border border-slate-700">
          <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Nomor Plat</p>
          <p className="text-3xl font-mono font-black tracking-widest text-white text-center">{modal.plate}</p>
        </div>
 
        <div className="bg-slate-900 rounded-2xl p-4 mb-4 border border-slate-700 space-y-2 text-xs font-medium text-slate-300">
          <div className="flex justify-between">
            <span className="text-slate-500">{isTapIn ? 'Menuju Slot:' : 'Slot Dikosongkan:'}</span>
            <span className={`font-black text-sm ${accentText}`}>{modal.slotCode}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">{isTapIn ? 'Waktu Masuk:' : 'Total Durasi:'}</span>
            <span className="text-white font-bold">{isTapIn ? modal.time : modal.duration}</span>
          </div>
          {!isTapIn && (
            <>
              <div className="flex justify-between">
                <span className="text-slate-500">Waktu Keluar:</span>
                <span className="text-white font-bold">{modal.time}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-500">Tipe Pelanggan:</span>
                {modal.isMember ? (
                   <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-black rounded-md uppercase tracking-wider">Member Aktif</span>
                ) : (
                   <span className="px-2 py-0.5 bg-slate-700 text-slate-300 text-[10px] font-black rounded-md uppercase tracking-wider">Pengunjung Umum</span>
                )}
              </div>
              <div className="border-t border-slate-700 pt-2 flex justify-between items-center text-sm font-bold mt-1">
                <span className="text-white">Total Biaya:</span>
                <span className={`text-base font-black ${modal.isMember ? 'text-emerald-400' : 'text-blue-400'}`}>
                  Rp {modal.totalFee?.toLocaleString('id-ID')}
                </span>
              </div>
            </>
          )}
        </div>
        <button onClick={onClose} className={`w-full py-3.5 rounded-2xl font-black text-sm uppercase tracking-widest text-white transition-all shadow-lg ${accentBtn}`}>
          {isTapIn ? 'Oke, Menuju Slot' : 'Selesai & Tutup'}
        </button>
      </div>
    </div>
  );
}

// ==========================================
// KOMPONEN UTAMA (CustomerParking)
// ==========================================
const CustomerParking = ({ activeTransaction, member, plate, onTransactionChange }) => {
    const [slots, setSlots] = useState([]);
    const [candidates, setCandidates] = useState([]);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [loadingAction, setLoadingAction] = useState(false);
    
    // State Modal
    const [modalConfig, setModalConfig] = useState(null);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
    const token = localStorage.getItem('customer_token');

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

    useEffect(() => {
        fetchParkingData();
    }, []);

    // 🌟 HIGHLIGHT SLOT OTOMATIS JIKA ADA TRANSAKSI AKTIF
    useEffect(() => {
        if (activeTransaction && activeTransaction.slot) {
            setSelectedSlot(activeTransaction.slot);
        } else {
            setSelectedSlot(null);
        }
    }, [activeTransaction]);

    // 🌟 LOGIKA TAP-IN
    const handleTapIn = async () => {
        setLoadingAction(true);
        try {
            const response = await axios.post(`${API_URL}/customer/tap-in`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setModalConfig({
                type: 'tapin',
                plate: plate,
                slotCode: response.data.data.allocated_slot.slot_code,
                time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
            });

            onTransactionChange(); 
            fetchParkingData(); 
        } catch (error) {
            alert(error.response?.data?.message || 'Gagal melakukan Tap-In');
        } finally {
            setLoadingAction(false);
        }
    };

    // 🌟 LOGIKA TAP-OUT
    const handleTapOut = async () => {
        if(!window.confirm('Apakah Anda yakin ingin menyelesaikan sesi parkir dan keluar?')) return;
        
        setLoadingAction(true);
        try {
            const response = await axios.post(`${API_URL}/customer/tap-out`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            const trx = response.data.data;
            const isMemberActive = member && member.is_active;

            setModalConfig({
                type: 'tapout',
                plate: plate,
                slotCode: activeTransaction.slot.slot_code,
                time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
                duration: trx.duration_minutes + ' Menit',
                isMember: isMemberActive,
                totalFee: trx.fee
            });
            
            onTransactionChange(); 
            fetchParkingData();
        } catch (error) {
            alert(error.response?.data?.message || 'Gagal melakukan Tap-Out');
        } finally {
            setLoadingAction(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* MODAL POP-UP */}
            <ParkingModal modal={modalConfig} onClose={() => setModalConfig(null)} />

            {/* ==========================================
                1. HEADER BANNER (DINAMIS: IDLE VS ACTIVE)
            ========================================== */}
            {!activeTransaction ? (
                // 🔵 MODE IDLE: BANNER TAP-IN HORIZONTAL
                <div className="bg-slate-900 p-6 md:p-8 rounded-3xl border border-slate-800 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-5 w-full md:w-auto text-center md:text-left">
                        <div className="hidden md:flex p-4 bg-blue-500/10 rounded-full border border-blue-500/20">
                            <Car size={36} className="text-blue-400" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-white">Sirkulasi Masuk</h2>
                            <p className="text-slate-400 text-sm mt-1 max-w-md leading-relaxed">
                                Pantau denah di bawah ini. Tekan tombol Tap-In saat Anda berada di depan gerbang untuk membuka palang.
                            </p>
                        </div>
                    </div>
                    <button 
                        onClick={handleTapIn}
                        disabled={loadingAction}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl font-black text-sm tracking-widest uppercase shadow-lg shadow-blue-600/30 transition-all flex items-center gap-3 w-full md:w-auto justify-center disabled:opacity-50 whitespace-nowrap"
                    >
                        <LogIn size={20} /> {loadingAction ? 'Memproses...' : 'Tap-In & Buka Gerbang'}
                    </button>
                </div>
            ) : (
                // 🟢 MODE ACTIVE: BANNER STATUS PARKIR
                <div className="bg-emerald-950/40 border border-emerald-500/30 p-6 md:p-8 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg shadow-emerald-900/20">
                    <div className="flex items-center gap-5 w-full md:w-auto text-center md:text-left">
                        <div className="hidden md:flex p-4 bg-emerald-500/20 rounded-2xl">
                            <MapPin className="text-emerald-400" size={36} />
                        </div>
                        <div>
                            <h3 className="text-emerald-400 font-bold uppercase tracking-widest text-xs mb-1">Status: Sedang Parkir</h3>
                            <p className="text-white font-black text-3xl">
                                Slot: <span className="text-emerald-400">{activeTransaction.slot?.slot_code || 'Dialokasikan'}</span>
                            </p>
                            <p className="text-emerald-300/70 text-sm mt-1 font-medium">
                                Masuk pkl: {new Date(activeTransaction.entry_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>
                    </div>
                    <button 
                        onClick={handleTapOut}
                        disabled={loadingAction}
                        className="bg-rose-600 hover:bg-rose-500 text-white px-8 py-4 rounded-2xl font-black text-sm tracking-widest uppercase shadow-lg shadow-rose-600/30 transition-all flex items-center gap-3 w-full md:w-auto justify-center disabled:opacity-50 whitespace-nowrap"
                    >
                        <LogOut size={20} /> {loadingAction ? 'Memproses...' : 'Selesai & Tap-Out'}
                    </button>
                </div>
            )}

            {/* ==========================================
                2. PETA DENAH PARKIR (SELALU TAMPIL)
            ========================================== */}
            <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl">
                <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h3 className="text-white font-bold text-lg flex items-center gap-2">
                            <Map className="text-blue-400" size={20}/> 
                            {activeTransaction ? 'Peta Navigasi Langsung' : 'Peta Ketersediaan Parkir'}
                        </h3>
                        <p className="text-slate-400 text-sm mt-1">
                            {activeTransaction 
                                ? 'Ikuti garis navigasi hijau untuk menuju ke slot parkir Anda.' 
                                : 'Pantau slot kosong (warna hijau) secara real-time dari perangkat Anda.'}
                        </p>
                    </div>
                </div>
                
                {/* PEMANGGILAN KOMPONEN SPATIAL */}
                <div className="rounded-xl overflow-hidden border border-slate-800">
                    <SpatialParkingLayout 
                        slots={slots} 
                        candidates={candidates} 
                        selectedSlot={selectedSlot} 
                        setSelectedSlot={setSelectedSlot} 
                        onRefreshCandidates={fetchParkingData}
                        isCustomerView={true}
                    />
                </div>
            </div>

        </div>
    );
};

export default CustomerParking;