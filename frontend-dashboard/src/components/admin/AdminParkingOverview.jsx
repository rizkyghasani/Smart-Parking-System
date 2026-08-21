import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { RefreshCcw, Eye } from 'lucide-react';
import SpatialParkingLayout from '../../SpatialParkingLayout';

const API_URL = 'http://localhost:8000/api';

/**
 * 🌟 BARU: Panel admin untuk MELIHAT SAJA denah parkir & status slot.
 * - Tidak ada kemampuan tap-out (handleTapOut sengaja no-op).
 * - Tetap menampilkan panel kalkulasi Dijkstra (candidates) untuk transparansi
 *   ke admin, kenapa slot tertentu direkomendasikan sistem.
 * - Data diambil dari endpoint yang sama dengan halaman gerbang (/parking/slots),
 *   supaya status & rekomendasi yang admin lihat selalu sinkron dengan kondisi nyata.
 */
const AdminParkingOverview = () => {
    const [slots, setSlots] = useState([]);
    const [candidates, setCandidates] = useState([]);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [loading, setLoading] = useState(true);

    const token = localStorage.getItem('admin_token');

    const fetchOverview = useCallback(async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/parking/slots`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setSlots(res.data.data || []);
            setCandidates(res.data.candidates || []);
        } catch (error) {
            console.error('Gagal memuat denah parkir untuk admin.', error);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchOverview();
    }, [fetchOverview]);

    // 🌟 Sengaja no-op: admin tidak diizinkan memproses tap-out dari panel ini.
    // Kalau SpatialParkingLayout belum mendukung prop `readOnly` (lihat patch di
    // bawah), fungsi ini setidaknya mencegah aksi apa pun benar-benar terjadi
    // meski tombolnya masih kelihatan.
    const handleTapOutDisabled = () => {
        console.warn('Tap-out dinonaktifkan: panel ini hanya untuk pemantauan admin.');
    };

    return (
        <div className="p-6 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-start gap-3.5">
                    <div className="p-2.5 rounded-xl bg-slate-900 text-white shrink-0">
                        <Eye size={20} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-gray-800">Pemantauan Denah Parkir</h3>
                        <p className="text-sm text-gray-500 mt-0.5">
                            Mode lihat saja — status slot real-time & analisis rekomendasi Dijkstra.
                            Aksi tap-out hanya dapat dilakukan dari gerbang atau dashboard petugas.
                        </p>
                    </div>
                </div>

                <button
                    onClick={fetchOverview}
                    disabled={loading}
                    className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-60 shrink-0"
                >
                    <RefreshCcw size={13} className={loading ? 'animate-spin' : ''} />
                    {loading ? 'Memuat...' : 'Refresh Data'}
                </button>
            </div>

            <SpatialParkingLayout
                slots={slots}
                candidates={candidates}
                selectedSlot={selectedSlot}
                setSelectedSlot={setSelectedSlot}
                handleTapOut={handleTapOutDisabled}
                onRefreshCandidates={fetchOverview}
                onRequestManualTapOut={undefined}
                readOnly={true}
                showDijkstraPanel
            />
        </div>
    );
};

export default AdminParkingOverview;