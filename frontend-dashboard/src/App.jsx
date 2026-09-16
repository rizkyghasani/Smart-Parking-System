import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import AdminLayout from './components/admin/AdminLayout';
import LoginAdmin from './components/auth/LoginAdmin';
import RegisterAdmin from './components/auth/RegisterAdmin';
import LoginStaff from './components/auth/LoginStaff';
import StaffLayout from './components/staff/StaffLayout.jsx';
import CustomerDashboard from './components/customer/CustomerDashboard';
import LoginCustomer from './components/customer/LoginCustomer';
import RegisterCustomer from './components/customer/RegisterCustomer';
import SpatialParkingLayout from './SpatialParkingLayout';
import { echo } from './services/echo.js';
import { wibTime, wibDateTime } from './utils/time';
import CameraStream from './components/CameraStream';
import {
  Car, Monitor, Activity, LogOut, Scan, RefreshCcw, AlertCircle, X, CheckCircle, Receipt,
  Camera, CameraOff, HardHat, UserRound, ShieldCheck, TriangleAlert, MapPin, Ticket, LifeBuoy,
} from 'lucide-react';

const AI_URL   = 'http://localhost:8001';
const API_URL  = 'http://localhost:8000/api';
const INTERVAL = 3000;

// =============================================================
// Font loader — Manrope (UI) + IBM Plex Mono (data terbaca-mesin:
// plat nomor, kode slot). Dipasang sekali di root komponen.
// =============================================================
function FontLoader() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@500;600;700&display=swap');
    `}</style>
  );
}

// =============================================================
// KOMPONEN MODAL INTEGRASI — Info Tap-In & Kuitansi Tap-Out
// =============================================================
function ParkingModal({ modal, onClose }) {
  if (!modal) return null;

  const isTapIn = modal.type === 'tapin';

  const accentBg   = isTapIn ? 'bg-emerald-50' : 'bg-[#26468A]/10';
  const accentText = isTapIn ? 'text-emerald-600' : 'text-[#26468A]';
  const accentBtn  = isTapIn
    ? 'bg-emerald-600 hover:bg-emerald-700'
    : 'bg-[#26468A] hover:bg-[#1d3872]';
  const Icon = isTapIn ? CheckCircle : Receipt;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#101828]/50 backdrop-blur-sm px-4"
      onClick={onClose}
      style={{ fontFamily: "'Manrope', sans-serif" }}
    >
      <div
        className="relative w-full max-w-sm bg-white border border-[#E2E6EE] rounded-3xl shadow-xl shadow-black/5 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#98A2B3] hover:text-[#101828] transition-colors"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className={`p-2.5 rounded-2xl ${accentBg}`}>
            <Icon size={22} className={accentText} />
          </div>
          <div>
            <p className="text-[13px] text-[#667085] font-medium">
              {isTapIn ? 'Sirkulasi masuk' : 'Transaksi selesai'}
            </p>
            <p className="text-lg font-bold tracking-tight text-[#101828]">
              {isTapIn ? 'Tap-in berhasil' : 'Kuitansi parkir'}
            </p>
          </div>
        </div>

        <div className="bg-[#F3F5F9] rounded-2xl px-5 py-4 mb-4 border border-[#E2E6EE]">
          <p className="text-[11px] text-[#667085] font-medium mb-1">Nomor plat</p>
          <p
            className="text-[28px] font-bold tracking-wider text-[#101828] text-center"
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
          >
            {modal.plate}
          </p>
        </div>

        <div className="bg-[#F3F5F9] rounded-2xl p-4 mb-4 border border-[#E2E6EE] space-y-2.5 text-sm">
          <div className="flex justify-between">
            <span className="text-[#667085]">{isTapIn ? 'Menuju slot' : 'Slot dikosongkan'}</span>
            <span className={`font-bold ${accentText}`}>{modal.slotCode}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#667085]">{isTapIn ? 'Waktu masuk' : 'Total durasi'}</span>
            <span className="text-[#101828] font-semibold">{isTapIn ? modal.time : modal.duration}</span>
          </div>
          {isTapIn && modal.cardId && (
            <div className="flex justify-between items-center">
              <span className="text-[#667085]">Kode karcis/kartu</span>
              <span className="text-[#101828] font-semibold font-mono text-xs tracking-wider">{modal.cardId}</span>
            </div>
          )}
          {!isTapIn && (
            <>
              <div className="flex justify-between">
                <span className="text-[#667085]">Waktu keluar</span>
                <span className="text-[#101828] font-semibold">{modal.time}</span>
              </div>

              <div className="flex justify-between items-center py-0.5">
                <span className="text-[#667085]">Tipe pelanggan</span>
                {modal.isMember ? (
                  <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-[11px] font-bold rounded-lg">
                    Member aktif
                  </span>
                ) : (
                  <span className="px-2.5 py-1 bg-[#EEF1F5] text-[#475467] text-[11px] font-bold rounded-lg">
                    Pengunjung umum
                  </span>
                )}
              </div>

              <div className="border-t border-[#E2E6EE] pt-2.5 flex justify-between items-center font-bold">
                <span className="text-[#101828]">Total biaya</span>
                <span className={`text-base ${modal.isMember ? 'text-emerald-600' : 'text-[#26468A]'}`}>
                  Rp {modal.totalFee?.toLocaleString('id-ID')}
                </span>
              </div>
            </>
          )}
        </div>

        <button
          onClick={onClose}
          className={`w-full py-3.5 rounded-2xl font-bold text-sm text-white transition-colors ${accentBtn}`}
        >
          {isTapIn ? 'Oke, menuju slot' : 'Selesai'}
        </button>
      </div>
    </div>
  );
}

// =============================================================
// Popup verifikasi karcis / kartu e-money — preview lalu konfirmasi
// =============================================================
function TicketModal({ open, onClose, input, setInput, preview, error, loading, onLookup, onConfirm, onReset }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-3xl w-full max-w-md shadow-2xl shadow-black/15 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 px-6 pt-6 pb-4 border-b border-[#E2E6EE]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#26468A]/10 flex items-center justify-center shrink-0">
              <Ticket size={18} className="text-[#26468A]" />
            </div>
            <div>
              <h3 className="text-[15px] font-bold text-[#101828]">Verifikasi Karcis / Kartu e-Money</h3>
              <p className="text-[12px] text-[#98A2B3]">Cari transaksi aktif lalu terbitkan notifikasi tap-out manual.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-[#98A2B3] hover:text-[#101828] hover:bg-[#F3F5F9] transition-colors flex items-center justify-center shrink-0"
          >
            <X size={16} />
          </button>
        </div>

        <div className="px-6 py-5">
          {preview ? (
            <>
              <div className="rounded-2xl border border-[#E2E6EE] overflow-hidden mb-4">
                <div className="px-4 py-3 bg-[#F3F5F9] border-b border-[#E2E6EE] flex items-center gap-2">
                  <CheckCircle size={14} className="text-emerald-500" />
                  <span className="text-[12px] font-bold text-[#101828] uppercase tracking-wider">Transaksi ditemukan</span>
                </div>
                <div className="px-4 py-4 flex items-center justify-between border-b border-[#E2E6EE]">
                  <span className="text-[13px] text-[#667085]">Kode karcis/kartu</span>
                  <span className="text-[13px] font-bold font-mono tracking-widest text-[#101828]">{preview.card_id}</span>
                </div>
                <div className="px-4 py-4 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[12px] text-[#667085]">Slot</p>
                    <p className="text-[15px] font-black font-mono text-[#26468A]">{preview.slot_code}</p>
                  </div>
                  <div>
                    <p className="text-[12px] text-[#667085]">Plat nomor</p>
                    <p className="text-[14px] font-bold font-mono text-[#101828]">{preview.plate_number || '—'}</p>
                  </div>
                </div>
                <div className="px-4 py-4 border-t border-[#E2E6EE] bg-white">
                  <p className="text-[12px] text-[#667085]">Jam masuk</p>
                  <p className="text-[14px] font-bold text-[#101828]">{wibDateTime(preview.entry_time)}</p>
                </div>
              </div>

              {error && (
                <div className="mb-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-[12.5px] font-semibold px-4 py-3">
                  {error}
                </div>
              )}

              <div className="flex items-center gap-2.5">
                <button
                  onClick={onReset}
                  className="px-4 py-3 rounded-xl border border-[#E2E6EE] text-[#667085] hover:text-[#101828] hover:border-[#26468A]/40 text-[13px] font-semibold transition-colors"
                >
                  Ganti kode
                </button>
                <button
                  onClick={onConfirm}
                  disabled={loading}
                  className="flex-1 bg-[#26468A] hover:bg-[#1d3872] px-5 py-3 rounded-xl font-bold text-[13px] text-white transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? 'Menerbitkan…' : <><LifeBuoy size={15} /> Konfirmasi & Terbitkan Notifikasi</>}
                </button>
              </div>
            </>
          ) : (
            <>
              <label className="block text-[12px] font-bold text-[#667085] uppercase tracking-wider mb-2">Kode karcis/kartu</label>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !loading) onLookup(); }}
                placeholder="cth: TCK-20260916-XXXX"
                autoFocus
                className="w-full bg-white border border-[#E2E6EE] text-[#101828] text-[14px] px-4 py-3 rounded-xl focus:border-[#26468A]/50 focus:outline-none placeholder:text-[#98A2B3] font-mono uppercase tracking-wider mb-4"
              />

              {error && (
                <div className="mb-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-[12.5px] font-semibold px-4 py-3">
                  {error}
                </div>
              )}

              <button
                onClick={onLookup}
                disabled={loading}
                className="w-full bg-[#26468A] hover:bg-[#1d3872] px-5 py-3 rounded-xl font-bold text-[13px] text-white transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (<><RefreshCcw size={15} className="animate-spin" /> Mencari transaksi…</>) : (<><Scan size={15} /> Cari Transaksi</>)}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// =============================================================
// Nav bar portal — pill mengambang, versi terang
// =============================================================
function PortalNavBar({ onSelectStaff, onSelectCustomer, onSelectAdmin }) {
  const items = [
    { key: 'staff',    label: 'Portal Petugas',   icon: HardHat,     onClick: onSelectStaff },
    { key: 'customer', label: 'Portal Pelanggan', icon: UserRound,   onClick: onSelectCustomer },
    { key: 'admin',    label: 'Panel Admin',      icon: ShieldCheck, onClick: onSelectAdmin },
  ];

  return (
    <nav
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-1
                 bg-white border border-[#E2E6EE] rounded-2xl p-1.5 shadow-lg shadow-black/[0.06]"
      style={{ fontFamily: "'Manrope', sans-serif" }}
    >
      {items.map(({ key, label, icon: Icon, onClick }, idx) => (
        <React.Fragment key={key}>
          {idx > 0 && <div className="w-px h-5 bg-[#E2E6EE]" />}
          <button
            onClick={onClick}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-semibold
                       text-[#475467] hover:text-[#26468A] hover:bg-[#26468A]/[0.06]
                       transition-colors focus-visible:outline-none focus-visible:ring-2
                       focus-visible:ring-[#26468A]/30"
          >
            <Icon size={15} strokeWidth={2.25} />
            <span className="hidden sm:inline">{label}</span>
          </button>
        </React.Fragment>
      ))}
    </nav>
  );
}

// =============================================================
// KOMPONEN UTAMA
// =============================================================
function App() {
  const [currentPage, setCurrentPage] = useState('user');
  const [slots,          setSlots]          = useState([]);
  const [candidates,     setCandidates]     = useState([]);
  const [loading,        setLoading]        = useState(false);
  const [selectedSlot,   setSelectedSlot]   = useState(null);
  const [modal,          setModal]          = useState(null);
  const [detectedPlate,  setDetectedPlate]  = useState('');
  const [plateScore,     setPlateScore]     = useState(null);
  const [vehicleType,    setVehicleType]    = useState('');
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [aiStatus,       setAiStatus]       = useState('idle');
  const [lastDebug,      setLastDebug]      = useState(null);
  const [isCameraEnabled, setIsCameraEnabled] = useState(false);

  const [showNoPlateBtn, setShowNoPlateBtn] = useState(false);
  const [ticketInput,    setTicketInput]    = useState('');
  const [ticketModalOpen, setTicketModalOpen] = useState(false);
  const [ticketLoading,  setTicketLoading]  = useState(false);
  const [ticketPreview,  setTicketPreview]  = useState(null);
  const [ticketError,    setTicketError]    = useState('');

  const streamRef = React.useRef(null);
  const videoRef = React.useRef(null);

  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
        const adminToken = localStorage.getItem('admin_token');
        const staffToken = localStorage.getItem('staff_token');
        const customerToken = localStorage.getItem('customer_token');

        if (adminToken) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${adminToken}`;
            setCurrentPage('admin_dashboard');
        } else if (staffToken) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${staffToken}`;
            setCurrentPage('StaffLayout');
        } else if (customerToken) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${customerToken}`;
            setCurrentPage('CustomerDashboard');
        } else {
            delete axios.defaults.headers.common['Authorization'];
        }

        setIsCheckingSession(false);
    }, []);

  useEffect(() => {
      fetchSlots();
      const channel = echo.channel('parking-channel');
      channel.listen('.SlotUpdated', (e) => {
        setSlots(prev => prev.map(s =>
          s.id === e.slot.id ? { ...s, ...e.slot } : s
        ));
      });
      return () => echo.leaveChannel('parking-channel');
  }, []);

  const fetchSlots = async () => {
    try {
      const res = await axios.get(`${API_URL}/parking/slots`);
      setSlots(res.data.data);
      setCandidates(res.data.candidates || []);
    } catch {
      console.error('Gagal fetch slots');
    }
  };

  const stopCamera = () => {
      if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
      }
      if (videoRef.current) {
          videoRef.current.srcObject = null;
      }
  };

  const startCamera = async () => {
      if (!isCameraEnabled) return;
      try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          streamRef.current = stream;
          if (videoRef.current) {
              videoRef.current.srcObject = stream;
          }
      } catch (err) {
          console.error('Gagal akses kamera:', err);
      }
  };

  useEffect(() => {
      if (isCameraEnabled) {
          startCamera();
      } else {
          stopCamera();
      }

      return () => stopCamera();
  }, [isCameraEnabled]);

  const captureAndDetect = useCallback(async () => {
    const video = videoRef.current;
    if (!isCameraEnabled || !video || video.readyState < 4) return;

    setIsAiProcessing(true);
    setAiStatus('scanning');
    const canvas = document.createElement('canvas');
    canvas.width  = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(async (blob) => {
      const form = new FormData();
      form.append('file', blob, 'frame.jpg');
      try {
        const res  = await axios.post(`${AI_URL}/process-frame`, form);
        const data = res.data;
        setLastDebug(data);
        if (data.detections?.length > 0) {
          const best = data.detections.reduce((a, b) => (a.score > b.score ? a : b));
          if (best.plate) {
            setDetectedPlate(best.plate);
            setPlateScore(best.score);
            setVehicleType(best.vehicle_type || '');
            setAiStatus('found');
            return;
          }
        }
        setAiStatus(data.vehicles_found > 0 ? 'scanning' : 'idle');
      } catch {
        setAiStatus('error');
      } finally {
        setIsAiProcessing(false);
      }
    }, 'image/jpeg', 0.92);
  }, [isCameraEnabled]);

  useEffect(() => {
    if (!isCameraEnabled) {
      setAiStatus('idle');
      return;
    }
    const id = setInterval(captureAndDetect, INTERVAL);
    return () => clearInterval(id);
  }, [captureAndDetect, isCameraEnabled]);

  useEffect(() => {
    if (!isCameraEnabled) {
      setShowNoPlateBtn(false);
      return;
    }
    if (aiStatus !== 'scanning') {
      setShowNoPlateBtn(false);
      return;
    }
    const id = setTimeout(() => setShowNoPlateBtn(true), 5000);
    return () => clearTimeout(id);
  }, [aiStatus, isCameraEnabled]);

  const handleTapIn = async (noPlate = false) => {
    if (typeof noPlate !== 'boolean') noPlate = false;
    const plate = noPlate ? null : (detectedPlate || `B ${Math.floor(Math.random() * 9000) + 1000}`);
    setLoading(true);
    setShowNoPlateBtn(false);
    try {
      const res  = await axios.post(`${API_URL}/parking/tap-in`, { plate_number: plate, no_plate: noPlate });
      const data = res.data.data;

      const slot = slots.find(s => s.id === data.parking_slot_id) || slots.find(s => s.slot_code === data.allocated_slot);

      setSelectedSlot(slot);

      setModal({
        type:     'tapin',
        plate:    plate ?? `${slot?.slot_code ?? data.allocated_slot ?? 'N/A'}-UNKNOWN`,
        slotCode: slot?.slot_code ?? data.allocated_slot ?? 'N/A',
        time:     wibTime(data.transaction.entry_time),
        cardId:   data.transaction?.card_id ?? data.card_id ?? '',
      });

      setDetectedPlate('');
      setPlateScore(null);
      setVehicleType('');
      setAiStatus('idle');

      await fetchSlots();
    } catch {
      alert('Tap-in gagal. Pastikan backend aktif dan ada slot tersedia.');
    } finally {
      setLoading(false);
    }
  };

  const handleNoPlateTapIn = async () => {
    await handleTapIn(true);
  };

  const handleTapOut = async (slotId) => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/parking/tap-out`, { slot_id: slotId });

      if (response.data.status === 'success') {
        const currentSlot = slots.find(s => s.id === slotId);

        setModal({
          type:      'tapout',
          plate:     response.data.plate_number,
          slotCode:  currentSlot?.slot_code ?? 'Slot',
          time:      response.data.exit_time,
          duration:  response.data.duration,
          totalFee:  response.data.total_fee,
          isMember:  response.data.is_member
        });

        setSelectedSlot(null);
        setSlots(prevSlots => prevSlots.map(slot =>
          slot.id === slotId ? { ...slot, status: 'available' } : slot
        ));
      }
      await fetchSlots();
    } catch (error) {
      alert(error.response?.data?.message || 'Gagal memproses kendaraan keluar.');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestManualTapOut = async (slotId) => {
    if (!window.confirm('Kirim permintaan bantuan petugas untuk tap-out manual? Mohon tunggu di lokasi Anda.')) return;
    try {
      const res = await axios.post(`${API_URL}/parking/request-manual-tapout`, { slot_id: slotId });
      alert(res.data.message);
    } catch (error) {
      alert(error.response?.data?.message || 'Gagal mengirim permintaan bantuan.');
    }
  };

  const handleTicketLookup = async () => {
    const code = ticketInput.trim().toUpperCase();
    if (!code) {
      setTicketError('Masukkan kode karcis/kartu terlebih dahulu.');
      return;
    }
    setTicketLoading(true);
    setTicketError('');
    setTicketPreview(null);
    try {
      const res = await axios.post(`${API_URL}/parking/manual-tapout-preview`, { card_id: code });
      setTicketPreview(res.data.data);
    } catch (error) {
      setTicketError(error.response?.data?.message || 'Gagal mencari kode karcis/kartu.');
    } finally {
      setTicketLoading(false);
    }
  };

  const handleTicketConfirm = async () => {
    if (!ticketPreview) return;
    setTicketLoading(true);
    setTicketError('');
    try {
      const res = await axios.post(`${API_URL}/parking/request-manual-tapout`, { card_id: ticketPreview.card_id });

      const found = slots.find(s => s.slot_code?.toUpperCase() === ticketPreview.slot_code?.toUpperCase());
      if (found) setSelectedSlot(found);

      alert(res.data.message + (res.data.slot_code ? ` (Slot ${res.data.slot_code})` : ''));
      setTicketPreview(null);
      setTicketInput('');
      setTicketModalOpen(false);
    } catch (error) {
      setTicketError(error.response?.data?.message || 'Gagal menerbitkan notifikasi tap-out manual.');
    } finally {
      setTicketLoading(false);
    }
  };

  const closeModal = () => setModal(null);

  const StatusPill = () => {
    const map = {
      idle:     { label: 'Siaga',     cls: 'bg-[#EEF1F5] text-[#667085]' },
      scanning: { label: 'Memindai',  cls: 'bg-[#C97A1D]/10 text-[#C97A1D]' },
      found:    { label: 'Terbaca',   cls: 'bg-emerald-50 text-emerald-600' },
      error:    { label: 'Gangguan',  cls: 'bg-rose-50 text-rose-600' },
    };
    const { label, cls } = map[aiStatus] || map.idle;
    return (
      <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${cls}`}>
        {label}
      </span>
    );
  };

  const ConfBar = ({ score }) => {
    if (score == null) return null;
    const pct = Math.round(score * 100);
    const col = pct >= 70 ? 'bg-emerald-500' : pct >= 40 ? 'bg-[#C97A1D]' : 'bg-rose-500';
    return (
      <div className="mt-3">
        <div className="flex justify-between text-[11px] text-[#98A2B3] mb-1.5">
          <span>Tingkat keyakinan OCR</span><span className="font-semibold text-[#667085]">{pct}%</span>
        </div>
        <div className="h-1.5 bg-[#EEF1F5] rounded-full overflow-hidden">
          <div className={`h-full ${col} rounded-full transition-all`} style={{ width: `${pct}%` }} />
        </div>
      </div>
    );
  };

  if (isCheckingSession) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#F3F5F9]">
        <div className="text-lg font-semibold text-[#667085] animate-pulse" style={{ fontFamily: "'Manrope', sans-serif" }}>
          Membuka sesi...
        </div>
      </div>
    );
  }

  // ROUTING / PAGES RENDERING
  if (currentPage === 'login') {
    return (
      <LoginAdmin
        onLoginSuccess={() => setCurrentPage('admin_dashboard')}
        onNavigateToRegister={() => setCurrentPage('register')}
        onBackToUser={() => setCurrentPage('user')}
      />
    );
  }

  if (currentPage === 'register') {
    return (
      <RegisterAdmin
        onRegisterSuccess={() => setCurrentPage('login')}
        onNavigateToLogin={() => setCurrentPage('login')}
      />
    );
  }

  if (currentPage === 'admin_dashboard') {
    return (
      <AdminLayout onLogoutSuccess={() => setCurrentPage('user')} />
    );
  }

  if (currentPage === 'login_staff') {
    return (
      <LoginStaff
        onLoginSuccess={() => setCurrentPage('StaffLayout')}
        onBackToMain={() => setCurrentPage('user')}
      />
    );
  }

  if (currentPage === 'StaffLayout') {
    return (
      <StaffLayout
        onLogoutSuccess={() => setCurrentPage('user')}
      />
    );
  }

  if (currentPage === 'customer_login') {
      return (
          <LoginCustomer
              onLoginSuccess={() => setCurrentPage('CustomerDashboard')}
              onNavigateToRegister={() => setCurrentPage('customer_register')}
              onBack={() => setCurrentPage('user')}
          />
      );
  }

  if (currentPage === 'customer_register') {
      return (
          <RegisterCustomer
              onRegisterSuccess={() => setCurrentPage('customer_login')}
              onNavigateToLogin={() => setCurrentPage('customer_login')}
              onBack={() => setCurrentPage('user')}
          />
      );
  }

  if (currentPage === 'CustomerDashboard') {
      return (
          <CustomerDashboard onLogoutSuccess={() => setCurrentPage('user')} />
      );
  }

  function renderMainParkingContent() {
    return (
      <div className="max-w-6xl mx-auto py-10 px-5" style={{ fontFamily: "'Manrope', sans-serif" }}>

        {/* ── TOOLBAR ─────────────────────────────────────── */}
        <div className="flex items-center justify-between pb-6 mb-8 border-b border-[#E2E6EE]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#26468A] flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-lg leading-none" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>P</span>
            </div>
            <div>
              <h1 className="text-[17px] font-bold text-[#101828] leading-tight">Gerbang Masuk</h1>
              <p className="text-[12px] text-[#98A2B3] leading-tight">Konsol pemantauan real-time</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
                onClick={() => setIsCameraEnabled(prev => !prev)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl text-[13px] font-semibold border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 ${
                    isCameraEnabled
                        ? 'bg-rose-50 border-rose-100 text-rose-600 hover:bg-rose-100 focus-visible:ring-rose-300'
                        : 'bg-white border-[#E2E6EE] text-[#475467] hover:border-[#26468A]/40 focus-visible:ring-[#26468A]/30'
                }`}
            >
                {isCameraEnabled ? <CameraOff size={15} /> : <Camera size={15} />}
                <span className="hidden md:inline">{isCameraEnabled ? 'Matikan kamera' : 'Nyalakan kamera'}</span>
            </button>

            <button
              onClick={() => handleTapIn()}
              disabled={loading}
              className="bg-[#26468A] px-6 py-3 rounded-xl font-bold text-[13px] text-white
                         hover:bg-[#1d3872] active:scale-[0.98] transition-all shadow-sm shadow-[#26468A]/20
                         disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#26468A]/40 focus-visible:ring-offset-1"
            >
              {loading ? 'Memproses…' : 'Tap masuk'}
            </button>

            <button
                onClick={() => setTicketModalOpen(true)}
                title="Verifikasi karcis / kartu e-money"
                className="flex items-center justify-center w-11 h-11 rounded-xl border border-[#E2E6EE] bg-white text-[#475467] hover:border-[#26468A]/40 hover:text-[#26468A] hover:bg-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#26468A]/30"
            >
                <Ticket size={17} />
            </button>

            {showNoPlateBtn && (
              <button
                onClick={handleNoPlateTapIn}
                disabled={loading}
                className="bg-[#C97A1D] px-4 py-3 rounded-xl font-bold text-[13px] text-white
                           flex items-center gap-2 hover:bg-[#b06a17] transition-colors shadow-sm shadow-[#C97A1D]/25
                           disabled:opacity-50"
              >
                <TriangleAlert size={15} /> <span className="hidden lg:inline">Plat tak terdeteksi</span>
              </button>
            )}
          </div>
        </div>

        {/* ── PANEL KONSOL: Kamera + Pembaca Plat ────────────── */}
        <div className="bg-white rounded-3xl border border-[#E2E6EE] shadow-sm shadow-black/[0.02] overflow-hidden mb-8">
          <div className="grid grid-cols-1 md:grid-cols-5">

            {/* Zona kamera — momen gelap yang disengaja */}
            <div className="md:col-span-3 bg-[#0B1220] relative aspect-video md:aspect-auto md:min-h-[300px] flex items-center justify-center">
                {isCameraEnabled ? (
                    <video
                        ref={videoRef}
                        autoPlay
                        muted
                        playsInline
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="text-center px-6 flex flex-col items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-white/[0.06] flex items-center justify-center">
                          <Monitor size={22} className="text-[#5B6472]" />
                        </div>
                        <div>
                          <p className="text-[13px] font-semibold text-[#CBD3DE]">Kamera nonaktif</p>
                          <p className="text-[12px] text-[#5B6472] mt-1 max-w-[240px] leading-relaxed">
                            Mode pengembangan. Nyalakan kamera untuk memulai simulasi deteksi plat.
                          </p>
                        </div>
                    </div>
                )}

                {isAiProcessing && (
                  <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-full text-[11px] font-semibold text-white">
                    <RefreshCcw size={11} className="animate-spin" /> Memindai
                  </div>
                )}
            </div>

            {/* Zona pembaca plat */}
            <div className="md:col-span-2 p-6 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[13px] font-semibold text-[#475467]">Plat terdeteksi</p>
                <StatusPill />
              </div>

              <div className="bg-[#F3F5F9] rounded-2xl px-4 py-5 border border-[#E2E6EE] flex items-center gap-3">
                <Scan className={detectedPlate ? 'text-[#26468A]' : 'text-[#C1C9D4]'} size={24} />
                <span
                  className="text-[22px] font-bold tracking-wider text-[#101828] leading-none"
                  style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                >
                  {detectedPlate
                    ? detectedPlate.replace(/(.{1,2})(\d{1,4})(.{0,3})/, '$1 $2 $3').trim()
                    : '— — —'}
                </span>
              </div>

              {vehicleType && (
                <p className="text-[12px] text-[#98A2B3] mt-2 ml-1">{vehicleType}</p>
              )}

              <ConfBar score={plateScore} />

              {lastDebug && (
                <details className="mt-auto pt-4 text-[11px]">
                  <summary className="cursor-pointer flex items-center gap-1.5 select-none text-[#98A2B3] hover:text-[#667085] font-medium">
                    <AlertCircle size={12} /> Lihat respons API terakhir
                  </summary>
                  <pre className="mt-2 p-3 bg-[#0B1220] text-[#9AE6B4] rounded-xl overflow-x-auto text-[10px] leading-relaxed max-h-40 overflow-y-auto"
                       style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                    {JSON.stringify(lastDebug, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          </div>
        </div>

        {/* ── PETA SLOT ───────────────────────────────────────── */}
        <div className="bg-white rounded-3xl border border-[#E2E6EE] shadow-sm shadow-black/[0.02] p-6">
          <div className="flex items-center gap-2 mb-5">
            <MapPin size={16} className="text-[#26468A]" />
            <h2 className="text-[15px] font-bold text-[#101828]">Peta lokasi slot</h2>
          </div>
          <div className="rounded-2xl overflow-hidden border border-[#E2E6EE]">
            <SpatialParkingLayout
                slots={slots}
                candidates={candidates}
                selectedSlot={selectedSlot}
                setSelectedSlot={setSelectedSlot}
                handleTapOut={handleTapOut}
                onRefreshCandidates={fetchSlots}
                onRequestManualTapOut={handleRequestManualTapOut}
            />
          </div>
        </div>

        <div className="h-24" />
      </div>
    );
  }

return (
    <div className="relative min-h-screen bg-[#F3F5F9]">
      <FontLoader />
      <PortalNavBar
        onSelectStaff={() => setCurrentPage('login_staff')}
        onSelectCustomer={() => setCurrentPage('customer_login')}
        onSelectAdmin={() => setCurrentPage('login')}
      />

      <ParkingModal modal={modal} onClose={closeModal} />
      <TicketModal
        open={ticketModalOpen}
        onClose={() => { setTicketModalOpen(false); setTicketError(''); }}
        input={ticketInput}
        setInput={(v) => { setTicketInput(v); setTicketPreview(null); setTicketError(''); }}
        preview={ticketPreview}
        error={ticketError}
        loading={ticketLoading}
        onLookup={handleTicketLookup}
        onConfirm={handleTicketConfirm}
        onReset={() => { setTicketInput(''); setTicketPreview(null); setTicketError(''); }}
      />
      {renderMainParkingContent()}
    </div>
  );
}

export default App;