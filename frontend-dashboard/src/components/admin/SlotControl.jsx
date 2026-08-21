import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
    Waypoints, ParkingSquare, DoorOpen, Plus, Pencil, Trash2, X,
    CheckCircle2, AlertTriangle, Wrench, Car, Loader2,
} from 'lucide-react';

const SlotControl = () => {
    const [slots, setSlots] = useState([]);
    const [loading, setLoading] = useState(true);

    const [message, setMessage] = useState({
        type: '',
        text: ''
    });

    const [inputType, setInputType] = useState('slot');
    const [saving, setSaving] = useState(false);
    const [updatingId, setUpdatingId] = useState(null);

    const [formData, setFormData] = useState({
        slot_code: '',
        gate_name: '',
        x_coord: '',
        y_coord: ''
    });

    // state filter status slot
    const [filterStatus, setFilterStatus] = useState('all');

    const sortedSlots = [...slots].sort((a, b) =>
        a.slot_code.localeCompare(b.slot_code, undefined, { numeric: true })
    );

    // hasil setelah difilter, dipakai untuk render tabel
    const filteredSlots = filterStatus === 'all'
        ? sortedSlots
        : sortedSlots.filter((slot) => slot.status === filterStatus);

    const [editMode, setEditMode] = useState(false);
    const [selectedSlotId, setSelectedSlotId] = useState(null);

    const token = localStorage.getItem('admin_token');

    const api = axios.create({
        baseURL: 'http://localhost:8000/api/admin',
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json'
        }
    });

    useEffect(() => {
        loadSlots();
    }, []);

    const showMessage = (type, text) => {
        setMessage({ type, text });
        setTimeout(() => {
            setMessage({ type: '', text: '' });
        }, 4000);
    };

    const loadSlots = async () => {
        try {
            setLoading(true);
            const res = await api.get('/slots');
            setSlots(res.data.data || []);
        } catch (error) {
            console.error(error);
            showMessage('error', 'Gagal memuat data slot parkir.');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            slot_code: '',
            gate_name: '',
            x_coord: '',
            y_coord: ''
        });
        setEditMode(false);
        setSelectedSlotId(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);

            if (inputType === 'exit') {
                await api.post('/exits', {
                    name: formData.gate_name,
                    x_coord: formData.x_coord,
                    y_coord: formData.y_coord
                });
                showMessage('success', 'Pintu Exit berhasil ditambahkan & terhubung ke sistem graf.');
            } else {
                if (editMode) {
                    await api.put(`/slots/${selectedSlotId}`, formData);
                    showMessage('success', 'Slot berhasil diperbarui.');
                } else {
                    await api.post('/slots', formData);
                    showMessage('success', 'Slot baru berhasil ditambahkan.');
                }
            }

            resetForm();
            loadSlots();
        } catch (error) {
            showMessage('error', error.response?.data?.message || 'Gagal menyimpan data.');
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (slot) => {
        setEditMode(true);
        setSelectedSlotId(slot.id);
        setInputType('slot');
        setFormData({
            slot_code: slot.slot_code,
            gate_name: '',
            x_coord: slot.x_coord ?? '',
            y_coord: slot.y_coord ?? ''
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (slot) => {
        const confirmDelete = window.confirm(
            `Hapus slot ${slot.slot_code}? (Titik graf & jalur terkait akan ikut terhapus otomatis)`
        );
        if (!confirmDelete) return;

        try {
            await api.delete(`/slots/${slot.id}`);
            showMessage('success', 'Slot beserta graf jalurnya berhasil dihapus.');
            loadSlots();
        } catch (error) {
            console.error(error);
            showMessage('error', error.response?.data?.message || 'Gagal menghapus slot.');
        }
    };

    const updateStatus = async (slotId, status) => {
        try {
            setUpdatingId(slotId);
            await api.patch(`/slots/${slotId}/status`, { status });
            showMessage('success', 'Status slot berhasil diperbarui.');
            loadSlots();
        } catch (error) {
            console.error(error);
            showMessage('error', 'Gagal memperbarui status slot.');
        } finally {
            setUpdatingId(null);
        }
    };

    const countAvailable = slots.filter((slot) => slot.status === 'available').length;
    const countOccupied = slots.filter((slot) => slot.status === 'occupied').length;
    const countMaintenance = slots.filter((slot) => slot.status === 'maintenance').length;
    const countViolation = slots.filter((slot) => slot.status === 'violation').length;

    // daftar filter, masing-masing dengan warna aksen & jumlah dinamis
    const filterOptions = [
        { key: 'all', label: 'Semua', count: slots.length, dot: 'bg-gray-300' },
        { key: 'available', label: 'Available', count: countAvailable, dot: 'bg-emerald-400' },
        { key: 'occupied', label: 'Occupied', count: countOccupied, dot: 'bg-amber-400' },
        { key: 'maintenance', label: 'Maintenance', count: countMaintenance, dot: 'bg-rose-400' },
        ...(countViolation > 0 ? [{ key: 'violation', label: 'Violation', count: countViolation, dot: 'bg-rose-500' }] : [])
    ];

    // 🌟 BARU (visual saja): kartu ringkasan sekarang derived dari data yang sama,
    // termasuk kartu Violation yang sebelumnya terlewat dari grid summary.
    const summaryCards = [
        { key: 'total', label: 'Total Slot', count: slots.length, icon: Waypoints, tone: 'text-gray-500 bg-gray-100' },
        { key: 'available', label: 'Available', count: countAvailable, icon: CheckCircle2, tone: 'text-emerald-600 bg-emerald-50' },
        { key: 'occupied', label: 'Occupied', count: countOccupied, icon: Car, tone: 'text-amber-600 bg-amber-50' },
        { key: 'maintenance', label: 'Maintenance', count: countMaintenance, icon: Wrench, tone: 'text-rose-600 bg-rose-50' },
        ...(countViolation > 0 ? [{ key: 'violation', label: 'Violation', count: countViolation, icon: AlertTriangle, tone: 'text-rose-700 bg-rose-100' }] : []),
    ];

    const getStatusBadge = (status) => {
        switch (status) {
            case 'available':
                return (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Available
                    </span>
                );
            case 'occupied':
                return (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> Occupied
                    </span>
                );
            case 'maintenance':
                return (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-rose-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400" /> Maintenance
                    </span>
                );
            case 'violation':
                return (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-rose-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" /> Violation
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-300" /> Unknown
                    </span>
                );
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center gap-3 p-16 text-gray-400">
                <Loader2 size={22} className="animate-spin text-gray-400" />
                <p className="text-sm">Memuat data slot parkir & topologi graf...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-6xl mx-auto">

            {/* HEADER */}
            <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-gray-900 text-white shrink-0">
                    <Waypoints size={20} />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-gray-800">
                        Slot Management &amp; Spatial Graph
                    </h3>
                    <p className="text-sm text-gray-500 mt-0.5">
                        Kelola master slot parkir beserta koordinat fisik X &amp; Y untuk komputasi algoritma Dijkstra.
                    </p>
                </div>
            </div>

            {/* ALERT */}
            {message.text && (
                <div className={`px-4 py-3 rounded-xl text-sm font-medium border flex items-center gap-2.5 transition-all ${
                    message.type === 'success'
                        ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
                        : 'bg-rose-50 border-rose-100 text-rose-700'
                }`}>
                    {message.type === 'success'
                        ? <CheckCircle2 size={16} className="shrink-0" />
                        : <AlertTriangle size={16} className="shrink-0" />}
                    {message.text}
                </div>
            )}

            {/* SUMMARY — kartu setara lebar, otomatis wrap rapi termasuk saat Violation muncul */}
            <div className="flex flex-wrap gap-4">
                {summaryCards.map(({ key, label, count, icon: Icon, tone }) => (
                    <div
                        key={key}
                        className="flex-1 min-w-[150px] bg-white border border-gray-200 rounded-2xl p-5 shadow-sm"
                    >
                        <div className={`inline-flex items-center justify-center w-8 h-8 rounded-lg mb-3 ${tone}`}>
                            <Icon size={16} strokeWidth={2.25} />
                        </div>
                        <p className="text-xs font-medium text-gray-400">{label}</p>
                        <h4 className="text-2xl font-bold text-gray-800 mt-1">{count}</h4>
                    </div>
                ))}
            </div>

            {/* FORM */}
            <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <div className="flex justify-between items-center mb-5 pb-4 border-b border-gray-100">
                    <h4 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                        {editMode ? <Pencil size={15} className="text-gray-400" /> : <Plus size={15} className="text-gray-400" />}
                        {editMode ? 'Edit Koordinat Slot' : 'Tambah Slot Baru & Auto-Graph'}
                    </h4>

                    {editMode && (
                        <button
                            type="button"
                            onClick={resetForm}
                            className="flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700 transition-colors"
                        >
                            <X size={13} /> Batal Edit
                        </button>
                    )}
                </div>

                {!editMode && (
                    <div className="flex gap-3 mb-5">
                        <button
                            type="button"
                            onClick={() => setInputType('slot')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                                inputType === 'slot'
                                    ? 'bg-gray-900 text-white border-gray-900'
                                    : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                            }`}
                        >
                            <ParkingSquare size={15} /> Slot Parkir
                        </button>
                        <button
                            type="button"
                            onClick={() => setInputType('exit')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                                inputType === 'exit'
                                    ? 'bg-gray-900 text-white border-gray-900'
                                    : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                            }`}
                        >
                            <DoorOpen size={15} /> Gerbang Exit
                        </button>
                    </div>
                )}

                <div className="grid md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-2">
                            {inputType === 'slot' ? 'Kode Slot' : 'Nama Gerbang Exit'}
                        </label>
                        <input
                            type="text"
                            required
                            value={inputType === 'slot' ? formData.slot_code : formData.gate_name}
                            onChange={(e) => setFormData({
                                ...formData,
                                [inputType === 'slot' ? 'slot_code' : 'gate_name']: e.target.value.toUpperCase()
                            })}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-800/10 focus:border-gray-400 focus:bg-white transition-colors"
                            placeholder={inputType === 'slot' ? 'Contoh: S36' : 'Contoh: EXIT_UTAMA'}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-2">
                            Koordinat X (Meter)
                        </label>
                        <input
                            type="number"
                            step="any"
                            required
                            value={formData.x_coord}
                            onChange={(e) => setFormData({ ...formData, x_coord: e.target.value })}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-800/10 focus:border-gray-400 focus:bg-white transition-colors"
                            placeholder="Contoh: 38.75"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-2">
                            Koordinat Y (Meter)
                        </label>
                        <input
                            type="number"
                            step="any"
                            required
                            value={formData.y_coord}
                            onChange={(e) => setFormData({ ...formData, y_coord: e.target.value })}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-800/10 focus:border-gray-400 focus:bg-white transition-colors"
                            placeholder="Contoh: 6.00"
                        />
                    </div>
                </div>

                <div className="flex justify-end mt-5">
                    <button
                        type="submit"
                        disabled={saving}
                        className="flex items-center gap-2 bg-gray-800 hover:bg-gray-900 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
                    >
                        {saving
                            ? <><Loader2 size={15} className="animate-spin" /> Menyimpan...</>
                            : editMode
                                ? <><Pencil size={15} /> Update Slot &amp; Posisi</>
                                : <><Plus size={15} /> Tambah Slot &amp; Generate Graf</>}
                    </button>
                </div>
            </form>

            {/* TABLE */}
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="p-5 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h4 className="text-sm font-bold text-gray-800">Daftar Master Slot & Posisi Spasial</h4>
                        <p className="text-xs text-gray-400 mt-0.5">
                            Menampilkan {filteredSlots.length} dari {slots.length} slot
                        </p>
                    </div>

                    {/* Filter pill status */}
                    <div className="flex flex-wrap items-center gap-2">
                        {filterOptions.map((opt) => (
                            <button
                                key={opt.key}
                                onClick={() => setFilterStatus(opt.key)}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                                    filterStatus === opt.key
                                        ? 'bg-gray-900 text-white border-gray-900'
                                        : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                                }`}
                            >
                                <span className={`w-1.5 h-1.5 rounded-full ${filterStatus === opt.key ? 'bg-white' : opt.dot}`} />
                                {opt.label}
                                <span className={filterStatus === opt.key ? 'text-gray-300' : 'text-gray-400'}>
                                    {opt.count}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* area tabel scrollable dengan header sticky */}
                <div className="overflow-x-auto overflow-y-auto max-h-[520px] custom-scrollbar">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 sticky top-0 z-10">
                            <tr className="text-gray-500 text-xs font-semibold uppercase tracking-wide border-b border-gray-200">
                                <th className="px-6 py-3.5 bg-gray-50">Slot</th>
                                <th className="px-6 py-3.5 bg-gray-50">Koordinat X</th>
                                <th className="px-6 py-3.5 bg-gray-50">Koordinat Y</th>
                                <th className="px-6 py-3.5 bg-gray-50">Status</th>
                                <th className="px-6 py-3.5 bg-gray-50">Ubah Status</th>
                                <th className="px-6 py-3.5 bg-gray-50 text-right">Aksi</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-100">
                            {filteredSlots.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-14 text-center text-gray-400 text-sm">
                                        {slots.length === 0
                                            ? 'Belum ada slot parkir yang terdaftar. Silakan tambahkan melalui form di atas.'
                                            : 'Tidak ada slot dengan status ini.'}
                                    </td>
                                </tr>
                            ) : (
                                filteredSlots.map((slot) => (
                                    <tr key={slot.id} className="hover:bg-gray-50/70 transition-colors">
                                        <td className="px-6 py-4 font-semibold text-gray-800">
                                            {slot.slot_code}
                                        </td>

                                        <td className="px-6 py-4 text-gray-500 tabular-nums">
                                            {slot.x_coord ?? '-'} m
                                        </td>

                                        <td className="px-6 py-4 text-gray-500 tabular-nums">
                                            {slot.y_coord ?? '-'} m
                                        </td>

                                        <td className="px-6 py-4">
                                            {getStatusBadge(slot.status)}
                                        </td>

                                        <td className="px-6 py-4">
                                            <select
                                                value={slot.status}
                                                disabled={updatingId === slot.id}
                                                onChange={(e) => updateStatus(slot.id, e.target.value)}
                                                className="border border-gray-200 rounded-lg px-3 py-2 text-xs bg-gray-50 text-gray-700 focus:outline-none focus:border-gray-400 disabled:opacity-50"
                                            >
                                                <option value="available">Available</option>
                                                <option value="occupied">Occupied</option>
                                                <option value="maintenance">Maintenance</option>
                                            </select>
                                        </td>

                                        <td className="px-6 py-4 text-right whitespace-nowrap">
                                            <div className="inline-flex items-center gap-2">
                                                <button
                                                    onClick={() => handleEdit(slot)}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-gray-800 text-xs font-medium border border-gray-200 transition-colors"
                                                >
                                                    <Pencil size={12} /> Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(slot)}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-700 text-xs font-medium border border-rose-100 transition-colors"
                                                >
                                                    <Trash2 size={12} /> Hapus
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default SlotControl;