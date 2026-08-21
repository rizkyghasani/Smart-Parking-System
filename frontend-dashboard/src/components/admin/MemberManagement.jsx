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

    const fetchCustomers = useCallback(async (query = '') => {
        setIsFetching(true);
        try {
            const response = await axios.get(`${API_URL}/admin/members/customers`, { 
                headers,
                params: { search: query }
            });
            const customerData = response.data?.data?.data || response.data?.data || [];
            setCustomers(customerData);
        } catch (err) {
            showMessage('error', 'Gagal mengambil data pelanggan.');
            console.error('Gagal mengambil data:', err);
        } finally {
            setIsFetching(false);
        }
    }, []);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchCustomers(searchQuery);
        }, 500);

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
            const payload = {
                is_active: formData.is_active,
                expired_at: formData.is_active ? formData.expired_at : null
            };

            const response = await axios.post(
                `${API_URL}/admin/members/customers/${selectedCustomer.id}/toggle`, 
                payload, 
                { headers }
            );
            
            showMessage('success', response.data.message);
            closeModal();
            fetchCustomers(searchQuery);
        } catch (error) {
            console.error(error);
            const errMsg = error.response?.data?.message || 'Terjadi kesalahan pada server.';
            showMessage('error', `Gagal menyimpan data: ${errMsg}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-5 pb-4 border-b border-gray-100 gap-4">
                <div>
                    <h1 className="text-xl font-bold text-gray-800">Aktivasi Membership</h1>
                    <p className="text-sm text-gray-500 mt-1">Cari pelanggan yang sudah terdaftar untuk mengaktifkan status keanggotaannya.</p>
                </div>
            </div>

            {/* Alert message */}
            {message.text && (
                <div className={`mb-4 px-4 py-3 rounded-xl text-sm font-medium border flex items-center gap-2 ${
                    message.type === 'success'
                        ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
                        : 'bg-rose-50 border-rose-100 text-rose-700'
                }`}>
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${message.type === 'success' ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                    {message.text}
                </div>
            )}

            {/* Search Bar */}
            <div className="relative mb-5">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                    type="text"
                    placeholder="Cari nama, email, atau plat nomor pelanggan..."
                    className="w-full bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-gray-400 focus:bg-white transition-colors placeholder:text-gray-400"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* Table */}
            <div className="border border-gray-200 rounded-xl overflow-hidden overflow-x-auto">
                {isFetching ? (
                    <div className="py-16 text-center text-gray-400 text-sm">
                        Mencari data pelanggan...
                    </div>
                ) : (
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-500 border-b border-gray-200 text-xs font-semibold uppercase tracking-wide">
                            <tr>
                                <th className="px-6 py-3.5">Pelanggan</th>
                                <th className="px-6 py-3.5">Plat Nomor</th>
                                <th className="px-6 py-3.5">Status Member</th>
                                <th className="px-6 py-3.5">Berlaku Hingga</th>
                                <th className="px-6 py-3.5 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {customers.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-400 text-sm">
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
                                    
                                    const expiredAt = customer.member?.expired_at 
                                        ? new Date(customer.member.expired_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
                                        : '-';

                                    return (
                                        <tr key={customer.id} className="hover:bg-gray-50/70 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-gray-800">{name}</div>
                                                <div className="text-xs text-gray-400 mt-0.5">{phone} · {email}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="px-2.5 py-1 bg-gray-50 border border-gray-200 rounded-md font-mono text-gray-700 tracking-widest text-xs">
                                                    {plate}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {isActive ? (
                                                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Aktif
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-gray-300" /> Nonaktif
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-gray-600">
                                                {expiredAt}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => openModal(customer)}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-gray-800 rounded-lg transition-colors text-xs font-medium border border-gray-200"
                                                >
                                                    <Edit2 size={13} /> Kelola Status
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
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl border border-gray-200 w-full max-w-md overflow-hidden shadow-2xl">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100">
                            <h2 className="text-lg font-bold text-gray-800">Kelola Membership</h2>
                            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Info Pelanggan (Read-only) */}
                        <div className="p-6 pb-2 border-b border-gray-100 bg-gray-50/50">
                            <div className="flex items-start gap-3 mb-4">
                                <div className="p-2 bg-white rounded-lg border border-gray-200 text-gray-400">
                                    <User size={18} />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-gray-800">{selectedCustomer.user?.name}</p>
                                    <p className="text-xs text-gray-500">{selectedCustomer.user?.email}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 mb-4">
                                <div className="p-2 bg-white rounded-lg border border-gray-200 text-gray-400">
                                    <Car size={18} />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400">Plat Terdaftar</p>
                                    <p className="font-mono text-sm font-semibold text-gray-800 tracking-widest">{selectedCustomer.registered_plate_number}</p>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            {/* Toggle Status */}
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                                <div>
                                    <p className="text-sm font-medium text-gray-800">Status Membership</p>
                                    <p className={`text-xs mt-1 ${formData.is_active ? 'text-emerald-600' : 'text-gray-400'}`}>
                                        {formData.is_active ? 'Aktif' : 'Nonaktif / Reguler'}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, is_active: !prev.is_active }))}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${
                                        formData.is_active ? 'bg-emerald-500' : 'bg-gray-300'
                                    }`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-200 ${
                                            formData.is_active ? 'translate-x-6' : 'translate-x-1'
                                        }`}
                                    />
                                </button>
                            </div>

                            {/* Tanggal Kedaluwarsa */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Berlaku Hingga
                                </label>
                                <input
                                    type="date"
                                    required={formData.is_active}
                                    disabled={!formData.is_active}
                                    value={formData.expired_at}
                                    onChange={(e) => setFormData(prev => ({ ...prev, expired_at: e.target.value }))}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-gray-700 focus:outline-none focus:border-gray-400 focus:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                                />
                            </div>

                            <div className="pt-2 flex gap-3">
                                <button
                                    type="button" onClick={closeModal}
                                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-lg font-medium transition-colors text-sm"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit" disabled={isLoading}
                                    className="flex-1 bg-gray-800 hover:bg-gray-900 text-white py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50 text-sm"
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