import React, { useEffect, useState } from 'react';
import axios from 'axios';

const SlotControl = () => {
    const [slots, setSlots] = useState([]);
    const [loading, setLoading] = useState(true);

    const [message, setMessage] = useState({
        type: '',
        text: ''
    });

    const [saving, setSaving] = useState(false);
    const [updatingId, setUpdatingId] = useState(null);

    const [formData, setFormData] = useState({
        slot_code: '',
        priority_weight: ''
    });

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
            setMessage({
                type: '',
                text: ''
            });
        }, 4000);
    };

    const loadSlots = async () => {
        try {
            setLoading(true);

            const res = await api.get('/slots');

            setSlots(res.data.data || []);
        } catch (error) {
            console.error(error);

            showMessage(
                'error',
                '❌ Gagal memuat data slot parkir.'
            );
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            slot_code: '',
            priority_weight: ''
        });

        setEditMode(false);
        setSelectedSlotId(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setSaving(true);

            if (editMode) {
                await api.put(`/slots/${selectedSlotId}`, formData);

                showMessage(
                    'success',
                    '✅ Slot berhasil diperbarui.'
                );
            } else {
                await api.post('/slots', formData);

                showMessage(
                    'success',
                    '✅ Slot baru berhasil ditambahkan.'
                );
            }

            resetForm();
            loadSlots();
        } catch (error) {
            console.error(error);

            const msg =
                error.response?.data?.message ||
                '❌ Terjadi kesalahan saat menyimpan data.';

            showMessage('error', msg);
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (slot) => {
        setEditMode(true);

        setSelectedSlotId(slot.id);

        setFormData({
            slot_code: slot.slot_code,
            priority_weight: slot.priority_weight
        });

        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    const handleDelete = async (slot) => {
        const confirmDelete = window.confirm(
            `Hapus slot ${slot.slot_code}?`
        );

        if (!confirmDelete) return;

        try {
            await api.delete(`/slots/${slot.id}`);

            showMessage(
                'success',
                '🗑️ Slot berhasil dihapus.'
            );

            loadSlots();
        } catch (error) {
            console.error(error);

            showMessage(
                'error',
                error.response?.data?.message ||
                    '❌ Gagal menghapus slot.'
            );
        }
    };

    const updateStatus = async (slotId, status) => {
        try {
            setUpdatingId(slotId);

            await api.patch(`/slots/${slotId}/status`, {
                status
            });

            showMessage(
                'success',
                '✅ Status slot berhasil diperbarui.'
            );

            loadSlots();
        } catch (error) {
            console.error(error);

            showMessage(
                'error',
                '❌ Gagal memperbarui status slot.'
            );
        } finally {
            setUpdatingId(null);
        }
    };

    const countAvailable =
        slots.filter(
            (slot) => slot.status === 'available'
        ).length;

    const countOccupied =
        slots.filter(
            (slot) => slot.status === 'occupied'
        ).length;

    const countMaintenance =
        slots.filter(
            (slot) => slot.status === 'maintenance'
        ).length;

    const getStatusBadge = (status) => {
        switch (status) {
            case 'available':
                return (
                    <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[11px] font-bold">
                        Available
                    </span>
                );

            case 'occupied':
                return (
                    <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-[11px] font-bold">
                        Occupied
                    </span>
                );

            case 'maintenance':
                return (
                    <span className="bg-rose-100 text-rose-700 px-3 py-1 rounded-full text-[11px] font-bold">
                        Maintenance
                    </span>
                );

            default:
                return (
                    <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-[11px] font-bold">
                        Unknown
                    </span>
                );
        }
    };

    if (loading) {
        return (
            <div className="p-8 text-center text-gray-500 font-medium">
                ⏳ Memuat data slot parkir...
            </div>
        );
    }

    return (
        <div className="p-6 space-y-8">

            {/* HEADER */}
            <div>
                <h3 className="text-xl font-black text-slate-800">
                    Slot Management
                </h3>

                <p className="text-sm text-gray-500 mt-1">
                    Kelola master slot parkir, prioritas,
                    dan status operasional sistem.
                </p>
            </div>

            {/* ALERT */}
            {message.text && (
                <div
                    className={`p-4 rounded-xl border text-sm font-semibold ${
                        message.type === 'success'
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                            : 'bg-rose-50 border-rose-200 text-rose-700'
                    }`}
                >
                    {message.text}
                </div>
            )}

            {/* SUMMARY */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">

                <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                    <p className="text-xs uppercase font-bold text-gray-500">
                        Total Slot
                    </p>

                    <h4 className="text-3xl font-black mt-2">
                        {slots.length}
                    </h4>
                </div>

                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5">
                    <p className="text-xs uppercase font-bold text-emerald-700">
                        Available
                    </p>

                    <h4 className="text-3xl font-black text-emerald-700 mt-2">
                        {countAvailable}
                    </h4>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
                    <p className="text-xs uppercase font-bold text-amber-700">
                        Occupied
                    </p>

                    <h4 className="text-3xl font-black text-amber-700 mt-2">
                        {countOccupied}
                    </h4>
                </div>

                <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5">
                    <p className="text-xs uppercase font-bold text-rose-700">
                        Maintenance
                    </p>

                    <h4 className="text-3xl font-black text-rose-700 mt-2">
                        {countMaintenance}
                    </h4>
                </div>

            </div>

            {/* FORM */}
            <form
                onSubmit={handleSubmit}
                className="bg-slate-50 border border-gray-200 rounded-2xl p-6 shadow-sm"
            >
                <div className="flex justify-between items-center mb-5">
                    <h4 className="text-xs uppercase font-bold tracking-wider">
                        {editMode
                            ? '✏️ Edit Slot'
                            : '➕ Tambah Slot Baru'}
                    </h4>

                    {editMode && (
                        <button
                            type="button"
                            onClick={resetForm}
                            className="text-xs font-bold text-red-600"
                        >
                            Batal Edit
                        </button>
                    )}
                </div>

                <div className="grid md:grid-cols-2 gap-4">

                    <div>
                        <label className="block text-xs font-bold mb-2">
                            Slot Code
                        </label>

                        <input
                            type="text"
                            required
                            value={formData.slot_code}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    slot_code:
                                        e.target.value.toUpperCase()
                                })
                            }
                            className="w-full border border-gray-200 rounded-xl px-4 py-3"
                            placeholder="Contoh: A1"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold mb-2">
                            Priority Weight
                        </label>

                        <input
                            type="number"
                            required
                            min="1"
                            value={formData.priority_weight}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    priority_weight:
                                        e.target.value
                                })
                            }
                            className="w-full border border-gray-200 rounded-xl px-4 py-3"
                            placeholder="1"
                        />
                    </div>

                </div>

                <div className="flex justify-end mt-5">
                    <button
                        type="submit"
                        disabled={saving}
                        className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-3 rounded-xl text-sm font-bold"
                    >
                        {saving
                            ? 'Menyimpan...'
                            : editMode
                            ? 'Update Slot'
                            : 'Tambah Slot'}
                    </button>
                </div>

            </form>

            {/* TABLE */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">

                <div className="p-5 border-b bg-slate-50">
                    <h4 className="text-xs font-bold uppercase tracking-wider">
                        Daftar Master Slot
                    </h4>
                </div>

                <div className="overflow-x-auto">

                    <table className="w-full">

                        <thead>
                            <tr className="bg-slate-100 text-[11px] uppercase tracking-wider text-gray-600">
                                <th className="px-6 py-3 text-left">Slot</th>
                                <th className="px-6 py-3 text-left">Prioritas</th>
                                <th className="px-6 py-3 text-left">Status</th>
                                <th className="px-6 py-3 text-left">Ubah Status</th>
                                <th className="px-6 py-3 text-left">Aksi</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-100">

                            {slots.map((slot) => (
                                <tr
                                    key={slot.id}
                                    className="hover:bg-slate-50"
                                >
                                    <td className="px-6 py-4 font-bold">
                                        {slot.slot_code}
                                    </td>

                                    <td className="px-6 py-4">
                                        {slot.priority_weight}
                                    </td>

                                    <td className="px-6 py-4">
                                        {getStatusBadge(slot.status)}
                                    </td>

                                    <td className="px-6 py-4">

                                        <select
                                            value={slot.status}
                                            disabled={
                                                updatingId === slot.id
                                            }
                                            onChange={(e) =>
                                                updateStatus(
                                                    slot.id,
                                                    e.target.value
                                                )
                                            }
                                            className="border border-gray-200 rounded-lg px-3 py-2 text-xs"
                                        >
                                            <option value="available">
                                                Available
                                            </option>

                                            <option value="occupied">
                                                Occupied
                                            </option>

                                            <option value="maintenance">
                                                Maintenance
                                            </option>
                                        </select>

                                    </td>

                                    <td className="px-6 py-4 space-x-2">

                                        <button
                                            onClick={() =>
                                                handleEdit(slot)
                                            }
                                            className="px-3 py-2 rounded-lg bg-blue-100 text-blue-700 text-xs font-bold"
                                        >
                                            Edit
                                        </button>

                                        <button
                                            onClick={() =>
                                                handleDelete(slot)
                                            }
                                            className="px-3 py-2 rounded-lg bg-red-100 text-red-700 text-xs font-bold"
                                        >
                                            Hapus
                                        </button>

                                    </td>
                                </tr>
                            ))}

                        </tbody>

                    </table>

                </div>

            </div>

        </div>
    );
};

export default SlotControl;