import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios'; // 🌟 PERBAIKAN: Impor axios diperbaiki dari 'axios'
import AdminLayout from './components/admin/AdminLayout';
import LoginAdmin from './components/auth/LoginAdmin';
import RegisterAdmin from './components/auth/RegisterAdmin';
import LoginStaff from './components/auth/LoginStaff';
import StaffDashboard from './components/staff/StaffDashboard';
import CustomerDashboard from './components/customer/CustomerDashboard';
import LoginCustomer from './components/customer/LoginCustomer';
import RegisterCustomer from './components/customer/RegisterCustomer';
import { echo } from './services/echo.js';
import CameraStream from './components/CameraStream';
import { Car, Monitor, Activity, LogOut, Scan, RefreshCcw, AlertCircle, X, CheckCircle, Receipt } from 'lucide-react';

const AI_URL   = 'http://localhost:8001';
const API_URL  = 'http://localhost:8000/api';
const INTERVAL = 3000;

// =============================================================
// KOMPONEN MODAL INTEGRASI — Mendukung Info Tap-In & Struk Kuitansi Tap-Out
// =============================================================
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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm mx-4 bg-slate-800 border border-slate-700 rounded-3xl shadow-2xl p-6 text-white"
        onClick={e => e.stopPropagation()}
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
              {isTapIn ? 'Sirkulasi Masuk' : 'Transaksi Selesai'}
            </p>
            <p className="text-lg font-black tracking-tight text-white">
              {isTapIn ? 'Tap-In Berhasil' : 'Kuitansi Tarif Parkir'}
            </p>
          </div>
        </div>

        <div className="bg-slate-900 rounded-2xl px-5 py-4 mb-4 border border-slate-700">
          <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Nomor Plat</p>
          <p className="text-3xl font-mono font-black tracking-widest text-white text-center">
            {modal.plate}
          </p>
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
              
              {/* 🌟 BARIS BARU: Menampilkan Tipe Pelanggan */}
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-500">Tipe Pelanggan:</span>
                {modal.isMember ? (
                   <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-black rounded-md uppercase tracking-wider">
                     Member Aktif
                   </span>
                ) : (
                   <span className="px-2 py-0.5 bg-slate-700 text-slate-300 text-[10px] font-black rounded-md uppercase tracking-wider">
                     Pengunjung Umum
                   </span>
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

        <button
          onClick={onClose}
          className={`w-full py-3.5 rounded-2xl font-black text-sm uppercase tracking-widest
                      text-white transition-all shadow-lg ${accentBtn}`}
        >
          {isTapIn ? 'Oke, Menuju Slot' : 'Selesai & Tutup'}
        </button>
      </div>
    </div>
  );
}

// =============================================================
// KOMPONEN UTAMA
// =============================================================
function App() {
  const [currentPage, setCurrentPage] = useState('user');
  const [slots,          setSlots]          = useState([]);
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

  // 🌟 PERBAIKAN 1: Inisialisasi useRef yang tertinggal agar pelacakan hardware stream valid
  const streamRef = React.useRef(null);
  const videoRef = React.useRef(null);

  // 1. Tambahkan state baru untuk menahan render awal
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
            // 🌟 PERBAIKAN TYPO: Samakan dengan yang di bawah
            setCurrentPage('StaffDashboard'); 
        } else if (customerToken) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${customerToken}`;
            // 🌟 PERBAIKAN TYPO: Samakan dengan yang di bawah
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
      setSlots(prev => prev.map(s => s.id === e.slot.id ? e.slot : s));
    });
    return () => echo.leaveChannel('parking-channel');
  }, []);

  const fetchSlots = async () => {
    try {
      const res = await axios.get(`${API_URL}/parking/slots`);
      setSlots(res.data.data);
    } catch {
      console.error('Gagal fetch slots');
    }
  };

  const stopCamera = () => {
      if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
      }
      // ← ganti querySelector dengan videoRef
      if (videoRef.current) {
          videoRef.current.srcObject = null;
      }
  };

  const startCamera = async () => {
      if (!isCameraEnabled) return;
      try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          streamRef.current = stream;
          // ← ganti querySelector dengan videoRef
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
          stopCamera(); // ← ini yang matikan lampu kamera fisik
      }

      return () => stopCamera(); // cleanup saat unmount
  }, [isCameraEnabled]);

  // useEffect(() => {
  //   if (isCameraEnabled) {
  //       startCamera();
  //   } else {
  //       stopCamera();
  //   }

  //   return () => stopCamera(); 
  // }, [isCameraEnabled]);

  const captureAndDetect = useCallback(async () => {
    //const video = document.querySelector('video');
    const video = videoRef.current;
    // Jika kamera dimatikan atau belum siap, langsung batalkan pemindaian frame
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

  // 🌟 PERBAIKAN 3: Menyertakan isCameraEnabled sebagai parameter dependensi pemicu interval
  useEffect(() => {
    if (!isCameraEnabled) {
      setAiStatus('idle');
      return; 
    }
    const id = setInterval(captureAndDetect, INTERVAL);
    return () => clearInterval(id);
  }, [captureAndDetect, isCameraEnabled]);

  const handleTapIn = async () => {
    const plate = detectedPlate || `B ${Math.floor(Math.random() * 9000) + 1000}`;
    setLoading(true);
    try {
      const res  = await axios.post(`${API_URL}/parking/tap-in`, { plate_number: plate });
      const data = res.data.data; 

      const slot = slots.find(s => s.id === data.parking_slot_id);

      setModal({
        type:     'tapin',
        plate:    plate,
        slotCode: slot?.slot_code ?? `#${data.parking_slot_id}`,
        time:     new Date(data.entry_time).toLocaleTimeString('id-ID'),
      });

      setDetectedPlate('');
      setPlateScore(null);
      setVehicleType('');
      setAiStatus('idle');
    } catch {
      alert('❌ Tap-In gagal. Pastikan backend aktif.');
    } finally {
      setLoading(false);
    }
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
    } catch (error) {
      alert(error.response?.data?.message || 'Gagal memproses kendaraan keluar.');
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => setModal(null);

  const StatusPill = () => {
    const map = {
      idle:     { label: 'IDLE',     cls: 'bg-slate-700 text-slate-400' },
      scanning: { label: 'SCANNING', cls: 'bg-yellow-500/10 text-yellow-400' },
      found:    { label: 'FOUND',    cls: 'bg-emerald-500/10 text-emerald-400' },
      error:    { label: 'ERROR',    cls: 'bg-red-500/10 text-red-400' },
    };
    const { label, cls } = map[aiStatus] || map.idle;
    return (
      <span className={`text-[10px] font-black px-3 py-1 rounded-full ${cls}`}>
        {label}
      </span>
    );
  };

  const ConfBar = ({ score }) => {
    if (score == null) return null;
    const pct = Math.round(score * 100);
    const col = pct >= 70 ? 'bg-emerald-500' : pct >= 40 ? 'bg-yellow-500' : 'bg-red-500';
    return (
      <div className="mt-2">
        <div className="flex justify-between text-[9px] text-slate-500 mb-1">
          <span>OCR Confidence</span><span>{pct}%</span>
        </div>
        <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
          <div className={`h-full ${col} rounded-full transition-all`} style={{ width: `${pct}%` }} />
        </div>
      </div>
    );
  };

  if (isCheckingSession) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-900">
        <div className="text-xl font-bold text-slate-400 animate-pulse">
          Membuka Sesi...
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
        onLoginSuccess={() => setCurrentPage('StaffDashboard')} 
        onBackToMain={() => setCurrentPage('user')}
      />
    );
  }

  if (currentPage === 'StaffDashboard') {
    return (
      <StaffDashboard 
        onLogoutSuccess={() => setCurrentPage('user')} 
      />
    );
  }

  if (currentPage === 'customer_login') {
      return (
          <LoginCustomer 
              onLoginSuccess={() => setCurrentPage('CustomerDashboard')} 
              onNavigateToRegister={() => setCurrentPage('customer_register')}
          />
      );
  }

  if (currentPage === 'customer_register') {
      return (
          <RegisterCustomer 
              onRegisterSuccess={() => setCurrentPage('customer_login')} 
              onNavigateToLogin={() => setCurrentPage('customer_login')}
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
      <div className="max-w-6xl mx-auto py-8 px-4">
        <header className="mb-10 flex justify-between items-center border-b border-slate-800 pb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-500/20">
              <Car size={32} strokeWidth={3} />
            </div>
            <h1 className="text-3xl font-black tracking-tighter text-white">
              <span className="text-blue-500">PARKING SYSTEM</span>
            </h1>
          </div>
          
          {/* 🌟 PERBAIKAN 4: Menata letak tombol kontrol kamera agar berdampingan rapi dengan tombol TAP MASUK */}
          <div className="flex items-center gap-3">
            <button
                onClick={() => setIsCameraEnabled(prev => !prev)}
                className={`flex items-center gap-2 px-5 py-4 rounded-2xl text-xs font-black uppercase tracking-widest border transition-all ${
                    isCameraEnabled
                        ? 'bg-rose-600/10 border-rose-500/30 text-rose-400 hover:bg-rose-600 hover:text-white'
                        : 'bg-emerald-600/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-600 hover:text-white'
                }`}
            >
                <span>{isCameraEnabled ? '📷 Matikan Kamera' : '📷 Nyalakan Kamera'}</span>
            </button>

            <button
              onClick={handleTapIn}
              disabled={loading}
              className="bg-blue-600 px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest
                         hover:bg-blue-500 active:scale-95 transition-all shadow-xl shadow-blue-600/20
                         disabled:opacity-50"
            >
              {loading ? 'PROCESSING…' : 'TAP MASUK'}
            </button>
          </div>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-slate-800 p-4 rounded-[2rem] border border-slate-700 shadow-2xl">
              <div className="flex items-center justify-between mb-4 px-2">
                <h2 className="text-sm font-bold flex items-center gap-2 text-slate-400 uppercase tracking-widest">
                  <Monitor size={16} /> Live Entrance Camera
                </h2>
                {isAiProcessing && (
                  <div className="flex items-center gap-2 text-blue-400 text-[10px] font-bold">
                    <RefreshCcw size={12} className="animate-spin" /> SCANNING…
                  </div>
                )}
              </div>
              
              {/* Render area tampilan stream hanya jika status aktif */}
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-900 border border-slate-700 flex items-center justify-center">
                  {isCameraEnabled ? (
                      <video
                          ref={videoRef}
                          autoPlay
                          muted
                          playsInline
                          className="w-full h-full object-cover"
                      />
                  ) : (
                      <div className="text-center text-slate-500 p-6 flex flex-col items-center gap-2">
                          <AlertCircle size={36} className="text-slate-600" />
                          <p className="text-xs font-bold uppercase tracking-wider">Kamera Dinonaktifkan</p>
                          <p className="text-[10px] text-slate-600 max-w-xs leading-normal">Mode dev aktif. Klik tombol "Nyalakan Kamera" di atas untuk memulai simulasi deteksi OCR plat nomor.</p>
                      </div>
                  )}
              </div>

              <div className="mt-4 p-5 bg-slate-900 rounded-2xl border border-slate-700">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    Detected Plate
                  </p>
                  <StatusPill />
                </div>
                <div className="flex items-center gap-3">
                  <Scan className={detectedPlate ? 'text-blue-500' : 'text-slate-600'} size={28} />
                  <span className="text-3xl font-mono font-black tracking-widest text-white">
                    {detectedPlate
                      ? detectedPlate.replace(/(.{1,2})(\d{1,4})(.{0,3})/, '$1 $2 $3').trim()
                      : '--- WAITING ---'}
                  </span>
                </div>
                {vehicleType && (
                  <p className="text-[10px] text-slate-500 mt-1 ml-10 uppercase">{vehicleType}</p>
                )}
                <ConfBar score={plateScore} />
              </div>
              {lastDebug && (
                <details className="mt-3 text-[10px] text-slate-500">
                  <summary className="cursor-pointer flex items-center gap-1 select-none px-1">
                    <AlertCircle size={11} /> Debug — last API response
                  </summary>
                  <pre className="mt-2 p-3 bg-slate-950 rounded-xl overflow-x-auto text-[10px] leading-relaxed">
                    {JSON.stringify(lastDebug, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          </div>

          <aside className="bg-slate-800 p-8 rounded-[2rem] border border-slate-700 shadow-2xl">
            <h2 className="text-xl font-bold mb-8 flex items-center gap-3 tracking-tight text-white">
              <Activity className="text-blue-500" /> Parking Layout
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {slots.map((slot) => (
                <div
                  key={slot.id}
                  onClick={() => setSelectedSlot(slot)}
                  className={`cursor-pointer p-6 rounded-2xl border-2 transition-all flex flex-col
                              items-center ${
                    slot.status === 'available'
                      ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-500 hover:bg-emerald-500/10'
                      : slot.status === 'occupied'
                      ? 'border-rose-500/20 bg-rose-500/5 text-rose-500'
                      : 'border-yellow-500/20 bg-yellow-500/5 text-yellow-500'
                  } ${selectedSlot?.id === slot.id ? 'ring-4 ring-blue-500/50 border-blue-500' : ''}`}
                >
                  <span className="text-3xl font-black mb-1">{slot.slot_code}</span>
                  <span className="text-[9px] font-black uppercase tracking-tighter opacity-60">
                    {slot.status}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-8 border-t border-slate-700 pt-8">
              {selectedSlot && (selectedSlot.status === 'occupied' || selectedSlot.status === 'violation') ? (
                <div>
                  <p className="text-xs text-slate-400 mb-4 text-center font-medium">
                    Action for slot <strong>{selectedSlot.slot_code}</strong>
                  </p>
                  <button
                    onClick={() => handleTapOut(selectedSlot.id)}
                    className="w-full bg-rose-600 hover:bg-rose-500 py-4 rounded-2xl font-black
                               text-sm uppercase tracking-widest flex items-center justify-center
                               gap-3 transition-all shadow-lg shadow-rose-600/20"
                  >
                    <LogOut size={18} /> TAP OUT
                  </button>
                </div>
              ) : (
                <div className="text-center p-6 border-2 border-dashed border-slate-700 rounded-2xl">
                  <p className="text-xs text-slate-500 font-medium">
                    Select an occupied slot to perform action
                  </p>
                </div>
              )}
            </div>
          </aside>
        </main>
      </div>
    );
  }

return (
    <div className="relative min-h-screen bg-slate-900">
      {/* Tombol Portal Petugas (Kiri) */}
      <div className="absolute bottom-6 left-6 z-40">
        <button 
          onClick={() => setCurrentPage('login_staff')}
          className="bg-slate-800/80 hover:bg-slate-700 text-slate-200 hover:text-white px-4 py-2.5 
                    rounded-2xl text-xs font-bold tracking-wide shadow-lg border border-slate-700/60 
                    flex items-center space-x-2 backdrop-blur-sm transition-all"
        >
          <span>👷</span> <span>Portal Petugas</span>
        </button>
      </div>

      {/* 🌟 Tombol Portal Pelanggan (Tengah Bawah) */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40">
        <button
          onClick={() => setCurrentPage('customer_login')}
          className="bg-indigo-600/90 hover:bg-indigo-500 text-white px-4 py-2.5 
                     rounded-2xl text-xs font-bold tracking-wide shadow-lg border border-indigo-400/30 
                     flex items-center space-x-2 backdrop-blur-sm transition-all"
        >
          <span>🚗</span> <span>Portal Pelanggan</span>
        </button>
      </div>

      {/* Tombol Panel Admin (Kanan) */}
      <div className="absolute bottom-6 right-6 z-40">
        <button
          onClick={() => setCurrentPage('login')}
          className="bg-slate-800/80 hover:bg-slate-700 text-slate-200 hover:text-white px-4 py-2.5 
                     rounded-2xl text-xs font-bold tracking-wide shadow-lg border border-slate-700/60 
                     flex items-center space-x-2 backdrop-blur-sm transition-all"
        >
          <span>🔐</span> <span>Panel Admin</span>
        </button>
      </div>

      <ParkingModal modal={modal} onClose={closeModal} />
      {renderMainParkingContent()}
    </div>
  );
}

export default App;