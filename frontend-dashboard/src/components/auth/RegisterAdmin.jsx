import React, { useState } from 'react';
import axios from 'axios';

const RegisterAdmin = ({ onRegisterSuccess, onNavigateToLogin }) => {
    // State input form registrasi
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    
    // State tambahan untuk feedback UI
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMessage('');

        try {
            // Menembak endpoint POST /api/admin/auth/register sesuai file routes/api.php
                const response = await axios.post('http://localhost:8000/api/admin/auth/register', {
                    name,
                    email,
                    password
                }, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    }
                });

            if (response.data.success) {
                alert('🎉 Registrasi Berhasil! Silakan masuk menggunakan akun baru.');
                onRegisterSuccess(); // Alihkan halaman kembali ke form login
            }
        } catch (error) {
            // Tangkap pesan error validasi dari Laravel
            const msg = error.response?.data?.message || 'Registrasi gagal, silakan coba lagi.';
            setErrorMessage(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-sans">
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl w-full max-w-md shadow-xl">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-white">Registrasi Admin</h2>
                    <p className="text-slate-400 text-sm mt-1">Buat akun kredensial administrator baru</p>
                </div>

                {errorMessage && (
                    <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs font-medium">
                        ⚠️ {errorMessage}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Nama Lengkap</label>
                        <input 
                            type="text" 
                            required 
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 transition-all" 
                            placeholder="Nama Admin" 
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
                        <input 
                            type="email" 
                            required 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 transition-all" 
                            placeholder="email@example.com" 
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Password</label>
                        <input 
                            type="password" 
                            required 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 transition-all" 
                            placeholder="••••••••" 
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-800 text-white font-medium py-3 rounded-xl text-sm mt-2 shadow-lg shadow-emerald-600/10 transition-all"
                    >
                        {loading ? 'Memproses Pendaftaran...' : 'Daftar Sekarang'}
                    </button>
                </form>

                <div className="text-center mt-6 pt-6 border-t border-slate-800 text-sm">
                    <span className="text-slate-500">Sudah memiliki akun? </span>
                    <button onClick={onNavigateToLogin} className="text-blue-400 hover:text-blue-300 font-medium transition-all">
                        Sign In di sini
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RegisterAdmin;