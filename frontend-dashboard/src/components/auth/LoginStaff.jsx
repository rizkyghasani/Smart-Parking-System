import React, { useState } from 'react';
import axios from 'axios';

const LoginStaff = ({ onLoginSuccess, onBackToMain }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');

        // Validasi minimal 8 karakter sesuai standar keamanan sistem
        if (password.length < 8) {
            setErrorMessage('Password petugas harus minimal 8 karakter.');
            return;
        }

        setLoading(true);

        const formData = new FormData();
        formData.append('email', email);
        formData.append('password', password);
        // Default tanpa remember me untuk pos petugas lapangan demi keamanan bersama
        formData.append('remember', '0'); 

        try {
            // Menembak endpoint login yang sama di backend
            const response = await axios.post('http://localhost:8000/api/admin/auth/login', formData);

            if (response.data.success) {
                const userRole = response.data.data.user.role;

                // Validasi Hak Akses: Pastikan yang login ke sini benar-benar ber-role staff
                if (userRole !== 'staff') {
                    setErrorMessage('Akses ditolak. Form ini khusus untuk Petugas Lapangan.');
                    return;
                }

                // Simpan token Bearer dan objek data staff ke localStorage browser
                localStorage.setItem('staff_token', response.data.data.token);
                localStorage.setItem('staff_user', JSON.stringify(response.data.data.user));
                
                alert(`👋 Selamat bertugas, ${response.data.data.user.name}!`);
                onLoginSuccess();
            }
        } catch (error) {
            // Menangkap respons error status 403 (Akun dinonaktifkan) atau 401 (Kredensial salah)
            setErrorMessage(error.response?.data?.message || 'Gagal masuk ke sistem petugas.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative font-sans">
            {/* Tombol kembali ke monitor sirkulasi utama */}
            <button 
                onClick={onBackToMain}
                className="absolute top-6 left-6 text-slate-400 hover:text-white text-sm font-medium flex items-center space-x-1 transition-all"
            >
                <span>&larr;</span> <span>Kembali ke Halaman Utama</span>
            </button>

            <div className="bg-white border border-gray-200 p-8 rounded-2xl w-full max-w-md shadow-xl text-slate-800">
                <div className="text-center mb-8">
                    <div className="w-12 h-12 rounded-xl bg-emerald-600 flex items-center justify-center font-bold text-white text-xl mx-auto mb-3 shadow-md shadow-emerald-600/20">
                        ⚙️
                    </div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">Portal Petugas Lapangan</h2>
                    <p className="text-gray-500 text-sm mt-1">Silakan masuk untuk mengelola sirkulasi kendaraan</p>
                </div>

                {errorMessage && (
                    <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-xs font-semibold">
                        ⚠️ {errorMessage}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Email Petugas</label>
                        <input 
                            type="email" 
                            required 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:border-emerald-600 transition-all font-medium" 
                            placeholder="Enter your email here.." 
                        />
                    </div>
                    
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Password Access</label>
                        <div className="relative">
                            <input 
                                type={showPassword ? 'text' : 'password'} 
                                required 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-slate-50 border border-gray-200 rounded-xl pl-4 pr-12 py-3 text-sm text-slate-800 focus:outline-none focus:border-emerald-600 transition-all font-medium" 
                                placeholder="••••••••" 
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                {showPassword ? 'SEMBUNYI' : 'LIHAT'}
                            </button>
                        </div>
                    </div>
                    
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-800 text-white font-bold py-3 rounded-xl text-sm mt-4 shadow-md shadow-emerald-600/10 transition-all uppercase tracking-wider"
                    >
                        {loading ? 'Memvalidasi Sesi...' : 'Mulai Bertugas'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginStaff;