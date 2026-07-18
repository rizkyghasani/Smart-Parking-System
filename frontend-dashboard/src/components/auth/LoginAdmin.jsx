import React, { useState } from 'react';
import axios from 'axios';

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
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative font-sans">
            <button 
                onClick={onBackToUser}
                className="absolute top-6 left-6 text-slate-400 hover:text-white text-sm font-medium flex items-center space-x-1 transition-all"
            >
                <span>&larr;</span> <span>Kembali ke Monitor Parkir</span>
            </button>

            <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl w-full max-w-md shadow-xl">
                <div className="text-center mb-8">
                    <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white text-xl mx-auto mb-3 shadow-md shadow-blue-600/20">
                        P
                    </div>
                    <h2 className="text-2xl font-bold text-white">Sign In Administrator</h2>
                    <p className="text-slate-400 text-sm mt-1">Dashboard Admin Panel</p>
                </div>

                {errorMessage && (
                    <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs font-medium">
                        ⚠️ {errorMessage}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
                        <input 
                            type="email" 
                            required 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 transition-all" 
                            placeholder="Enter your email here.." 
                        />
                    </div>
                    
                    <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Password</label>
                        <div className="relative">
                            <input 
                                type={showPassword ? 'text' : 'password'} 
                                required 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-4 pr-12 py-3 text-sm text-white focus:outline-none focus:border-blue-500 transition-all" 
                                placeholder="••••••••" 
                            />
                            {/* 👁️ TOMBOL LIHAT PASSWORD */}
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500 hover:text-slate-300 transition-colors"
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
                            className="w-4 h-4 rounded bg-slate-950 border-slate-800 text-blue-600 focus:ring-0 focus:ring-offset-0 accent-blue-600 cursor-pointer"
                        />
                        <label htmlFor="remember" className="text-xs text-slate-400 select-none cursor-pointer hover:text-slate-300 transition-colors">
                            Remember Me
                        </label>
                    </div>
                    
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white font-medium py-3 rounded-xl text-sm mt-2 shadow-lg shadow-blue-600/10 transition-all"
                    >
                        {loading ? 'Memvalidasi Kredensial...' : 'Masuk ke Panel'}
                    </button>
                </form>

                <div className="text-center mt-6 pt-6 border-t border-slate-800 text-sm">
                    <span className="text-slate-500">Belum memiliki akun? </span>
                    <button onClick={onNavigateToRegister} className="text-blue-400 hover:text-blue-300 font-medium transition-all">
                        Daftar Admin Baru
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LoginAdmin;