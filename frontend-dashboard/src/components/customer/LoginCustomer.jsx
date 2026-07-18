import React, { useState } from 'react';
import axios from 'axios';

const LoginCustomer = ({ onLoginSuccess, onNavigateToRegister }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:8000/api/customer/login', { email, password });
            localStorage.setItem('customer_token', res.data.token);
            onLoginSuccess(); // Pindah ke CustomerDashboard
        } catch (err) {
            alert('Login gagal. Periksa email atau password.');
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
            <div className="bg-slate-800 p-8 rounded-2xl w-full max-w-md border border-slate-700 shadow-xl">
                <h2 className="text-2xl font-bold text-white mb-6 text-center">Login Pelanggan</h2>
                <form onSubmit={handleLogin} className="space-y-4">
                    <input type="email" placeholder="Email" className="w-full bg-slate-900 border border-slate-700 p-3 rounded-lg text-white" onChange={(e) => setEmail(e.target.value)} required />
                    <input type="password" placeholder="Password" className="w-full bg-slate-900 border border-slate-700 p-3 rounded-lg text-white" onChange={(e) => setPassword(e.target.value)} required />
                    <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-lg transition-all">Login</button>
                </form>
                <p className="text-slate-400 text-sm text-center mt-4 cursor-pointer hover:text-white" onClick={onNavigateToRegister}>
                    Belum punya akun? Daftar sekarang
                </p>
            </div>
        </div>
    );
};

export default LoginCustomer;