import { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import axios from 'axios';
import { AlertTriangle, CheckCircle, MapPin, X } from 'lucide-react';
import SpatialParkingLayout from '../../SpatialParkingLayout';

// =============================================================
// CONTROLLER SIMULASI PELANGGARAN / OVERRIDE SLOT — Konsol Gerbang
//
// Mendukung banyak pelanggaran aktif secara bersamaan.
// Tiap transaksi punya status violated independen (peta `violated`).
// =============================================================
const OverrideSlotControl = forwardRef(({
    slots,
    candidates,
    selectedSlot,
    setSelectedSlot,
    handleTapOut,
    onRequestManualTapOut,
    activeTransaction,
    onRefresh,
}, ref) => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

    const [isChoosingManualSlot, setIsChoosingManualSlot] = useState(false);
    const [loadingAction, setLoadingAction] = useState(false);

    // { [txId]: { allocatedSlotId, detectedSlotId } }
    const [violated, setViolated] = useState({});

    // Reset mode memilih saat fokus transaksi berubah (tap-in kendaraan baru)
    useEffect(() => {
        setIsChoosingManualSlot(false);
    }, [activeTransaction?.id]);

    // Ekspose aksi untuk parent (dipanggil dari tombol di dalam modal tap-in)
    useImperativeHandle(ref, () => ({
        startChoosingMode: () => {
            if (!activeTransaction || violated[activeTransaction.id]) return;
            setIsChoosingManualSlot(true);
        },
        cancelChoosingMode: () => setIsChoosingManualSlot(false),
    }), [activeTransaction, violated]);

    const handleSimulateParking = async (clickedSlot) => {
        if (!activeTransaction || violated[activeTransaction.id] || loadingAction) return;

        const currentAllocatedId = activeTransaction.parking_slot_id || activeTransaction.slot?.id;
        const isMismatch = clickedSlot.id !== currentAllocatedId;

        const allocatedCode = slots.find(s => s.id === currentAllocatedId)?.slot_code
            || activeTransaction.slot?.slot_code || '?';

        let confirmMsg = `Konfirmasi parkir di Slot ${clickedSlot.slot_code}?`;
        if (isMismatch) {
            confirmMsg = `🚨 PERINGATAN PELANGGARAN!\n\nSistem mengalokasikan di Slot ${allocatedCode}, tetapi Anda memilih parkir di Slot ${clickedSlot.slot_code}.\n\nLanjutkan?`;
        }

        if (!window.confirm(confirmMsg)) return;

        setLoadingAction(true);
        try {
            await axios.post(`${API_URL}/parking/simulate-sensor`, {
                transaction_id: activeTransaction.id,
                detected_slot_id: clickedSlot.id,
            });

            if (isMismatch) {
                setViolated(prev => ({
                    ...prev,
                    [activeTransaction.id]: {
                        allocatedSlotId: currentAllocatedId,
                        detectedSlotId: clickedSlot.id,
                    },
                }));
                setIsChoosingManualSlot(false);
                setSelectedSlot(clickedSlot);
            }

            if (onRefresh) onRefresh();
        } catch (error) {
            alert('Gagal menyimulasikan sensor: ' + (error.response?.data?.message || 'Error Server'));
        } finally {
            setLoadingAction(false);
        }
    };

    // Unlock otomatis per transaksi: jika slot alokasi lama kembali 'available'
    // berarti staff sudah melakukan override → lepas entri dari violated.
    useEffect(() => {
        const txIds = Object.keys(violated);
        if (!txIds.length) return;

        let changed = false;
        const next = { ...violated };

        for (const txId of txIds) {
            const { allocatedSlotId, detectedSlotId } = violated[txId];
            const allocSlot = slots.find(s => s.id === allocatedSlotId);
            if (!allocSlot || allocSlot.status !== 'available') continue;

            delete next[txId];
            changed = true;

            if (String(activeTransaction?.id) === String(txId) && detectedSlotId) {
                const detSlot = slots.find(s => s.id === detectedSlotId);
                if (detSlot) setSelectedSlot(detSlot);
            }
        }

        if (changed) {
            setViolated(next);
            if (onRefresh) onRefresh();
        }
    }, [slots, violated, activeTransaction?.id, setSelectedSlot, onRefresh]);

    const isCurrentViolated = !!violated[activeTransaction?.id];
    const otherViolationCount = Object.keys(violated).filter(id => String(id) !== String(activeTransaction?.id)).length;

    return (
        <>
            {activeTransaction && (
                <div className="space-y-2 px-5 pt-5" style={{ fontFamily: "'Manrope', sans-serif" }}>

                    {/* ── INFO MODE / TERKUNCI ───────────────────────── */}
                    {isCurrentViolated ? (
                        <div className="bg-rose-50 border border-rose-100 px-4 py-3 rounded-xl flex items-center gap-3">
                            <AlertTriangle size={18} className="text-rose-600 animate-pulse flex-shrink-0" />
                            <div>
                                <p className="text-rose-600 text-[10px] font-black uppercase tracking-widest">MENUNGGU OVERRIDE PETUGAS</p>
                                <p className="text-[#667085] text-xs font-medium mt-0.5">
                                    Kendaraan ini diparkir di slot yang tidak sesuai alokasi. Tap-out terkunci sampai staff melakukan override.
                                </p>
                            </div>
                        </div>
                    ) : isChoosingManualSlot ? (
                        <div className="bg-[#C97A1D]/10 border border-[#C97A1D]/30 px-4 py-3 rounded-xl flex items-center gap-3">
                            <MapPin size={18} className="text-[#C97A1D] flex-shrink-0" />
                            <div className="flex-1">
                                <p className="text-[#C97A1D] text-[10px] font-black uppercase tracking-widest">MODE PILIH SLOT LAIN AKTIF</p>
                                <p className="text-[#667085] text-xs font-medium mt-0.5">
                                    Klik kotak slot kosong mana saja pada denah untuk mensimulasikan pelanggaran lokasi.
                                </p>
                            </div>
                            <button
                                onClick={() => setIsChoosingManualSlot(false)}
                                className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-widest text-[#C97A1D]/70 hover:text-[#C97A1D] transition-colors"
                            >
                                <X size={13} /> Batal
                            </button>
                        </div>
                    ) : (
                        <div className="bg-[#26468A]/10 border border-[#26468A]/30 px-4 py-3 rounded-xl flex items-center gap-3">
                            <CheckCircle size={18} className="text-[#26468A] flex-shrink-0" />
                            <p className="text-[#26468A] text-[10px] font-black uppercase tracking-widest">
                                ALOKASI AKTIF — Gunakan tombol "Pilih Slot Lain" di popup tap-in untuk simulasi pelanggaran.
                            </p>
                        </div>
                    )}

                    {/* ── RINGKASAN PELANGGARAN LAIN ────────────────── */}
                    {otherViolationCount > 0 && (
                        <div className="px-3 py-2 bg-rose-50/60 rounded-lg border border-rose-100">
                            <p className="text-rose-500 text-[10px] font-semibold">
                                ⚠ Ada {otherViolationCount} pelanggaran lain yang masih menunggu override petugas.
                            </p>
                        </div>
                    )}
                </div>
            )}

            <SpatialParkingLayout
                slots={slots}
                candidates={candidates}
                selectedSlot={selectedSlot}
                setSelectedSlot={setSelectedSlot}
                handleTapOut={handleTapOut}
                onRefreshCandidates={onRefresh}
                onRequestManualTapOut={onRequestManualTapOut}
                onSlotClick={(activeTransaction && isChoosingManualSlot && !isCurrentViolated) ? handleSimulateParking : null}
            />
        </>
    );
});

OverrideSlotControl.displayName = 'OverrideSlotControl';

export default OverrideSlotControl;
