import React, { useState, useEffect } from 'react';
import axios from 'axios';

const StaffManagement = () => {
    const [staffs, setStaffs] = useState([]);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    
    const [loading, setLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const [confirmModal, setConfirmModal] = useState(null);
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isConfirming, setIsConfirming] = useState(false);
    const [confirmError, setConfirmError] = useState('');

    const token = localStorage.getItem('admin_token');
    const headers = { Authorization: `Bearer ${token}` };

    useEffect(() => {
        fetchStaffs();
    }, []);

    const fetchStaffs = async () => {
        setLoading(true);
        try {
            const res = await axios.get('http://localhost:8000/api/admin/staff', { headers });
            setStaffs(res.data.data);
        } catch {
            setStaffs([
                { id: 101, name: 'Budi Santoso', email: 'budi@smartpark.com', is_active: true, created_at: '2026-01-10' },
                { id: 102, name: 'Siti Rahma', email: 'siti@smartpark.com', is_active: false, created_at: '2026-02-15' }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateStaff = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setMessage({ type: '', text: '' });
        const formData = new FormData();
        formData.append('name', name);
        formData.append('email', email);
        formData.append('password', password);
        try {
            await axios.post('http://localhost:8000/api/admin/staff', formData, { headers });
            setMessage({ type: 'success', text: 'Petugas lapangan baru sukses didaftarkan!' });
            setName(''); setEmail(''); setPassword('');
            fetchStaffs();
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Gagal mendaftarkan staf.' });
        } finally {
            setIsSaving(false);
            setTimeout(() => setMessage({ type: '', text: '' }), 4000);
        }
    };

    const openConfirmModal = (staff) => {
        setConfirmModal({
            staffId:      staff.id,
            staffName:    staff.name,
            targetStatus: !staff.is_active,
        });
        setConfirmPassword('');
        setConfirmError('');
    };

    const closeConfirmModal = () => {
        setConfirmModal(null);
        setConfirmPassword('');
        setConfirmError('');
    };

    const handleConfirmToggle = async (e) => {
        e.preventDefault();
        if (!confirmPassword.trim()) {
            setConfirmError('Password tidak boleh kosong.');
            return;
        }
        setIsConfirming(true);
        setConfirmError('');
        try {
            const res = await axios.patch(
                `http://localhost:8000/api/admin/staff/${confirmModal.staffId}/toggle-status`,
                { admin_password: confirmPassword },
                { headers }
            );
            if (res.data.success) {
                setStaffs(prev =>
                    prev.map(s =>
                        s.id === confirmModal.staffId
                            ? { ...s, is_active: !s.is_active }
                            : s
                    )
                );
                closeConfirmModal();
                setMessage({
                    type: 'success',
                    text: `Status akun ${confirmModal.staffName} berhasil diubah.`,
                });
                setTimeout(() => setMessage({ type: '', text: '' }), 4000);
            }
        } catch (err) {
            setConfirmError(
                err.response?.status === 403
                    ? 'Password salah. Silakan coba lagi.'
                    : err.response?.data?.message || 'Gagal mengubah status.'
            );
        } finally {
            setIsConfirming(false);
        }
    };

    if (loading && staffs.length === 0) {
        return <div className="p-8 text-center text-[#667085] font-medium">Memuat data petugas lapangan...</div>;
    }

    return (
        <div className="p-6 space-y-8">

            {/* MODAL KONFIRMASI PASSWORD */}
            {confirmModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-[#101828]/50 backdrop-blur-sm"
                    onClick={closeConfirmModal}
                >
                    <div
                        className="w-full max-w-sm mx-4 bg-white rounded-2xl shadow-2xl p-6 space-y-5 border border-[#E2E6EE]"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="space-y-1">
                            <p className="text-xs font-bold text-[#98A2B3] uppercase tracking-widest">
                                Verifikasi Admin
                            </p>
                            <p className="text-lg font-black text-[#101828] tracking-tight">
                                {confirmModal.targetStatus ? 'Aktifkan' : 'Nonaktifkan'} Akun Petugas
                            </p>
                            <p className="text-sm text-[#667085]">
                                Kamu akan mengubah status akses{' '}
                                <span className="font-bold text-[#101828]">{confirmModal.staffName}</span>.
                                Masukkan password admin untuk melanjutkan.
                            </p>
                        </div>

                        <form onSubmit={handleConfirmToggle} className="space-y-4">
                            <div>
                                <label className="block text-[11px] font-bold text-[#667085] uppercase tracking-wider mb-1">
                                    Password Admin
                                </label>
                                <input
                                    type="password"
                                    autoFocus
                                    value={confirmPassword}
                                    onChange={e => {
                                        setConfirmPassword(e.target.value);
                                        setConfirmError('');
                                    }}
                                    className={`w-full border rounded-xl px-4 py-2.5 text-sm text-[#101828]
                                                focus:outline-none transition-all
                                                ${confirmError
                                                    ? 'border-rose-400 bg-rose-50 focus:border-rose-500'
                                                    : 'border-[#E2E6EE] bg-[#F3F5F9] focus:border-[#26468A]'
                                                }`}
                                    placeholder="Masukkan password akunmu"
                                />
                                {confirmError && (
                                    <p className="text-rose-600 text-xs font-semibold mt-1.5">
                                        {confirmError}
                                    </p>
                                )}
                            </div>

                            <div className="flex gap-3 pt-1">
                                <button
                                    type="button"
                                    onClick={closeConfirmModal}
                                    className="flex-1 py-2.5 rounded-xl border border-[#E2E6EE] text-sm
                                               font-bold text-[#475467] hover:bg-[#F3F5F9] transition-all"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isConfirming}
                                    className={`flex-1 py-2.5 rounded-xl text-sm font-black text-white
                                                uppercase tracking-wide transition-all shadow-sm
                                                disabled:opacity-50
                                                ${confirmModal.targetStatus
                                                    ? 'bg-emerald-600 hover:bg-emerald-500'
                                                    : 'bg-rose-600 hover:bg-rose-500'
                                                }`}
                                >
                                    {isConfirming ? 'Memverifikasi...' : 'Konfirmasi'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* KONTEN UTAMA */}
            <div>
                <h3 className="text-xl font-black text-[#101828] tracking-tight">Manajemen Akun Petugas</h3>
                <p className="text-sm text-[#667085] mt-0.5">Kelola hak akses masuk sirkulasi monitor untuk staf dan petugas lapangan.</p>
            </div>

            {message.text && (
                <div className={`p-4 rounded-xl text-sm font-semibold border ${
                    message.type === 'success'
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                        : 'bg-rose-50 border-rose-200 text-rose-700'
                }`}>
                    {message.text}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* FORM REGISTRASI */}
                <form onSubmit={handleCreateStaff} className="bg-[#F3F5F9] border border-[#E2E6EE] rounded-2xl p-6 shadow-sm space-y-4 h-fit">
                    <div className="flex items-center space-x-2 border-b border-[#E2E6EE] pb-2 mb-2">
                        <span className="text-[#26468A] text-xs font-bold">+</span>
                        <h4 className="text-xs font-bold text-[#101828] uppercase tracking-wide">Tambah Petugas Baru</h4>
                    </div>
                    <div>
                        <label className="block text-[11px] font-bold text-[#667085] uppercase tracking-wider mb-1">Nama Lengkap</label>
                        <input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full bg-white border border-[#E2E6EE] rounded-xl px-4 py-2.5 text-sm text-[#101828] focus:outline-none focus:border-[#26468A] transition-all" placeholder="Nama Lengkap" />
                    </div>
                    <div>
                        <label className="block text-[11px] font-bold text-[#667085] uppercase tracking-wider mb-1">Email Karyawan</label>
                        <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-white border border-[#E2E6EE] rounded-xl px-4 py-2.5 text-sm text-[#101828] focus:outline-none focus:border-[#26468A] transition-all" placeholder="Email Karyawan" />
                    </div>
                    <div>
                        <label className="block text-[11px] font-bold text-[#667085] uppercase tracking-wider mb-1">Password Default</label>
                        <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-white border border-[#E2E6EE] rounded-xl px-4 py-2.5 text-sm text-[#101828] focus:outline-none focus:border-[#26468A] transition-all" placeholder="••••••••" />
                    </div>
                    <button type="submit" disabled={isSaving} className="w-full bg-[#26468A] hover:bg-[#1d3872] text-white font-bold py-3 rounded-xl text-xs uppercase tracking-wider shadow-sm transition-all mt-2">
                        {isSaving ? 'Memproses...' : 'Daftarkan Staf'}
                    </button>
                </form>

                {/* TABEL DATA STAFF */}
                <div className="lg:col-span-2 bg-white border border-[#E2E6EE] rounded-2xl shadow-sm overflow-hidden flex flex-col">
                    <div className="p-4 border-b border-[#E2E6EE] bg-[#F3F5F9] flex items-center justify-between">
                        <h4 className="text-xs font-bold text-[#101828] uppercase tracking-wider">Daftar Petugas Aktif</h4>
                        <span className="text-[11px] text-[#98A2B3] font-medium">{staffs.length} petugas</span>
                    </div>

                    <div className="overflow-x-auto overflow-y-auto max-h-[480px] custom-scrollbar">
                        <table className="w-full text-left border-collapse">
                            <thead className="sticky top-0 z-10">
                                <tr className="bg-[#F3F5F9] border-b border-[#E2E6EE] text-[#667085] text-[11px] font-bold uppercase tracking-wider">
                                    <th className="px-6 py-3 bg-[#F3F5F9]">Nama</th>
                                    <th className="px-6 py-3 bg-[#F3F5F9]">Email</th>
                                    <th className="px-6 py-3 text-center bg-[#F3F5F9]">Status Akses</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#E2E6EE] text-xs">
                                {staffs.length === 0 ? (
                                    <tr>
                                        <td colSpan="3" className="px-6 py-12 text-center text-[#98A2B3] text-sm">
                                            Belum ada petugas terdaftar.
                                        </td>
                                    </tr>
                                ) : (
                                    staffs.map(staff => (
                                        <tr key={staff.id} className="hover:bg-[#F3F5F9]/70 bg-white transition-colors">
                                            <td className="px-6 py-4 font-bold text-[#101828]">{staff.name}</td>
                                            <td className="px-6 py-4 text-[#667085] font-mono">{staff.email}</td>
                                            <td className="px-6 py-4 text-center">
                                                <button
                                                    onClick={() => openConfirmModal(staff)}
                                                    className={`px-3 py-1.5 rounded-xl font-bold text-[10px] uppercase tracking-wide transition-all ${
                                                        staff.is_active
                                                            ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                                                            : 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                                                    }`}
                                                >
                                                    {staff.is_active ? '● Aktif (Bisa Masuk)' : '○ Nonaktif (Dikunci)'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StaffManagement;
