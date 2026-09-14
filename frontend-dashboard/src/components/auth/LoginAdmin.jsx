import React, { useState } from 'react';
import axios from 'axios';
import { ShieldCheck } from 'lucide-react';
import AuthLayout, { ADMIN_ACCENT } from './AuthLayout';

const LoginAdmin = ({ onLoginSuccess, onNavigateToRegister, onBackToUser }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    
    // 🛠️ Tambahan State Baru
    const [showPassword, setShowPassword] = useState(false); // Toggle lihat password
    const [rememberMe, setRememberMe] = useState(false);     // State remember me
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');

        // 🛡️ 1. Validasi Frontend: Wajib minimal 8 karakter sebelum tembak API
        if (password.length < 8) {
            setErrorMessage('Password harus memiliki minimal 8 karakter.');
            return;
        }

        setLoading(true);

        // Gunakan FormData agar payload konsisten dibaca Laravel
        const formData = new FormData();
        formData.append('email', email);
        formData.append('password', password);
        formData.append('remember', rememberMe ? '1' : '0'); // Dikirim sebagai flag string ke backend

    // Pasang Axios dengan kredensial agar kuki session/remember me bisa disimpan browser
    try {
        const response = await axios.post('http://localhost:8000/api/admin/auth/login', formData, {
            withCredentials: true
        });

            if (response.data.success) {
                localStorage.setItem('admin_token', response.data.data.token);
                localStorage.setItem('admin_user', JSON.stringify(response.data.data.user));
                onLoginSuccess();
            }
        } catch (error) {
            const validationErrors = error.response?.data?.errors;
            if (validationErrors) {
                const errorMessages = Object.values(validationErrors).flat().join(' ');
                setErrorMessage(errorMessages);
            } else {
                setErrorMessage(error.response?.data?.message || 'Login gagal, periksa kembali kredensial Anda.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout
            icon={ShieldCheck}
            title="Sign In Administrator"
            subtitle="Dashboard Admin Panel"
            accent={ADMIN_ACCENT}
            onBack={onBackToUser}
            backLabel="Kembali ke Monitor Parkir"
            footer={
                <>
                    Belum memiliki akun?{' '}
                    <button onClick={onNavigateToRegister} className={`font-semibold transition-colors ${ADMIN_ACCENT.link}`}>
                        Daftar Admin Baru
                    </button>
                </>
            }
        >
            {errorMessage && (
                <div className="mb-4 p-3 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl text-xs font-medium">
                    ⚠️ {errorMessage}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-xs font-semibold text-[#475467] uppercase tracking-wider mb-2">Email Address</label>
                    <input 
                        type="email" 
                        required 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={`w-full px-4 py-3 rounded-xl text-sm transition-all ${ADMIN_ACCENT.field}`} 
                        placeholder="Enter your email here.." 
                    />
                </div>
                
                <div>
                    <label className="block text-xs font-semibold text-[#475467] uppercase tracking-wider mb-2">Password</label>
                    <div className="relative">
                        <input 
                            type={showPassword ? 'text' : 'password'} 
                            required 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={`w-full px-4 py-3 rounded-xl pr-20 text-sm transition-all ${ADMIN_ACCENT.field}`} 
                            placeholder="••••••••" 
                        />
                        {/* 👁️ TOMBOL LIHAT PASSWORD */}
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-[#98A2B3] hover:text-[#475467] transition-colors"
                        >
                            {showPassword ? 'SEMBUNYI' : 'LIHAT'}
                        </button>
                    </div>
                </div>

                {/* 🗹 CHECKBOX REMEMBER ME */}
                <div className="flex items-center space-x-2 py-1">
                    <input 
                        type="checkbox" 
                        id="remember"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 rounded accent-[#2E5FA3] cursor-pointer"
                    />
                    <label htmlFor="remember" className="text-xs text-[#475467] select-none cursor-pointer transition-colors">
                        Remember Me
                    </label>
                </div>
                
                <button 
                    type="submit" 
                    disabled={loading}
                    className={`w-full text-white font-bold py-3 rounded-xl text-sm mt-2 transition-all ${ADMIN_ACCENT.btn} ${ADMIN_ACCENT.btnBusy}`}
                >
                    {loading ? 'Memvalidasi Kredensial...' : 'Masuk ke Panel'}
                </button>
            </form>
        </AuthLayout>
    );
};

export default LoginAdmin;