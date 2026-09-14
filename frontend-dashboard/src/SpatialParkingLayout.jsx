import React, { useState } from 'react';
import { Car, LogOut, ArrowUp, ArrowDown, Activity, RefreshCcw, Calculator, X, LifeBuoy, Lock, AlertTriangle, ShieldAlert } from 'lucide-react';

// 🌟 PERBAIKAN: Tambahkan onRequestManualTapOut pada parameter props
const SpatialParkingLayout = ({ slots, candidates = [], selectedSlot, setSelectedSlot, handleTapOut, onRefreshCandidates, isCustomerView = false, onSlotClick, onRequestManualTapOut, readOnly = false, showDijkstraPanel = false }) => {
    const [showDebug, setShowDebug] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [detailCandidate, setDetailCandidate] = useState(null);
    const [isRequestingHelp, setIsRequestingHelp] = useState(false);

    const SCALE = 16;
    const Y_OFFSET = 3;
    const ROAD_GAP_EXTRA = 2;
    const ROW_SPLIT_Y = 8;
    const CANVAS_WIDTH_M = 55;
    const CANVAS_HEIGHT_M = 21 + ROAD_GAP_EXTRA - Y_OFFSET;
    const SLOT_WIDTH_M = 2.2;
    const SLOT_HEIGHT_M = 4.5;

    const EXITS = [
        { name: 'EXIT 1', x: 24.5, y: 16.5 },
        { name: 'EXIT 2', x: 30.5, y: 16.5 }
    ];

    const getPosition = (x, y) => {
        const safeX = Number(x) || 0;
        const safeY = Number(y) || 0;
        const adjY = (safeY >= ROW_SPLIT_Y ? safeY + ROAD_GAP_EXTRA : safeY) - Y_OFFSET;
        const left = `${(safeX / CANVAS_WIDTH_M) * 100}%`;
        const bottom = `${(adjY / CANVAS_HEIGHT_M) * 100}%`;
        return { left, bottom, position: 'absolute', transform: 'translate(-50%, 0%)' };
    };

    const getSvgCoords = (x, y) => {
        const safeX = Number(x) || 0;
        const safeY = Number(y) || 0;
        const adjY = (safeY >= ROW_SPLIT_Y ? safeY + ROAD_GAP_EXTRA : safeY) - Y_OFFSET;
        const pctX = (safeX / CANVAS_WIDTH_M) * 100;
        const pctY = 100 - ((adjY / CANVAS_HEIGHT_M) * 100); 
        return `${pctX},${pctY}`;
    };

    const handleManualRefresh = async () => {
        setIsRefreshing(true);
        if (onRefreshCandidates) await onRefreshCandidates();
        setTimeout(() => setIsRefreshing(false), 500);
    };

    const handleSlotClick = (slot) => {
        setSelectedSlot(slot);
        
        if (slot.status === 'available' && onSlotClick) {
            onSlotClick(slot);
        }
    };

    // 🌟 BARU: kirim permintaan bantuan petugas untuk slot yang sedang dipilih
    const handleRequestHelp = async () => {
        if (!selectedSlot || !onRequestManualTapOut) return;
        setIsRequestingHelp(true);
        try {
            await onRequestManualTapOut(selectedSlot.id);
        } finally {
            setIsRequestingHelp(false);
        }
    };

    const renderCalculationDetails = (candidate) => {
        const { path_names, path_coords } = candidate;
        if (!path_names || path_names.length < 2) return <p className="text-[#98A2B3] italic">Data rute tidak lengkap atau terputus.</p>;

        let currentDist = 0;
        return (
            <div className="space-y-4">
                {path_names.slice(0, -1).map((uName, i) => {
                    const vName = path_names[i + 1];
                    
                    const u = { x: Number(path_coords[i].x), y: Number(path_coords[i].y) };
                    const v = { x: Number(path_coords[i + 1].x), y: Number(path_coords[i + 1].y) };

                    const dx = Math.abs(v.x - u.x);
                    const dy = Math.abs(v.y - u.y);
                    const w = Math.sqrt(dx * dx + dy * dy);

                    let jenisGerakan = "Bergerak memotong kompas (Diagonal/Miring)";
                    if (dy === 0) jenisGerakan = "Berjalan lurus di pinggir jalan (Horizontal)";
                    else if (dx === 0) jenisGerakan = "Bergerak lurus melintasi jalan/mobil (Vertikal)";

                    const stepView = (
                        <div key={i} className="bg-[#F3F5F9] p-4 rounded-xl border border-[#E2E6EE] font-mono text-[11px] text-[#475467]">
                           <p className="font-bold text-[#101828] mb-2 text-xs bg-white border border-[#E2E6EE] inline-block px-3 py-1 rounded-md">
                               Langkah {i + 1}: {uName} ➔ {vName}
                           </p>
                           <ul className="space-y-1.5 mt-2">
                              <li><span className="text-[#98A2B3]">├─</span> Jenis Gerakan   : <span className="text-[#26468A] font-semibold">{jenisGerakan}</span></li>
                              <li><span className="text-[#98A2B3]">├─</span> Koordinat Titik : {uName}(X:{u.x.toFixed(2)}, Y:{u.y.toFixed(2)}) ➔ {vName}(X:{v.x.toFixed(2)}, Y:{v.y.toFixed(2)})</li>
                              <li><span className="text-[#98A2B3]">├─</span> Selisih Jarak   : ΔX = |{v.x.toFixed(2)} - {u.x.toFixed(2)}| = {dx.toFixed(2)} m, ΔY = |{v.y.toFixed(2)} - {u.y.toFixed(2)}| = {dy.toFixed(2)} m</li>
                              <li><span className="text-[#98A2B3]">├─</span> Rumus Euclidean : w({uName}, {vName}) = √(ΔX² + ΔY²)</li>
                              <li><span className="text-[#98A2B3]">├─</span> Kalkulasi (w)   : √({dx.toFixed(2)}² + {dy.toFixed(2)}²) = √({(dx*dx).toFixed(4)} + {(dy*dy).toFixed(4)}) = <span className="text-emerald-600 font-bold">{w.toFixed(2)} m</span></li>
                              <li><span className="text-[#98A2B3]">├─</span> Rumus Dijkstra  : d[{vName}] = min(d[{vName}], d[{uName}] + w({uName}, {vName}))</li>
                              <li><span className="text-[#98A2B3]">└─</span> Eksekusi        : d[{vName}] = min(d[{vName}], {currentDist.toFixed(2)} + {w.toFixed(2)}) ➔ Rekor: <span className="text-emerald-600 font-bold">{(currentDist + w).toFixed(2)} m</span></li>
                           </ul>
                        </div>
                    );
                    currentDist += w;
                    return stepView;
                })}
                
                <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-center">
                    <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Total Jarak Terpendek Absolut</p>
                    <p className="text-3xl font-black text-[#101828] mt-1">{currentDist.toFixed(2)} <span className="text-sm text-[#667085]">meter</span></p>
                </div>
            </div>
        );
    };

    return (
        <div className="bg-white rounded-[2rem] border border-[#E2E6EE] shadow-sm shadow-black/[0.02] overflow-hidden flex flex-col w-full relative" style={{ fontFamily: "'Manrope', sans-serif" }}>

            {detailCandidate && (
                <div className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-[#101828]/60 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-3xl max-h-full rounded-2xl border border-[#E2E6EE] shadow-xl flex flex-col">
                        <div className="flex items-center justify-between p-5 border-b border-[#E2E6EE]">
                            <div>
                                <h3 className="text-lg font-black text-[#101828] flex items-center gap-2">
                                    <Calculator className="text-[#26468A]" /> Bedah Rute: {detailCandidate.slot_code} ➔ {detailCandidate.nearestExit}
                                </h3>
                                <p className="text-[10px] text-[#98A2B3] mt-1 uppercase tracking-widest">Transkrip Relaksasi Dijkstra</p>
                            </div>
                            <button onClick={() => setDetailCandidate(null)} className="p-2 bg-[#F3F5F9] hover:bg-rose-500 text-[#475467] hover:text-white border border-[#E2E6EE] rounded-lg transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto custom-scrollbar">
                            {renderCalculationDetails(detailCandidate)}
                        </div>
                    </div>
                </div>
            )}

            <div className="p-6 border-b border-[#E2E6EE]">
                <h2 className="text-xl font-bold flex items-center gap-3 tracking-tight text-[#101828]">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#26468A]"></span> Parking Layout
                </h2>
            </div>

            <div className="p-6 overflow-x-auto bg-[#F3F5F9]">
                <div
                    className="relative bg-white border-2 border-dashed border-[#C1C9D4] rounded-2xl mx-auto"
                    style={{ width: `${CANVAS_WIDTH_M * SCALE}px`, height: `${CANVAS_HEIGHT_M * SCALE}px`, minWidth: `${CANVAS_WIDTH_M * SCALE}px` }}
                >
                    <svg className="absolute inset-0 w-full h-full pointer-events-none z-20" preserveAspectRatio="none">
                        {selectedSlot && candidates.find(c => c.id === selectedSlot.id)?.path_coords && (
                            <polyline
                                points={candidates.find(c => c.id === selectedSlot.id)
                                    .path_coords.map(p => getSvgCoords(p.x, p.y)).join(' ')}
                                fill="none" stroke="#10b981" strokeWidth="3" strokeDasharray="8 6" 
                                className="animate-pulse" strokeLinecap="round" strokeLinejoin="round"
                            />
                        )}
                    </svg>

                    <div className="absolute text-[9px] font-bold text-[#98A2B3] uppercase tracking-widest z-10" style={{ left: '2.5%', bottom: `${((11.0 + ROAD_GAP_EXTRA - Y_OFFSET + SLOT_HEIGHT_M + 0.3) / CANVAS_HEIGHT_M) * 100}%` }}>Baris Atas (S1–S21)</div>
                    <div className="absolute text-[9px] font-bold text-[#98A2B3] uppercase tracking-widest z-10" style={{ left: '16%', bottom: `${((5.0 - Y_OFFSET + SLOT_HEIGHT_M + 0.3) / CANVAS_HEIGHT_M) * 100}%` }}>Baris Bawah (S22–S35)</div>

                    <div style={getPosition(EXITS[0].x, EXITS[0].y)} className="flex flex-col items-center z-10">
                        <div className="bg-rose-600 text-white text-[9px] px-3 py-1 font-black tracking-widest rounded-t-md">EXIT</div>
                        <div className="w-6 h-8 bg-[#EEF1F5] rounded-b-sm border-2 border-[#C1C9D4]"></div>
                    </div>
                    <div style={getPosition(EXITS[1].x, EXITS[1].y)} className="flex flex-col items-center z-10">
                        <div className="bg-rose-600 text-white text-[9px] px-3 py-1 font-black tracking-widest rounded-t-md">EXIT</div>
                        <div className="w-6 h-8 bg-[#EEF1F5] rounded-b-sm border-2 border-[#C1C9D4]"></div>
                    </div>

                    <div style={getPosition(5, 5)} className="text-[9px] font-bold text-[#667085] flex flex-col items-center text-center z-10">
                        <ArrowUp size={16} className="text-[#98A2B3] mb-1" /> JALUR MASUK
                    </div>

                    <div style={getPosition(49,5, 5)} className="text-[9px] font-bold text-[#667085] flex flex-col items-center text-center z-10">
                        <ArrowDown size={16} className="text-[#98A2B3] mb-1" /> JALUR NAIK 
                    </div>
                    
                    {slots.map((slot) => {
                        if (slot.x_coord === null || slot.y_coord === null) return null;

                        const isSelected = selectedSlot?.id === slot.id;
                        let statusStyles = 'border-emerald-300 bg-emerald-50 text-emerald-600 hover:border-emerald-400';

                        if (slot.status === 'occupied') {
                            statusStyles = 'border-rose-300 bg-rose-50 text-rose-600';
                        } else if (slot.status === 'maintenance') {
                            statusStyles = 'border-[#C97A1D]/40 bg-[#C97A1D]/10 text-[#C97A1D]';
                        } else if (slot.status === 'violation') {
                            statusStyles = 'border-rose-500 bg-rose-100 text-rose-700 ring-2 ring-rose-500 animate-pulse';
                        }

                        const isTopCandidate = candidates.length > 0 && candidates[0].id === slot.id;
                        if (!selectedSlot && isTopCandidate && slot.status === 'available') {
                            statusStyles = 'border-[#26468A] bg-[#26468A]/10 text-[#26468A] ring-2 ring-[#26468A]/40 shadow-[0_0_15px_rgba(38,70,138,0.25)]';
                        }

                        const isClickableSimulation = slot.status === 'available' && onSlotClick;

                        return (
                            <div
                                key={slot.id}
                                onClick={() => handleSlotClick(slot)}
                                style={{ ...getPosition(slot.x_coord, slot.y_coord), width: `${SLOT_WIDTH_M * SCALE}px`, height: `${SLOT_HEIGHT_M * SCALE}px` }}
                                className={`
                                    flex flex-col items-center justify-center border-2 rounded-md transition-all z-30 relative
                                    ${statusStyles} 
                                    ${isSelected ? 'ring-4 ring-emerald-400/40 border-emerald-400 shadow-lg shadow-emerald-500/10 scale-110' : ''} 
                                    ${isClickableSimulation ? 'cursor-pointer hover:ring-4 hover:ring-[#26468A]/30 transform hover:scale-105 shadow-lg' : 'cursor-pointer'}
                                `}
                            >
                                {(slot.status === 'occupied' && slot.active_manual_count > 0) && (
                                    <span className="absolute -top-1.5 -right-1.5 p-1 bg-[#C97A1D] rounded-full shadow z-40" title="Wajib verifikasi manual">
                                        <ShieldAlert size={11} className="text-white" />
                                    </span>
                                )}
                                <span className={`text-[11px] font-black ${(slot.status === 'occupied' || slot.status === 'violation') ? 'mb-0.5' : ''}`}>{slot.slot_code.replace('S', '')}</span>
                                {(slot.status === 'occupied' || slot.status === 'violation') && <Car size={18} strokeWidth={2.5} />}
                            </div>
                        );
                    })}
                </div>
            </div>

            {!isCustomerView && showDijkstraPanel && (
            <div className="p-4 bg-[#F3F5F9] border-t border-[#E2E6EE]">
                <button type="button" onClick={() => setShowDebug(!showDebug)} className="flex items-center gap-2 text-[11px] font-bold text-[#475467] hover:text-[#26468A] transition-colors uppercase tracking-widest">
                    <Activity size={14} /> {showDebug ? 'Sembunyikan Panel Kalkulasi Dijkstra' : 'Tampilkan Kalkulasi & Daftar Kandidat (SSOT)'}
                </button>

                {showDebug && (
                    <div className="mt-4 bg-[#F3F5F9] p-5 rounded-2xl border border-[#E2E6EE]">
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                            <div>
                                <h3 className="text-xs font-black text-[#101828] mb-2 uppercase tracking-widest">Daftar Kandidat & Relaksasi Dijkstra</h3>
                                <p className="text-[11px] text-[#667085] font-medium leading-relaxed max-w-xl">
                                    Algoritma mengevaluasi <strong className="text-emerald-600">{candidates.length} slot available</strong>. 
                                    Menampilkan rute aktual Dijkstra (Edges) tanpa Euclidean palsu.
                                </p>
                            </div>
                            <button onClick={handleManualRefresh} disabled={isRefreshing} className="flex items-center gap-2 bg-white hover:bg-[#26468A] text-[#475467] hover:text-white px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest border border-[#E2E6EE] hover:border-[#26468A] transition-all disabled:opacity-50">
                                <RefreshCcw size={14} className={isRefreshing ? 'animate-spin text-[#26468A]' : ''} /> Sinkronisasi Backend
                            </button>
                        </div>

                        <div className="overflow-x-auto overflow-y-auto max-h-72 border border-[#E2E6EE] rounded-xl rounded-t-none custom-scrollbar">
                            <table className="w-full text-left text-[11px]">
                                <thead className="bg-white sticky top-0 z-10 border-b border-[#E2E6EE]">
                                    <tr className="text-[#667085]">
                                        <th className="py-3 px-3 font-bold">Rank</th>
                                        <th className="py-3 px-3 font-bold">Slot</th>
                                        <th className="py-3 px-3 font-bold">Rute Pejalan Kaki (Dijkstra)</th>
                                        <th className="py-3 px-3 font-bold text-emerald-600">Total Jarak</th>
                                        <th className="py-3 px-3 font-bold text-center">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {candidates.map((c, i) => (
                                        <tr key={c.id} className="border-b border-[#E2E6EE] hover:bg-[#26468A]/[0.04] transition-colors">
                                            <td className="py-3 px-3 font-black">{i === 0 ? <span className="text-[#26468A] text-[12px]">🏆 #1</span> : `#${i + 1}`}</td>
                                            <td className="py-3 px-3 font-bold text-[#101828]">{c.slot_code}</td>
                                            <td className="py-3 px-3 font-mono text-[9px] text-[#667085] max-w-xs truncate" title={c.path_names?.join(' ➔ ')}>
                                                {c.path_names?.length > 0 ? c.path_names.join(' ➔ ') : <span className="text-rose-600 italic">Jalur Terputus</span>}
                                            </td>
                                            <td className="py-3 px-3 font-black text-emerald-600">{c.minDistance?.toFixed(3)} m </td>
                                            <td className="py-3 px-3 text-center">
                                                <button 
                                                    onClick={() => setDetailCandidate(c)}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#26468A]/10 hover:bg-[#26468A] border border-[#26468A]/40 hover:border-[#26468A] text-[#26468A] hover:text-white rounded-lg transition-all font-bold tracking-wide"
                                                >
                                                    <Calculator size={12} /> Detail
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {candidates.length === 0 && (
                                        <tr>
                                            <td colSpan="5" className="py-8 text-center text-[#98A2B3] italic">Area parkir penuh. Tidak ada kandidat tersedia.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
            )}

            {!isCustomerView && !readOnly && (
            <div className="p-6 bg-white border-t border-[#E2E6EE] mt-auto">
                {selectedSlot && selectedSlot.status === 'violation' ? (
                    <div className="bg-[#F3F5F9] p-4 rounded-2xl border border-rose-200 space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-rose-50 rounded-xl">
                                <Lock size={20} className="text-rose-600" />
                            </div>
                            <div>
                                <p className="text-[10px] text-[#98A2B3] font-bold uppercase tracking-widest">Slot Terpilih</p>
                                <p className="text-2xl font-black text-[#101828]">{selectedSlot.slot_code}</p>
                            </div>
                        </div>
                        <div className="bg-rose-50 border border-rose-100 rounded-xl p-3">
                            <p className="text-xs text-rose-600 font-bold flex items-center gap-2">
                                <AlertTriangle size={14} /> Slot Terkunci — Menunggu Override Petugas
                            </p>
                            <p className="text-[11px] text-[#667085] mt-1">Slot ini dalam status pelanggaran. Tidak dapat dilakukan tap-out sampai petugas melakukan override.</p>
                        </div>
                    </div>
                ) : selectedSlot && selectedSlot.status === 'occupied' && selectedSlot.active_violation_count > 0 ? (
                    <div className="bg-[#F3F5F9] p-4 rounded-2xl border border-[#C97A1D]/30 space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-[#C97A1D]/10 rounded-xl">
                                <Lock size={20} className="text-[#C97A1D]" />
                            </div>
                            <div>
                                <p className="text-[10px] text-[#98A2B3] font-bold uppercase tracking-widest">Slot Terpilih</p>
                                <p className="text-2xl font-black text-[#101828]">{selectedSlot.slot_code}</p>
                            </div>
                        </div>
                        <div className="bg-[#C97A1D]/10 border border-[#C97A1D]/20 rounded-xl p-3">
                            <p className="text-xs text-[#C97A1D] font-bold flex items-center gap-2">
                                <AlertTriangle size={14} /> Transaksi Terkunci — Menunggu Override Petugas
                            </p>
                            <p className="text-[11px] text-[#667085] mt-1">Kendaraan di slot ini dalam status pelanggaran. Tidak dapat dilakukan tap-out sampai petugas melakukan override.</p>
                        </div>
                    </div>
                ) : selectedSlot && selectedSlot.status === 'occupied' && selectedSlot.active_manual_count > 0 ? (
                    <div className="bg-[#F3F5F9] p-4 rounded-2xl border border-[#C97A1D]/30 space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-[#C97A1D]/10 rounded-xl">
                                <AlertTriangle size={20} className="text-[#C97A1D]" />
                            </div>
                            <div>
                                <p className="text-[10px] text-[#98A2B3] font-bold uppercase tracking-widest">Slot Terpilih</p>
                                <p className="text-2xl font-black text-[#101828]">{selectedSlot.slot_code}</p>
                            </div>
                        </div>
                        <button
                            onClick={handleRequestHelp}
                            disabled={isRequestingHelp}
                            className="w-full bg-[#C97A1D] hover:bg-[#b06a17] px-6 py-3 rounded-xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#C97A1D]/20 disabled:opacity-50"
                        >
                            <LogOut size={16} /> {isRequestingHelp ? 'MENGIRIM...' : 'WAJIB TAP-OUT MANUAL'}
                        </button>
                        <div className="bg-[#C97A1D]/10 border border-[#C97A1D]/20 rounded-xl p-3">
                            <p className="text-xs text-[#C97A1D] font-bold flex items-center gap-2">
                                <AlertTriangle size={14} /> Plat Tidak Terdeteksi Saat Masuk
                            </p>
                            <p className="text-[11px] text-[#667085] mt-1">Kendaraan ini masuk tanpa plat terbaca. Tap-out hanya dapat diproses petugas melalui verifikasi manual.</p>
                        </div>
                    </div>
                ) : selectedSlot && selectedSlot.status === 'occupied' ? (
                    <div className="bg-[#F3F5F9] p-4 rounded-2xl border border-[#E2E6EE] space-y-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[10px] text-[#98A2B3] font-bold uppercase tracking-widest">Slot Terpilih</p>
                                <p className="text-2xl font-black text-[#101828]">{selectedSlot.slot_code}</p>
                            </div>
                            <button onClick={() => handleTapOut(selectedSlot.id)} className="bg-rose-600 hover:bg-rose-500 px-6 py-3 rounded-xl font-black text-sm uppercase tracking-widest flex items-center gap-2 transition-all shadow-lg shadow-rose-600/20">
                                <LogOut size={16} /> Proses Keluar
                            </button>
                        </div>

                        {onRequestManualTapOut && (
                            <button
                                onClick={handleRequestHelp}
                                disabled={isRequestingHelp}
                                className="w-full py-2 rounded-xl text-[11px] font-bold uppercase tracking-widest text-[#C97A1D]/80 hover:text-[#C97A1D] hover:bg-[#C97A1D]/5 border border-transparent hover:border-[#C97A1D]/20 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                            >
                                <LifeBuoy size={13} /> {isRequestingHelp ? 'Mengirim...' : 'Butuh Bantuan Petugas (Plat Tidak Terbaca)'}
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="text-center p-4 border-2 border-dashed border-[#C1C9D4] rounded-xl bg-[#F3F5F9]">
                        <p className="text-xs text-[#667085] font-medium">Klik pada slot yang terisi (merah) di denah untuk memproses kendaraan keluar.</p>
                    </div>
                )}
            </div>
            )}
        </div>
    );
};

export default SpatialParkingLayout;