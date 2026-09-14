import React, { useState } from 'react';
import axios from 'axios';
import { UserPlus } from 'lucide-react';
import AuthLayout, { ADMIN_ACCENT } from './AuthLayout';

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
        <AuthLayout
            icon={UserPlus}
            title="Registrasi Admin"
            subtitle="Buat akun kredensial administrator baru"
            accent={ADMIN_ACCENT}
            onBack={onNavigateToLogin}
            backLabel="Kembali ke Halaman Login"
            footer={
                <>
                    Sudah memiliki akun?{' '}
                    <button onClick={onNavigateToLogin} className={`font-semibold transition-colors ${ADMIN_ACCENT.link}`}>
                        Sign In di sini
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
                    <label className="block text-xs font-semibold text-[#475467] uppercase tracking-wider mb-2">Nama Lengkap</label>
                    <input 
                        type="text" 
                        required 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className={`w-full px-4 py-3 rounded-xl text-sm transition-all ${ADMIN_ACCENT.field}`} 
                        placeholder="Nama Admin" 
                    />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-[#475467] uppercase tracking-wider mb-2">Email Address</label>
                    <input 
                        type="email" 
                        required 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={`w-full px-4 py-3 rounded-xl text-sm transition-all ${ADMIN_ACCENT.field}`} 
                        placeholder="email@example.com" 
                    />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-[#475467] uppercase tracking-wider mb-2">Password</label>
                    <input 
                        type="password" 
                        required 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={`w-full px-4 py-3 rounded-xl text-sm transition-all ${ADMIN_ACCENT.field}`} 
                        placeholder="••••••••" 
                    />
                </div>

                <button 
                    type="submit" 
                    disabled={loading}
                    className={`w-full text-white font-bold py-3 rounded-xl text-sm mt-2 transition-all ${ADMIN_ACCENT.btn} ${ADMIN_ACCENT.btnBusy}`}
                >
                    {loading ? 'Memproses Pendaftaran...' : 'Daftar Sekarang'}
                </button>
            </form>
        </AuthLayout>
    );
};

export default RegisterAdmin;