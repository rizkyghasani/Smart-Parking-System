import React, { useState } from 'react';
import axios from 'axios';
import { Mail, Lock, Eye, EyeOff, User, Phone, Car, AlertCircle, CheckCircle } from 'lucide-react';
import AuthLayout, { CUSTOMER_ACCENT } from '../auth/AuthLayout';

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

    const iconColor = 'text-[#98A2B3]';
    const confirmFieldClass = !passwordsMatch
        ? 'bg-white border-rose-300 text-[#101828] placeholder:text-[#98A2B3] focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500/30'
        : CUSTOMER_ACCENT.field;

    return (
        <AuthLayout
            icon={Car}
            title="Buat Akun Pelanggan"
            subtitle="Daftar untuk menikmati kemudahan parkir mandiri"
            accent={CUSTOMER_ACCENT}
            onBack={onBack}
            footer={
                <>
                    Sudah punya akun?{' '}
                    <button
                        onClick={onNavigateToLogin}
                        className={`font-semibold transition-colors ${CUSTOMER_ACCENT.link}`}
                    >
                        Login di sini
                    </button>
                </>
            }
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <div className="bg-rose-50 border border-rose-100 text-rose-600 text-sm px-4 py-3 rounded-xl flex items-start gap-2.5">
                        <AlertCircle size={16} className="shrink-0 mt-0.5" />
                        <span>{error}</span>
                    </div>
                )}

                {/* Nama Lengkap */}
                <div>
                    <label className="block text-xs font-semibold text-[#475467] uppercase tracking-wider mb-2">
                        Nama Lengkap
                    </label>
                    <div className="relative">
                        <User size={18} className={`absolute left-4 top-1/2 -translate-y-1/2 ${iconColor}`} />
                        <input
                            type="text"
                            placeholder="Sesuai identitas resmi"
                            value={formData.name}
                            onChange={handleChange('name')}
                            className={`w-full pl-11 pr-4 py-3.5 rounded-xl text-sm transition-all ${CUSTOMER_ACCENT.field}`}
                            required
                            autoComplete="name"
                        />
                    </div>
                </div>

                {/* Email */}
                <div>
                    <label className="block text-xs font-semibold text-[#475467] uppercase tracking-wider mb-2">
                        Email
                    </label>
                    <div className="relative">
                        <Mail size={18} className={`absolute left-4 top-1/2 -translate-y-1/2 ${iconColor}`} />
                        <input
                            type="email"
                            placeholder="nama@email.com"
                            value={formData.email}
                            onChange={handleChange('email')}
                            className={`w-full pl-11 pr-4 py-3.5 rounded-xl text-sm transition-all ${CUSTOMER_ACCENT.field}`}
                            required
                            autoComplete="email"
                        />
                    </div>
                </div>

                {/* No. HP */}
                <div>
                    <label className="block text-xs font-semibold text-[#475467] uppercase tracking-wider mb-2">
                        Nomor HP
                    </label>
                    <div className="relative">
                        <Phone size={18} className={`absolute left-4 top-1/2 -translate-y-1/2 ${iconColor}`} />
                        <input
                            type="tel"
                            placeholder="08xxxxxxxxxx"
                            value={formData.phone_number}
                            onChange={handleChange('phone_number')}
                            className={`w-full pl-11 pr-4 py-3.5 rounded-xl text-sm transition-all ${CUSTOMER_ACCENT.field}`}
                            required
                            autoComplete="tel"
                        />
                    </div>
                </div>

                {/* Plat Nomor */}
                <div>
                    <label className="block text-xs font-semibold text-[#475467] uppercase tracking-wider mb-2">
                        Plat Nomor Kendaraan
                    </label>
                    <div className="relative">
                        <Car size={18} className={`absolute left-4 top-1/2 -translate-y-1/2 ${iconColor}`} />
                        <input
                            type="text"
                            placeholder="K 141 KU"
                            value={formData.registered_plate_number}
                            onChange={(e) => setFormData((prev) => ({ ...prev, registered_plate_number: e.target.value.toUpperCase() }))}
                            className={`w-full pl-11 pr-4 py-3.5 rounded-xl text-sm transition-all font-mono uppercase tracking-widest ${CUSTOMER_ACCENT.field}`}
                            required
                        />
                    </div>
                    <p className="text-xs text-[#98A2B3] mt-1.5">Kendaraan ini akan terhubung otomatis dengan akun Anda saat tap-in.</p>
                </div>

                {/* Password */}
                <div>
                    <label className="block text-xs font-semibold text-[#475467] uppercase tracking-wider mb-2">
                        Password
                    </label>
                    <div className="relative">
                        <Lock size={18} className={`absolute left-4 top-1/2 -translate-y-1/2 ${iconColor}`} />
                        <input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Minimal 8 karakter"
                            value={formData.password}
                            onChange={handleChange('password')}
                            className={`w-full pl-11 pr-11 py-3.5 rounded-xl text-sm transition-all ${CUSTOMER_ACCENT.field}`}
                            required
                            minLength={8}
                            autoComplete="new-password"
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

                {/* Konfirmasi Password */}
                <div>
                    <label className="block text-xs font-semibold text-[#475467] uppercase tracking-wider mb-2">
                        Konfirmasi Password
                    </label>
                    <div className="relative">
                        <Lock size={18} className={`absolute left-4 top-1/2 -translate-y-1/2 ${iconColor}`} />
                        <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            placeholder="Ulangi password"
                            value={formData.password_confirmation}
                            onChange={handleChange('password_confirmation')}
                            className={`w-full pl-11 pr-11 py-3.5 rounded-xl text-sm transition-all ${confirmFieldClass}`}
                            required
                            autoComplete="new-password"
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword((prev) => !prev)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#98A2B3] hover:text-[#475467] transition-colors"
                            tabIndex={-1}
                            aria-label={showConfirmPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                        >
                            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                    {formData.password_confirmation && (
                        <p className={`text-xs mt-1.5 flex items-center gap-1.5 ${passwordsMatch ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {passwordsMatch ? <CheckCircle size={12} /> : <AlertCircle size={12} />}
                            {passwordsMatch ? 'Password cocok' : 'Password tidak cocok'}
                        </p>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full text-white font-bold py-3.5 rounded-xl transition-all mt-2 disabled:opacity-50 disabled:cursor-not-allowed ${CUSTOMER_ACCENT.btn} ${CUSTOMER_ACCENT.btnBusy}`}
                >
                    {isLoading ? 'Mendaftarkan...' : 'Daftar Sekarang'}
                </button>
            </form>
        </AuthLayout>
    );
};

export default RegisterCustomer;