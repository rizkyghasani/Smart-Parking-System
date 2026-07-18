import React, { useState, useEffect } from 'react';
import axios from 'axios';
//import { User, Car, ShieldCheck, History, LogOut } from 'lucide-react';
import { User, Car, ShieldCheck, History, LogOut, RefreshCw } from 'lucide-react';

const CustomerDashboard = ({ onLogoutSuccess }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🌟 1. Fungsi handleLogout untuk membersihkan token sebelum keluar
  const handleLogout = () => {
    localStorage.removeItem('customer_token');
    // localStorage.removeItem('customer_user'); // (Opsional)
    onLogoutSuccess();
  };

useEffect(() => {
    let customerId = null;

    const fetchData = async () => {
      try {
        const token = localStorage.getItem('customer_token');
        
        // 🌟 1. Cek dulu apakah token ada. Jika tidak, langsung tendang ke halaman login
        if (!token) {
          handleLogout();
          return;
        }

        const response = await axios.get('http://localhost:8000/api/customer/dashboard', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const dashboardData = response.data.data;
        setData(dashboardData);
        customerId = dashboardData.id || dashboardData.customer_id;

        if (window.echo && customerId) {
          window.echo.channel(`customer.${customerId}`)
            .listen('.MemberStatusUpdated', (e) => {
              setData(prevData => ({
                ...prevData,
                member: {
                  ...prevData?.member,
                  is_active: e.is_active,
                  expired_at: e.expired_at
                }
              }));
            });
        }

      } catch (err) {
        console.error("Gagal memuat dashboard:", err);
        
        // 🌟 2. TANGKAP ERROR 401: Jika token kedaluwarsa/ditolak server
        if (err.response && err.response.status === 401) {
          alert("Sesi Anda telah berakhir. Silakan login kembali.");
          handleLogout(); // Panggil fungsi logout untuk membersihkan token mati
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();

    return () => {
      if (window.echo && customerId) {
        window.echo.leaveChannel(`customer.${customerId}`);
      }
    };
  }, []);

  // Tambahkan state loading untuk tombol refresh
const [refreshing, setRefreshing] = useState(false);

const refreshMemberStatus = async () => {
      setRefreshing(true);
      try {
          const token = localStorage.getItem('customer_token');
          const response = await axios.get('http://localhost:8000/api/customer/dashboard', {
              headers: { Authorization: `Bearer ${token}` }
          });
          
          // Update hanya bagian member di dalam state data
          setData(prev => ({
              ...prev,
              member: response.data.data.member
          }));
      } catch (err) {
          alert("Gagal memperbarui status.");
      } finally {
          setRefreshing(false);
      }
  };

  if (loading) return <div className="p-10 bg-slate-900 min-h-screen text-white text-center flex items-center justify-center">Memuat profil Anda...</div>;
  if (!data) return (
    <div className="p-10 bg-slate-900 min-h-screen text-white text-center flex flex-col items-center justify-center">
        <p className="mb-4">Sesi tidak valid atau data gagal dimuat.</p>
        <button onClick={handleLogout} className="px-4 py-2 bg-rose-500 rounded-lg hover:bg-rose-600">
            Kembali ke Beranda
        </button>
    </div>
  );

  return (
    <div className="p-6 bg-slate-900 min-h-screen text-slate-200">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-white">Dashboard Pelanggan</h1>
        
        {/* Tombol Logout */}
        <button onClick={handleLogout} className="flex items-center gap-2 text-rose-400 hover:text-rose-300 transition-colors">
          <LogOut size={18} /> Keluar
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card Data Diri & Kendaraan */}
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><User size={20} className="text-indigo-400"/> Profil Anda</h2>
          <div className="space-y-3">
            <p>Nama: <span className="font-bold text-white">{data.name}</span></p>
            <p>Kontak: <span className="text-slate-400">{data.phone}</span></p>
            <div className="mt-4 p-3 bg-slate-900 rounded-lg flex items-center gap-3 border border-slate-700">
              <Car className="text-indigo-400" />
              <div>
                <p className="text-xs text-slate-500">Plat Kendaraan</p>
                <p className="font-mono font-bold tracking-widest text-white">{data.plate}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Card Membership */}
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
          <h2 className="text-lg font-semibold mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <ShieldCheck size={20} className={data.member?.is_active ? "text-emerald-400" : "text-rose-400"}/> 
                Status Membership
            </div>
            
            {/* 🌟 TOMBOL REFRESH KECIL */}
            <button 
                onClick={refreshMemberStatus} 
                disabled={refreshing}
                className={`p-1 rounded-full hover:bg-slate-700 transition-all ${refreshing ? 'animate-spin' : ''}`}
            >
                <RefreshCw size={16} className="text-slate-400" />
            </button>
        </h2>
          <div className="text-center py-4">
              {/* Logika Status Real-Time */}
              <div className={`font-black text-3xl ${data.member?.is_active ? 'text-emerald-400' : 'text-rose-400'}`}>
              {data.member 
                  ? (data.member.is_active ? 'Aktif' : 'Dinonaktifkan Admin') 
                  : 'Non-Member'
              }
              </div>
              
              {/* Pesan bantuan jika dinonaktifkan */}
              {!data.member?.is_active && data.member && (
              <p className="text-xs text-rose-300 mt-2 italic">
                  Mohon hubungi admin untuk aktivasi kembali.
              </p>
              )}
              
              <p className="text-sm text-slate-400 mt-2">
              Berlaku hingga: <span className="text-white">
                  {data.member?.expired_at 
                  ? new Date(data.member.expired_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) 
                  : '-'}
              </span>
              </p>
          </div>
        </div>
      </div>

      {/* Riwayat Transaksi */}
      <div className="mt-6 bg-slate-800 p-6 rounded-xl border border-slate-700">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><History size={20} className="text-indigo-400"/> Riwayat Parkir</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-slate-500 text-sm border-b border-slate-700">
                <th className="pb-2">Waktu Masuk</th>
                <th className="pb-2">Biaya</th>
                <th className="pb-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {data?.transactions?.length > 0 ? (
                data.transactions.map((tx) => (
                  <tr key={tx.id} className="border-b border-slate-700/50 hover:bg-slate-700/20">
                    <td className="py-3 font-mono text-sm">{new Date(tx.entry_time).toLocaleString('id-ID')}</td>
                    <td className="py-3">Rp {tx.fee?.toLocaleString('id-ID') || 0}</td>
                    <td className="py-3 text-emerald-400 text-sm">{tx.status}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="py-4 text-center text-slate-500 italic">Belum ada riwayat transaksi</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;