import React, { useState } from 'react';
import axios from 'axios';
import { ArrowLeft, Mail, Lock, Eye, EyeOff, Car, AlertCircle } from 'lucide-react';

const LoginCustomer = ({ onLoginSuccess, onNavigateToRegister, onBack }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            const res = await axios.post('http://localhost:8000/api/customer/login', { email, password });
            localStorage.setItem('customer_token', res.data.token);
            onLoginSuccess();
        } catch (err) {
            setError(err.response?.data?.message || 'Login gagal. Periksa kembali email atau password Anda.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 relative">
            {/* Tombol kembali ke dashboard utama */}
            {onBack && (
                <button
                    onClick={onBack}
                    className="absolute top-6 left-6 flex items-center gap-2 text-slate-500 hover:text-slate-300 text-sm font-medium transition-colors"
                >
                    <ArrowLeft size={16} /> Kembali
                </button>
            )}

            <div className="w-full max-w-md">
                {/* Header ikon + judul */}
                <div className="flex flex-col items-center mb-8">
                    <div className="bg-emerald-500/10 p-3.5 rounded-2xl mb-4 border border-emerald-500/20">
                        <Car size={28} className="text-emerald-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">Selamat Datang Kembali</h2>
                    <p className="text-sm text-slate-400 mt-1.5">Masuk ke akun pelanggan untuk lanjut parkir</p>
                </div>

                <div className="bg-slate-800 p-8 rounded-3xl w-full border border-slate-700 shadow-2xl">
                    <form onSubmit={handleLogin} className="space-y-4">
                        {/* Alert error */}
                        {error && (
                            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm px-4 py-3 rounded-xl flex items-start gap-2.5">
                                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                                <span>{error}</span>
                            </div>
                        )}

                        {/* Email */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                                Email
                            </label>
                            <div className="relative">
                                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                                <input
                                    type="email"
                                    placeholder="nama@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-700 pl-11 pr-4 py-3.5 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-all"
                                    required
                                    autoComplete="email"
                                />
                            </div>
                        </div>

                        {/* Password dengan toggle show/hide */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Masukkan password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-700 pl-11 pr-11 py-3.5 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-all"
                                    required
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((prev) => !prev)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                                    tabIndex={-1}
                                    aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-emerald-900/30 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                        >
                            {isLoading ? 'Memproses...' : 'Masuk'}
                        </button>
                    </form>
                </div>

                <p className="text-slate-500 text-sm text-center mt-6">
                    Belum punya akun?{' '}
                    <button
                        onClick={onNavigateToRegister}
                        className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors"
                    >
                        Daftar sekarang
                    </button>
                </p>
            </div>
        </div>
    );
};

export default LoginCustomer;