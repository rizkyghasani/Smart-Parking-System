import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { RefreshCcw, Eye } from 'lucide-react';
import SpatialParkingLayout from '../../SpatialParkingLayout';

const API_URL = 'http://localhost:8000/api';

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

    useEffect(() => { fetchOverview(); }, [fetchOverview]);

    const handleTapOutDisabled = () => {
        console.warn('Tap-out dinonaktifkan: panel ini hanya untuk pemantauan admin.');
    };

    return (
        <div className="p-6 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-start gap-3.5">
                    <div className="p-2.5 rounded-xl bg-[#26468A] text-white shrink-0">
                        <Eye size={20} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-[#101828]">Pemantauan Denah Parkir</h3>
                        <p className="text-sm text-[#667085] mt-0.5">
                            Mode lihat saja — status slot real-time & analisis rekomendasi Dijkstra.
                            Aksi tap-out hanya dapat dilakukan dari gerbang atau dashboard petugas.
                        </p>
                    </div>
                </div>

                <button
                    onClick={fetchOverview}
                    disabled={loading}
                    className="flex items-center gap-2 bg-[#EEF1F5] hover:bg-[#E2E6EE] text-[#475467] px-3 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-60 shrink-0"
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
