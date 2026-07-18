import React, { useState } from 'react';
import axios from 'axios';

const RegisterCustomer = ({ onRegisterSuccess, onNavigateToLogin }) => {
    const [formData, setFormData] = useState({
        name: '', email: '', password: '', phone_number: '', registered_plate_number: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:8000/api/customer/register', formData);
            alert('Registrasi berhasil! Silakan login.');
            onRegisterSuccess();
        } catch (err) {
            alert(err.response?.data?.message || 'Gagal mendaftar. Periksa kembali input Anda.');
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
            <div className="bg-slate-800 p-8 rounded-2xl w-full max-w-md border border-slate-700 shadow-xl">
                <h2 className="text-2xl font-bold text-white mb-6 text-center">Daftar Akun Pelanggan</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="text" placeholder="Nama Lengkap" className="w-full bg-slate-900 border border-slate-700 p-3 rounded-lg text-white" onChange={(e) => setFormData({...formData, name: e.target.value})} required />
                    <input type="email" placeholder="Email" className="w-full bg-slate-900 border border-slate-700 p-3 rounded-lg text-white" onChange={(e) => setFormData({...formData, email: e.target.value})} required />
                    <input type="password" placeholder="Password" className="w-full bg-slate-900 border border-slate-700 p-3 rounded-lg text-white" onChange={(e) => setFormData({...formData, password: e.target.value})} required />
                    <input type="text" placeholder="No. HP" className="w-full bg-slate-900 border border-slate-700 p-3 rounded-lg text-white" onChange={(e) => setFormData({...formData, phone_number: e.target.value})} required />
                    <input type="text" placeholder="Plat Nomor (Contoh: K 141 KU)" className="w-full bg-slate-900 border border-slate-700 p-3 rounded-lg text-white font-mono uppercase" onChange={(e) => setFormData({...formData, registered_plate_number: e.target.value})} required />
                    <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg transition-all">Daftar Sekarang</button>
                </form>
                <p className="text-slate-400 text-sm text-center mt-4 cursor-pointer hover:text-white" onClick={onNavigateToLogin}>
                    Sudah punya akun? Login di sini
                </p>
            </div>
        </div>
    );
};

export default RegisterCustomer;