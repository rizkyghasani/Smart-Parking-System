import React, { useEffect, useState } from 'react';

/**
 * GateSimulation
 * ----------------
 * Overlay modal berisi animasi simulasi portal parkir (palang) terbuka
 * dan mobil melintas, dipakai untuk memberi feedback visual setelah
 * tap-in / tap-out berhasil.
 *
 * Cara pakai (contoh di App.jsx / Dashboard Utama):
 *
 *   const [gateSim, setGateSim] = useState({ open: false, mode: 'in' });
 *
 *   // setelah tap-in sukses:
 *   setGateSim({ open: true, mode: 'in' });
 *
 *   // setelah tap-out sukses:
 *   setGateSim({ open: true, mode: 'out' });
 *
 *   <GateSimulation
 *     isOpen={gateSim.open}
 *     mode={gateSim.mode}            // 'in' | 'out'
 *     plateNumber={lastPlate}        // opsional, contoh "B 1234 XYZ"
 *     slotCode={lastSlot}            // opsional, contoh "A-12"
 *     onComplete={() => setGateSim((s) => ({ ...s, open: false }))}
 *   />
 *
 * Komponen ini murni presentational, tidak melakukan panggilan API apa pun.
 * Durasi total animasi ~5.4 detik lalu otomatis memanggil onComplete().
 *
 * Urutan kejadian (benar-benar berurutan, tidak tumpang tindih):
 *   1. approaching — mobil terlihat lalu melaju & berhenti tepat sebelum palang
 *   2. opening     — mobil diam, palang baru terbuka
 *   3. crossing    — palang sudah terbuka, mobil lanjut melintas sampai keluar frame
 *   4. closing     — setelah mobil lewat, palang menutup kembali
 *   5. hold        — jeda sejenak sebelum overlay hilang
 */

const PHASE_DURATIONS = {
  approaching: 1300, // mobil melaju lalu berhenti sebelum palang
  opening: 700,       // palang terbuka (mobil diam)
  crossing: 2200,     // mobil lanjut melintas sampai keluar frame
  closing: 700,       // palang menutup
  hold: 500,          // jeda sebelum overlay hilang
};

export default function GateSimulation({
  isOpen,
  mode = 'in',
  plateNumber,
  slotCode,
  onComplete,
}) {
  const [phase, setPhase] = useState('idle'); // idle -> approaching -> opening -> crossing -> closing -> hold -> done

  useEffect(() => {
    if (!isOpen) {
      setPhase('idle');
      return;
    }

    setPhase('approaching');
    const timers = [];
    let elapsed = 0;

    const schedule = (nextPhase, duration) => {
      elapsed += duration;
      timers.push(setTimeout(() => setPhase(nextPhase), elapsed));
    };

    schedule('opening', PHASE_DURATIONS.approaching);
    schedule('crossing', PHASE_DURATIONS.opening);
    schedule('closing', PHASE_DURATIONS.crossing);
    schedule('hold', PHASE_DURATIONS.closing);
    timers.push(
      setTimeout(() => {
        setPhase('done');
        if (onComplete) onComplete();
      }, elapsed + PHASE_DURATIONS.hold)
    );

    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, mode]);

  if (!isOpen || phase === 'idle' || phase === 'done') return null;

  const isTapIn = mode === 'in';

  // Palang "terbuka" selama fase opening (sedang naik) & crossing (tertahan terbuka).
  // Begitu masuk closing, class berganti ke gs-barrier-closed sehingga palang turun.
  const gateOpen = phase === 'opening' || phase === 'crossing';

  // Mobil punya 2 animasi berurutan yang masing-masing "forwards" (menahan posisi
  // akhir): approach (melaju -> berhenti sebelum palang) lalu cross (lanjut -> keluar
  // frame). Selama fase "opening" classname TETAP approach, jadi animasi approach
  // yang sudah selesai hanya menahan mobil diam di titik berhenti — tidak restart.
  const carPhaseClass =
    phase === 'approaching' || phase === 'opening'
      ? (isTapIn ? 'gs-car-approach-in' : 'gs-car-approach-out')
      : (isTapIn ? 'gs-car-cross-in' : 'gs-car-cross-out');

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <style>{`
        @keyframes gs-barrier-up {
          from { transform: rotate(0deg); }
          to   { transform: rotate(-78deg); }
        }
        @keyframes gs-barrier-down {
          from { transform: rotate(-78deg); }
          to   { transform: rotate(0deg); }
        }
        .gs-barrier-open {
          animation: gs-barrier-up 0.7s ease-out forwards;
        }
        .gs-barrier-closed {
          animation: gs-barrier-down 0.7s ease-in forwards;
        }
        /* Tahap 1: mobil terlihat lalu melaju & melambat berhenti sebelum palang */
        .gs-car-approach-in {
          animation: gs-car-approach-in 1.3s ease-out forwards;
        }
        .gs-car-approach-out {
          animation: gs-car-approach-out 1.3s ease-out forwards;
        }
        @keyframes gs-car-approach-in {
          from { transform: translateX(-220px); }
          to   { transform: translateX(-38px); }
        }
        @keyframes gs-car-approach-out {
          from { transform: translateX(260px) scaleX(-1); }
          to   { transform: translateX(38px) scaleX(-1); }
        }

        /* Tahap 2: dari titik berhenti, mobil lanjut melintas sampai keluar frame */
        .gs-car-cross-in {
          animation: gs-car-cross-in 2.2s ease-in forwards;
        }
        .gs-car-cross-out {
          animation: gs-car-cross-out 2.2s ease-in forwards;
        }
        @keyframes gs-car-cross-in {
          from { transform: translateX(-38px); }
          to   { transform: translateX(260px); }
        }
        @keyframes gs-car-cross-out {
          from { transform: translateX(38px) scaleX(-1); }
          to   { transform: translateX(-220px) scaleX(-1); }
        }
      `}</style>

      <div className="bg-white rounded-2xl shadow-2xl w-[420px] max-w-[92vw] p-6 relative overflow-hidden">
        {/* Header */}
        <div className="text-center mb-4">
          <p className="text-xs font-semibold tracking-wide text-gray-400 uppercase">
            Simulasi Portal Parkir
          </p>
          <h3 className="text-lg font-bold text-gray-800 mt-1">
            {isTapIn ? 'Kendaraan Memasuki Area Parkir' : 'Kendaraan Meninggalkan Area Parkir'}
          </h3>
          {(plateNumber || slotCode) && (
            <p className="text-sm text-gray-500 mt-1">
              {plateNumber && <span className="font-medium">{plateNumber}</span>}
              {plateNumber && slotCode && <span className="mx-1">&middot;</span>}
              {slotCode && <span>Slot {slotCode}</span>}
            </p>
          )}
        </div>

        {/* Scene */}
        <div className="relative h-40 bg-gradient-to-b from-sky-50 to-gray-100 rounded-xl overflow-hidden border border-gray-200">
          {/* Jalan */}
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gray-700">
            <div className="absolute top-1/2 left-0 right-0 h-[3px] -translate-y-1/2 bg-[repeating-linear-gradient(90deg,#facc15_0_18px,transparent_18px_34px)]" />
          </div>

          {/* Area luar / dalam label */}
          <div className="absolute top-2 left-3 text-[10px] font-semibold text-gray-400 uppercase">
            {isTapIn ? 'Luar' : 'Area Parkir'}
          </div>
          <div className="absolute top-2 right-3 text-[10px] font-semibold text-gray-400 uppercase">
            {isTapIn ? 'Area Parkir' : 'Luar'}
          </div>

          {/* Tiang + palang, diposisikan di tengah scene */}
          <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex flex-col items-center z-20">
            {/* Tiang */}
            <div className="w-2 h-10 bg-gray-500 rounded-sm" />
          </div>
          <div
            className="absolute z-20"
            style={{ left: 'calc(50% + 6px)', bottom: '63px', transformOrigin: 'left center' }}
          >
            <div
              className={`h-[6px] w-[90px] rounded-full bg-gradient-to-r from-red-500 via-white to-red-500 shadow-md ${
                gateOpen ? 'gs-barrier-open' : 'gs-barrier-closed'
              }`}
              style={{ transform: 'rotate(0deg)' }}
            />
          </div>

          {/* Mobil */}
          <div
            className={`absolute bottom-[26px] left-[48%] z-10 ${carPhaseClass}`}
            style={{ transform: isTapIn ? 'translateX(-220px)' : 'translateX(260px) scaleX(-1)' }}
          >
            <CarIcon />
          </div>
        </div>

        {/* Status text */}
        <p className="text-center text-sm text-gray-500 mt-4">
          {phase === 'approaching' && 'Kendaraan mendekati portal...'}
          {phase === 'opening' && 'Membuka portal...'}
          {phase === 'crossing' && (isTapIn ? 'Kendaraan masuk...' : 'Kendaraan keluar...')}
          {(phase === 'closing' || phase === 'hold') && 'Menutup portal...'}
        </p>
      </div>
    </div>
  );
}

function CarIcon() {
  return (
    <svg width="64" height="30" viewBox="0 0 64 30" fill="none">
      <rect x="4" y="12" width="56" height="12" rx="3" fill="#2563eb" />
      <path d="M14 12 L20 3 H44 L50 12 Z" fill="#3b82f6" />
      <rect x="21" y="5.5" width="10" height="6.5" rx="1" fill="#bfdbfe" />
      <rect x="33" y="5.5" width="10" height="6.5" rx="1" fill="#bfdbfe" />
      <circle cx="16" cy="25" r="5" fill="#1f2937" />
      <circle cx="16" cy="25" r="2" fill="#9ca3af" />
      <circle cx="48" cy="25" r="5" fill="#1f2937" />
      <circle cx="48" cy="25" r="2" fill="#9ca3af" />
    </svg>
  );
}