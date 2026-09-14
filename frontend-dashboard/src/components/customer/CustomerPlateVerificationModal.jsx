import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { normalizePlate } from '../../utils/plate';
import { X, Scan, CheckCircle, AlertTriangle, RefreshCcw, ShieldCheck, FlaskConical, CameraOff } from 'lucide-react';

const AI_URL = 'http://localhost:8001';
const INTERVAL = 3000;
const NO_DETECT_TIMEOUT = 15000;
const VERIFY_DELAY = 900;
const SUCCESS_DELAY = 1400;

function ConfidenceBar({ score }) {
    if (score == null) return null;
    const pct = Math.round(score);
    return (
        <div className="mt-4">
            <div className="flex justify-between items-center mb-1.5">
                <span className="text-[10px] uppercase tracking-widest font-bold text-[#98A2B3]">Tingkat keyakinan OCR</span>
                <span className="text-xs font-bold text-[#475467]">{pct}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-[#EEF1F5] overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all ${pct >= 70 ? 'bg-emerald-500' : pct >= 40 ? 'bg-[#C97A1D]' : 'bg-rose-500'}`}
                    style={{ width: `${pct}%` }}
                />
            </div>
        </div>
    );
}

const CustomerPlateVerificationModal = ({ isOpen, registeredPlate, onClose, onVerified }) => {
    const [phase, setPhase] = useState('idle'); // idle | scanning | verifying | success | denied | nodetect
    const [detectedPlate, setDetectedPlate] = useState('');
    const [plateScore, setPlateScore] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [showSimulation, setShowSimulation] = useState(false);
    const [simInput, setSimInput] = useState('');
    const [simResult, setSimResult] = useState('');

    const videoRef = useRef(null);
    const streamRef = useRef(null);
    const notifiedRef = useRef(false);
    const registeredNorm = normalizePlate(registeredPlate);

    const startCamera = useCallback(async () => {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            setPhase('nodetect');
            return;
        }
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode: 'user'
                }
            });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            console.error('Gagal akses kamera:', err);
            setPhase('nodetect');
        }
    }, []);

    const stopCamera = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
    }, []);

    const captureAndDetect = useCallback(async () => {
        const video = videoRef.current;
        if (!video || video.readyState < 4) return;

        setIsProcessing(true);
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(async (blob) => {
            const form = new FormData();
            form.append('file', blob, 'frame.jpg');
            try {
                const res = await axios.post(`${AI_URL}/process-frame`, form);
                const data = res.data;
                if (data.detections?.length > 0) {
                    const best = data.detections.reduce((a, b) => (a.score > b.score ? a : b));
                    if (best.plate) {
                        setDetectedPlate(best.plate.toUpperCase());
                        setPlateScore(Math.round((best.score ?? 0) * 100));
                        setPhase('verifying');
                    }
                }
            } catch {
                // Abaikan, terus memindai
            } finally {
                setIsProcessing(false);
            }
        }, 'image/jpeg', 0.92);
    }, []);

    useEffect(() => {
        if (!isOpen) {
            notifiedRef.current = false;
            setPhase('idle');
            setDetectedPlate('');
            setPlateScore(null);
            setIsProcessing(false);
            setShowSimulation(false);
            setSimInput('');
            setSimResult('');
            return;
        }
        setPhase('scanning');
        setDetectedPlate('');
        setPlateScore(null);
        setIsProcessing(false);
        setShowSimulation(false);
        setSimInput('');
        setSimResult('');
        startCamera();
        return () => stopCamera();
    }, [isOpen, startCamera, stopCamera]);

    useEffect(() => {
        if (!isOpen || phase !== 'scanning') return;
        const id = setInterval(captureAndDetect, INTERVAL);
        const noDetectTimer = setTimeout(() => {
            setPhase('nodetect');
        }, NO_DETECT_TIMEOUT);
        return () => {
            clearInterval(id);
            clearTimeout(noDetectTimer);
        };
    }, [isOpen, phase, captureAndDetect]);

    useEffect(() => {
        if (phase !== 'verifying') return;
        const detectedNorm = normalizePlate(detectedPlate);
        const timer = setTimeout(() => {
            if (detectedNorm && registeredNorm && detectedNorm === registeredNorm) {
                setPhase('success');
            } else {
                setPhase('denied');
            }
        }, VERIFY_DELAY);
        return () => clearTimeout(timer);
    }, [phase, detectedPlate, registeredNorm]);

    useEffect(() => {
        if (phase !== 'success' || !isOpen || notifiedRef.current) return;
        const timer = setTimeout(() => {
            notifiedRef.current = true;
            if (onVerified) onVerified(detectedPlate);
        }, SUCCESS_DELAY);
        return () => clearTimeout(timer);
    }, [phase, detectedPlate, onVerified, isOpen]);

    const applySimulation = (value) => {
        const upper = (value || simInput).trim().toUpperCase();
        if (!upper) {
            setSimResult('Masukkan plat untuk simulasi terlebih dahulu.');
            return;
        }
        setDetectedPlate(upper);
        setPlateScore(99);
        setPhase('verifying');
        setSimResult(`Plat simulasi "${upper}" diinjeksikan ke sistem verifikasi.`);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-[#101828]/50 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full max-w-lg bg-white border border-[#E2E6EE] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
                {/* Header */}
                <div className="p-6 border-b border-[#E2E6EE] bg-[#F3F5F9] flex justify-between items-start gap-4">
                    <div>
                        <h3 className="text-xl font-bold text-[#101828] flex items-center gap-2">
                            <ShieldCheck className="text-[#26468A]" size={24} /> Verifikasi Plat Kendaraan
                        </h3>
                        <p className="text-xs text-[#667085] mt-1">
                            Plat terdaftar akun:{' '}
                            <span className="font-mono font-black text-[#101828] tracking-widest">
                                {registeredPlate || 'TIDAK DIKETAHUI'}
                            </span>
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-[#98A2B3] hover:text-[#101828] bg-white hover:bg-[#EEF1F5] p-2 rounded-xl transition-colors border border-[#E2E6EE] cursor-pointer"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-5 overflow-y-auto custom-scrollbar">

                    {/* Zona Kamera */}
                    <div className="rounded-2xl overflow-hidden border border-[#E2E6EE] bg-[#0B1220] relative aspect-video flex items-center justify-center">
                        {phase === 'nodetect' ? (
                            <div className="text-center px-6 flex flex-col items-center gap-3">
                                <div className="w-12 h-12 rounded-2xl bg-white/[0.06] flex items-center justify-center">
                                    <CameraOff size={22} className="text-[#5B6472]" />
                                </div>
                                <div>
                                    <p className="text-[13px] font-semibold text-[#CBD3DE]">Kamera tidak aktif</p>
                                    <p className="text-[12px] text-[#5B6472] mt-1 max-w-[240px] leading-relaxed">
                                        Tidak ada plat terbaca dalam batas waktu. Silakan coba lagi.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <video
                                ref={videoRef}
                                autoPlay
                                muted
                                playsInline
                                className="w-full h-full object-cover"
                            />
                        )}

                        {phase === 'scanning' && (
                            <>
                                <div className="absolute top-4 left-4 flex items-center gap-2">
                                    <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse" />
                                    <span className="bg-red-600/20 backdrop-blur-md text-red-500 text-[10px] font-bold px-3 py-1 rounded-full border border-red-600/30">
                                        AI VERIFICATION ACTIVE
                                    </span>
                                </div>
                                <div className="absolute inset-0 pointer-events-none border-[1px] border-blue-500/20">
                                    <div className="w-full h-[2px] bg-blue-500/40 absolute top-0 animate-scan" />
                                </div>
                            </>
                        )}

                        {phase === 'verifying' && (
                            <div className="absolute inset-0 bg-[#0B1220]/60 backdrop-blur-[2px] flex flex-col items-center justify-center gap-3">
                                <div className="w-12 h-12 border-4 border-[#26468A]/20 border-t-[#26468A] rounded-full animate-spin" />
                                <p className="text-white text-sm font-bold">Memverifikasi plat kendaraan...</p>
                            </div>
                        )}

                        {phase === 'success' && (
                            <div className="absolute inset-0 bg-emerald-600/85 backdrop-blur-[2px] flex flex-col items-center justify-center gap-3 animate-in fade-in zoom-in-95 duration-300">
                                <CheckCircle size={48} className="text-white" />
                                <p className="text-white text-lg font-black tracking-wide">Gerbang Terbuka</p>
                                <p className="text-white/80 text-xs font-medium">Plat sesuai akun. Memproses tap-in...</p>
                            </div>
                        )}

                        {phase === 'denied' && (
                            <div className="absolute inset-0 bg-rose-600/85 backdrop-blur-[2px] flex flex-col items-center justify-center gap-3 p-6 text-center animate-in fade-in zoom-in-95 duration-300">
                                <AlertTriangle size={48} className="text-white" />
                                <p className="text-white text-lg font-black tracking-wide">Gerbang Dikunci</p>
                                <p className="text-white/85 text-xs font-medium leading-relaxed max-w-[340px]">
                                    Plat <span className="font-mono font-black">{detectedPlate || '-'}</span> tidak sesuai
                                    dengan plat terdaftar akun ({registeredPlate}). Silakan tap-in di dashboard utama.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Hasil Deteksi */}
                    {phase === 'scanning' || phase === 'verifying' || phase === 'success' ? (
                        <div>
                            <div className="bg-[#F3F5F9] rounded-2xl px-4 py-4 border border-[#E2E6EE] flex items-center gap-3">
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
                            <ConfidenceBar score={plateScore} />
                        </div>
                    ) : phase === 'denied' || phase === 'nodetect' ? (
                        <div className="flex justify-between items-center bg-[#F3F5F9] rounded-2xl px-4 py-3 border border-[#E2E6EE]">
                            <div>
                                <p className="text-xs font-bold text-[#667085] uppercase tracking-widest">
                                    {phase === 'denied' ? 'Verifikasi Ditolak' : 'Plat Tidak Terdeteksi'}
                                </p>
                                <p className="text-xs text-[#98A2B3] mt-0.5">
                                    {phase === 'denied'
                                        ? 'Kendaraan yang terdeteksi bukan kendaraan terdaftar.'
                                        : 'Sistem tidak menemukan plat dalam batas waktu.'}
                                </p>
                            </div>
                            <RefreshCcw className="text-[#98A2B3]" size={18} />
                        </div>
                    ) : null}

                    {/* Mode Simulasi (Dev) */}
                    <div className="border border-dashed border-[#C1C9D4] rounded-2xl p-4">
                        <button
                            onClick={() => setShowSimulation((prev) => !prev)}
                            className="flex items-center gap-2 text-[#667085] hover:text-[#101828] text-xs font-bold uppercase tracking-widest transition-colors cursor-pointer"
                        >
                            <FlaskConical size={14} className="text-[#C97A1D]" />
                            Mode Simulasi Deteksi (Dev)
                            <span className="text-[#98A2B3]">{showSimulation ? '▲' : '▼'}</span>
                        </button>

                        {showSimulation && (
                            <div className="mt-3 space-y-3">
                                <div className="flex flex-col sm:flex-row gap-2">
                                    <button
                                        onClick={() => applySimulation(registeredPlate)}
                                        className="flex-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 text-xs font-bold px-3 py-2 rounded-lg transition-colors cursor-pointer"
                                    >
                                        ✓ Plat Sesuai Akun
                                    </button>
                                    <button
                                        onClick={() => applySimulation('B 9999 ZZ')}
                                        className="flex-1 bg-rose-100 hover:bg-rose-200 text-rose-700 text-xs font-bold px-3 py-2 rounded-lg transition-colors cursor-pointer"
                                    >
                                        ✗ Plat Lain (Ditolak)
                                    </button>
                                    <button
                                        onClick={() => setPhase('nodetect')}
                                        className="flex-1 bg-[#EEF1F5] hover:bg-[#E2E6EE] text-[#475467] text-xs font-bold px-3 py-2 rounded-lg transition-colors cursor-pointer"
                                    >
                                        ◌ Tidak Terdeteksi
                                    </button>
                                </div>

                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        applySimulation();
                                    }}
                                    className="flex gap-2"
                                >
                                    <input
                                        type="text"
                                        value={simInput}
                                        onChange={(e) => setSimInput(e.target.value.toUpperCase())}
                                        placeholder="Injeksi plat manual: B 1234 CD"
                                        className="flex-1 bg-[#F3F5F9] border border-[#E2E6EE] text-[#101828] font-mono font-bold tracking-widest px-3 py-2 rounded-lg focus:border-[#26468A] focus:outline-none uppercase"
                                    />
                                    <button
                                        type="submit"
                                        className="bg-[#26468A] hover:bg-[#1d3872] text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors cursor-pointer"
                                    >
                                        Terapkan
                                    </button>
                                </form>

                                {simResult && <p className="text-xs text-[#98A2B3]">{simResult}</p>}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-[#E2E6EE] bg-white flex gap-3">
                    {phase === 'scanning' || phase === 'verifying' ? (
                        <>
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 bg-[#EEF1F5] hover:bg-[#E2E6EE] text-[#475467] py-3 rounded-xl font-bold transition-colors text-sm cursor-pointer"
                            >
                                Batal
                            </button>
                            <div className="flex-[2] flex items-center justify-center gap-2 text-[#98A2B3] text-sm font-bold">
                                <RefreshCcw size={15} className="animate-spin" />
                                {phase === 'verifying' ? 'Memverifikasi plat...' : 'Menunggu deteksi plat...'}
                            </div>
                        </>
                    ) : phase === 'denied' || phase === 'nodetect' ? (
                        <button
                            type="button"
                            onClick={onClose}
                            className="w-full bg-[#EEF1F5] hover:bg-[#E2E6EE] text-[#475467] py-3 rounded-xl font-bold transition-colors text-sm cursor-pointer"
                        >
                            Tutup Proses Tap-In
                        </button>
                    ) : (
                        <div className="w-full flex items-center justify-center gap-2 text-emerald-600 text-sm font-bold py-3">
                            <CheckCircle size={18} /> Mensukseskan tap-in, mohon tunggu...
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CustomerPlateVerificationModal;