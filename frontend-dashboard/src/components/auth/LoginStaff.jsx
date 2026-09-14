import React, { useState } from 'react';
import axios from 'axios';
import { HardHat } from 'lucide-react';
import AuthLayout, { STAFF_ACCENT } from './AuthLayout';

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
        <AuthLayout
            icon={HardHat}
            title="Portal Petugas Lapangan"
            subtitle="Silakan masuk untuk mengelola sirkulasi kendaraan"
            accent={STAFF_ACCENT}
            onBack={onBackToMain}
            backLabel="Kembali ke Halaman Utama"
        >
            {errorMessage && (
                <div className="mb-4 p-3 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl text-xs font-semibold">
                    ⚠️ {errorMessage}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-xs font-bold text-[#475467] uppercase tracking-wider mb-2">Email Petugas</label>
                    <input 
                        type="email" 
                        required 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={`w-full px-4 py-3 rounded-xl text-sm transition-all font-medium ${STAFF_ACCENT.field}`} 
                        placeholder="Enter your email here.." 
                    />
                </div>
                
                <div>
                    <label className="block text-xs font-bold text-[#475467] uppercase tracking-wider mb-2">Password Access</label>
                    <div className="relative">
                        <input 
                            type={showPassword ? 'text' : 'password'} 
                            required 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={`w-full px-4 py-3 rounded-xl pr-20 text-sm transition-all font-medium ${STAFF_ACCENT.field}`} 
                            placeholder="••••••••" 
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-[#98A2B3] hover:text-[#475467] transition-colors"
                        >
                            {showPassword ? 'SEMBUNYI' : 'LIHAT'}
                        </button>
                    </div>
                </div>
                
                <button 
                    type="submit" 
                    disabled={loading}
                    className={`w-full text-white font-bold py-3 rounded-xl text-sm mt-4 transition-all uppercase tracking-wider ${STAFF_ACCENT.btn} ${STAFF_ACCENT.btnBusy}`}
                >
                    {loading ? 'Memvalidasi Sesi...' : 'Mulai Bertugas'}
                </button>
            </form>
        </AuthLayout>
    );
};

export default LoginStaff;