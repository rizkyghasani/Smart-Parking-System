import React, { useState, useEffect, useCallback } from 'react';
import { Search, Edit2, ShieldCheck, ShieldAlert, X, User, Car } from 'lucide-react';
import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

const MemberManagement = () => {
    const [customers, setCustomers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [selectedCustomer, setSelectedCustomer] = useState(null);

    const token = localStorage.getItem('admin_token');
    const headers = {
        Authorization: `Bearer ${token}`,
        'Accept': 'application/json'
    };

    const [formData, setFormData] = useState({
        is_active: false,
        expired_at: ''
    });

    // ── FITUR PENCARIAN SERVER-SIDE & PAGINATION ──
    const fetchCustomers = useCallback(async (query = '') => {
        setIsFetching(true);
        try {
            const response = await axios.get(`${API_URL}/admin/members/customers`, { 
                headers,
                params: { search: query }
            });
            // Karena backend mereturn paginate(), data array ada di response.data.data.data
            // Fallback disesuaikan jika struktur json sedikit berbeda
            const customerData = response.data?.data?.data || response.data?.data || [];
            setCustomers(customerData);
        } catch (err) {
            showMessage('error', '❌ Gagal mengambil data pelanggan.');
            console.error('Gagal mengambil data:', err);
        } finally {
            setIsFetching(false);
        }
    }, []);

    // ── EFEK DEBOUNCE PENCARIAN ──
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchCustomers(searchQuery);
        }, 500); // Tunggu 500ms setelah admin berhenti mengetik

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery, fetchCustomers]);

    const showMessage = (type, text) => {
        setMessage({ type, text });
        setTimeout(() => setMessage({ type: '', text: '' }), 4000);
    };

    const openModal = (customer) => {
        setSelectedCustomer(customer);
        setFormData({
            is_active: customer.member?.is_active ?? false,
            // Format tanggal agar sesuai dengan input type="date"
            expired_at: customer.member?.expired_at ? customer.member.expired_at.split('T')[0] : ''
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedCustomer(null);
        setFormData({ is_active: false, expired_at: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // Payload menyesuaikan rules backend
            const payload = {
                is_active: formData.is_active,
                expired_at: formData.is_active ? formData.expired_at : null // Set null jika dinonaktifkan
            };

            const response = await axios.post(
                `${API_URL}/admin/members/customers/${selectedCustomer.id}/toggle`, 
                payload, 
                { headers }
            );
            
            showMessage('success', `✅ ${response.data.message}`);
            closeModal();
            fetchCustomers(searchQuery); // Refresh data setelah update
        } catch (error) {
            console.error(error);
            const errMsg = error.response?.data?.message || 'Terjadi kesalahan pada server.';
            showMessage('error', `❌ Gagal menyimpan data: ${errMsg}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Aktivasi Membership</h1>
                    <p className="text-slate-400 text-sm mt-1">Cari pelanggan yang sudah terdaftar untuk mengaktifkan status keanggotaannya.</p>
                </div>
            </div>

            {/* Alert message */}
            {message.text && (
                <div className={`mb-4 p-4 rounded-xl text-sm font-semibold border ${
                    message.type === 'success'
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                        : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                }`}>
                    {message.text}
                </div>
            )}

            {/* Search Bar */}
            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 mb-6 flex items-center gap-3">
                <Search className="text-slate-400 shrink-0" size={20} />
                <input
                    type="text"
                    placeholder="Cari nama, email, atau plat nomor pelanggan..."
                    className="bg-transparent border-none text-white focus:outline-none w-full placeholder:text-slate-500"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* Table */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden overflow-x-auto">
                {isFetching ? (
                    <div className="py-16 text-center text-slate-500 font-medium">
                        Mencari data pelanggan...
                    </div>
                ) : (
                    <table className="w-full text-left text-sm text-slate-300">
                        <thead className="bg-slate-900/50 text-slate-400 border-b border-slate-700 uppercase text-xs">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Pelanggan</th>
                                <th className="px-6 py-4 font-semibold">Plat Nomor</th>
                                <th className="px-6 py-4 font-semibold">Status Member</th>
                                <th className="px-6 py-4 font-semibold">Berlaku Hingga</th>
                                <th className="px-6 py-4 font-semibold text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/50">
                            {customers.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                                        Tidak ada data pelanggan yang cocok dengan pencarian.
                                    </td>
                                </tr>
                            ) : (
                                customers.map((customer) => {
                                    const name = customer.user?.name ?? '-';
                                    const email = customer.user?.email ?? '-';
                                    const phone = customer.phone_number ?? '-';
                                    const plate = customer.registered_plate_number ?? '-';
                                    const isActive = customer.member?.is_active ?? false;
                                    
                                    // Format tanggal lokal
                                    const expiredAt = customer.member?.expired_at 
                                        ? new Date(customer.member.expired_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
                                        : '-';

                                    return (
                                        <tr key={customer.id} className="hover:bg-slate-700/30 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-white">{name}</div>
                                                <div className="text-xs text-slate-500">{phone} • {email}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="px-3 py-1 bg-slate-900 border border-slate-600 rounded-md font-mono text-white tracking-widest text-xs">
                                                    {plate}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {isActive ? (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                                        <ShieldCheck size={14} /> Aktif
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-400 border border-slate-600">
                                                        <ShieldAlert size={14} /> Nonaktif
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-slate-300">
                                                {expiredAt}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => openModal(customer)}
                                                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600 hover:text-white rounded-lg transition-colors text-xs font-medium border border-indigo-500/30"
                                                >
                                                    <Edit2 size={14} /> Kelola Status
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Modal Edit Status */}
            {isModalOpen && selectedCustomer && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
                    <div className="bg-slate-800 rounded-2xl border border-slate-700 w-full max-w-md overflow-hidden shadow-2xl">
                        <div className="flex justify-between items-center p-6 border-b border-slate-700 bg-slate-800/50">
                            <h2 className="text-xl font-bold text-white">Kelola Membership</h2>
                            <button onClick={closeModal} className="text-slate-400 hover:text-white transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        {/* Info Pelanggan (Read-only) */}
                        <div className="p-6 pb-2 border-b border-slate-700/50 bg-slate-900/30">
                            <div className="flex items-start gap-3 mb-4">
                                <div className="p-2 bg-slate-800 rounded-lg border border-slate-700 text-indigo-400">
                                    <User size={20} />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-white">{selectedCustomer.user?.name}</p>
                                    <p className="text-xs text-slate-400">{selectedCustomer.user?.email}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 mb-4">
                                <div className="p-2 bg-slate-800 rounded-lg border border-slate-700 text-slate-400">
                                    <Car size={20} />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500">Plat Terdaftar</p>
                                    <p className="font-mono text-sm font-bold text-white tracking-widest">{selectedCustomer.registered_plate_number}</p>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            {/* Toggle Status */}
                            <div className="flex items-center justify-between p-4 bg-slate-900 rounded-xl border border-slate-700">
                                <div>
                                    <p className="text-sm font-medium text-white">Status Membership</p>
                                    <p className={`text-xs mt-1 ${formData.is_active ? 'text-emerald-400' : 'text-slate-400'}`}>
                                        {formData.is_active ? 'Aktif' : 'Nonaktif / Reguler'}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, is_active: !prev.is_active }))}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${
                                        formData.is_active ? 'bg-emerald-500' : 'bg-slate-600'
                                    }`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-200 ${
                                            formData.is_active ? 'translate-x-6' : 'translate-x-1'
                                        }`}
                                    />
                                </button>
                            </div>

                            {/* Tanggal Kedaluwarsa - Hanya aktif jika is_active true */}
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Berlaku Hingga
                                </label>
                                <input
                                    type="date"
                                    required={formData.is_active}
                                    disabled={!formData.is_active}
                                    value={formData.expired_at}
                                    onChange={(e) => setFormData(prev => ({ ...prev, expired_at: e.target.value }))}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed"
                                />
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button" onClick={closeModal}
                                    className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2.5 rounded-lg font-medium transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit" disabled={isLoading}
                                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50"
                                >
                                    {isLoading ? 'Menyimpan...' : 'Simpan Status'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MemberManagement;