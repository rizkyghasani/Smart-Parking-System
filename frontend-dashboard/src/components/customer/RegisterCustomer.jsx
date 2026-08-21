import React, { useState } from 'react';
import axios from 'axios';
import { ArrowLeft, Mail, Lock, Eye, EyeOff, User, Phone, Car, AlertCircle, CheckCircle } from 'lucide-react';

const RegisterCustomer = ({ onRegisterSuccess, onNavigateToLogin, onBack }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        phone_number: '',
        registered_plate_number: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (field) => (e) => {
        setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    };

    const passwordsMatch = formData.password && formData.password_confirmation
        ? formData.password === formData.password_confirmation
        : true;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.password_confirmation) {
            setError('Konfirmasi password tidak cocok dengan password yang dimasukkan.');
            return;
        }

        if (formData.password.length < 8) {
            setError('Password minimal harus 8 karakter.');
            return;
        }

        setIsLoading(true);
        try {
            await axios.post('http://localhost:8000/api/customer/register', {
                name: formData.name,
                email: formData.email,
                password: formData.password,
                phone_number: formData.phone_number,
                registered_plate_number: formData.registered_plate_number
            });
            onRegisterSuccess();
        } catch (err) {
            setError(err.response?.data?.message || 'Gagal mendaftar. Periksa kembali input Anda.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 relative">
            {onBack && (
                <button
                    onClick={onBack}
                    className="absolute top-6 left-6 flex items-center gap-2 text-slate-500 hover:text-slate-300 text-sm font-medium transition-colors"
                >
                    <ArrowLeft size={16} /> Kembali
                </button>
            )}

            <div className="w-full max-w-md py-10">
                {/* Header ikon + judul */}
                <div className="flex flex-col items-center mb-8">
                    <div className="bg-emerald-500/10 p-3.5 rounded-2xl mb-4 border border-emerald-500/20">
                        <Car size={28} className="text-emerald-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">Buat Akun Pelanggan</h2>
                    <p className="text-sm text-slate-400 mt-1.5">Daftar untuk menikmati kemudahan parkir mandiri</p>
                </div>

                <div className="bg-slate-800 p-8 rounded-3xl w-full border border-slate-700 shadow-2xl">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm px-4 py-3 rounded-xl flex items-start gap-2.5">
                                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                                <span>{error}</span>
                            </div>
                        )}

                        {/* Nama Lengkap */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                                Nama Lengkap
                            </label>
                            <div className="relative">
                                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                                <input
                                    type="text"
                                    placeholder="Sesuai identitas resmi"
                                    value={formData.name}
                                    onChange={handleChange('name')}
                                    className="w-full bg-slate-900 border border-slate-700 pl-11 pr-4 py-3.5 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-all"
                                    required
                                    autoComplete="name"
                                />
                            </div>
                        </div>

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
                                    value={formData.email}
                                    onChange={handleChange('email')}
                                    className="w-full bg-slate-900 border border-slate-700 pl-11 pr-4 py-3.5 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-all"
                                    required
                                    autoComplete="email"
                                />
                            </div>
                        </div>

                        {/* No. HP */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                                Nomor HP
                            </label>
                            <div className="relative">
                                <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                                <input
                                    type="tel"
                                    placeholder="08xxxxxxxxxx"
                                    value={formData.phone_number}
                                    onChange={handleChange('phone_number')}
                                    className="w-full bg-slate-900 border border-slate-700 pl-11 pr-4 py-3.5 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-all"
                                    required
                                    autoComplete="tel"
                                />
                            </div>
                        </div>

                        {/* Plat Nomor */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                                Plat Nomor Kendaraan
                            </label>
                            <div className="relative">
                                <Car size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                                <input
                                    type="text"
                                    placeholder="K 141 KU"
                                    value={formData.registered_plate_number}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, registered_plate_number: e.target.value.toUpperCase() }))}
                                    className="w-full bg-slate-900 border border-slate-700 pl-11 pr-4 py-3.5 rounded-xl text-white placeholder:text-slate-600 font-mono uppercase tracking-widest focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-all"
                                    required
                                />
                            </div>
                            <p className="text-xs text-slate-500 mt-1.5">Kendaraan ini akan terhubung otomatis dengan akun Anda saat tap-in.</p>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Minimal 8 karakter"
                                    value={formData.password}
                                    onChange={handleChange('password')}
                                    className="w-full bg-slate-900 border border-slate-700 pl-11 pr-11 py-3.5 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-all"
                                    required
                                    minLength={8}
                                    autoComplete="new-password"
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

                        {/* Konfirmasi Password */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                                Konfirmasi Password
                            </label>
                            <div className="relative">
                                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    placeholder="Ulangi password"
                                    value={formData.password_confirmation}
                                    onChange={handleChange('password_confirmation')}
                                    className={`w-full bg-slate-900 border pl-11 pr-11 py-3.5 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 transition-all ${
                                        !passwordsMatch
                                            ? 'border-rose-500/50 focus:border-rose-500 focus:ring-rose-500/30'
                                            : 'border-slate-700 focus:border-emerald-500 focus:ring-emerald-500/30'
                                    }`}
                                    required
                                    autoComplete="new-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                                    tabIndex={-1}
                                    aria-label={showConfirmPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                                >
                                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {formData.password_confirmation && (
                                <p className={`text-xs mt-1.5 flex items-center gap-1.5 ${passwordsMatch ? 'text-emerald-400' : 'text-rose-400'}`}>
                                    {passwordsMatch ? <CheckCircle size={12} /> : <AlertCircle size={12} />}
                                    {passwordsMatch ? 'Password cocok' : 'Password tidak cocok'}
                                </p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-emerald-900/30 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                        >
                            {isLoading ? 'Mendaftarkan...' : 'Daftar Sekarang'}
                        </button>
                    </form>
                </div>

                <p className="text-slate-500 text-sm text-center mt-6">
                    Sudah punya akun?{' '}
                    <button
                        onClick={onNavigateToLogin}
                        className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors"
                    >
                        Login di sini
                    </button>
                </p>
            </div>
        </div>
    );
};

export default RegisterCustomer;