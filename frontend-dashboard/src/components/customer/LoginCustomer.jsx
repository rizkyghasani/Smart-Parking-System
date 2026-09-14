import React, { useState } from 'react';
import axios from 'axios';
import { Car, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import AuthLayout, { CUSTOMER_ACCENT } from '../auth/AuthLayout';

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
        <AuthLayout
            icon={Car}
            title="Selamat Datang Kembali"
            subtitle="Masuk ke akun pelanggan untuk lanjut parkir"
            accent={CUSTOMER_ACCENT}
            onBack={onBack}
            footer={
                <>
                    Belum punya akun?{' '}
                    <button
                        onClick={onNavigateToRegister}
                        className={`font-semibold transition-colors ${CUSTOMER_ACCENT.link}`}
                    >
                        Daftar sekarang
                    </button>
                </>
            }
        >
            <form onSubmit={handleLogin} className="space-y-4">
                {/* Alert error */}
                {error && (
                    <div className="bg-rose-50 border border-rose-100 text-rose-600 text-sm px-4 py-3 rounded-xl flex items-start gap-2.5">
                        <AlertCircle size={16} className="shrink-0 mt-0.5" />
                        <span>{error}</span>
                    </div>
                )}

                {/* Email */}
                <div>
                    <label className="block text-xs font-semibold text-[#475467] uppercase tracking-wider mb-2">
                        Email
                    </label>
                    <div className="relative">
                        <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#98A2B3]" />
                        <input
                            type="email"
                            placeholder="nama@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={`w-full pl-11 pr-4 py-3.5 rounded-xl text-sm transition-all ${CUSTOMER_ACCENT.field}`}
                            required
                            autoComplete="email"
                        />
                    </div>
                </div>

                {/* Password dengan toggle show/hide */}
                <div>
                    <label className="block text-xs font-semibold text-[#475467] uppercase tracking-wider mb-2">
                        Password
                    </label>
                    <div className="relative">
                        <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#98A2B3]" />
                        <input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Masukkan password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={`w-full pl-11 pr-11 py-3.5 rounded-xl text-sm transition-all ${CUSTOMER_ACCENT.field}`}
                            required
                            autoComplete="current-password"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword((prev) => !prev)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#98A2B3] hover:text-[#475467] transition-colors"
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
                    className={`w-full text-white font-bold py-3.5 rounded-xl transition-all mt-2 disabled:opacity-50 disabled:cursor-not-allowed ${CUSTOMER_ACCENT.btn} ${CUSTOMER_ACCENT.btnBusy}`}
                >
                    {isLoading ? 'Memproses...' : 'Masuk'}
                </button>
            </form>
        </AuthLayout>
    );
};

export default LoginCustomer;