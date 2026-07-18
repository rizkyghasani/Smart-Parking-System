import React, { useState, useEffect } from 'react';
import { Clock, Activity, Monitor, LogOut } from 'lucide-react'; // 🌟 Tambahkan LogOut icon

const StaffDashboard = ({ onLogoutSuccess }) => { // 🌟 Terima props onLogoutSuccess

    const handleLogout = () => {
        localStorage.removeItem('staff_token');
        localStorage.removeItem('staff_user');
        onLogoutSuccess(); // Memicu setCurrentPage('user') di komponen induk
    };

  const [slots, setSlots] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);

  useEffect(() => {
    setSlots([
      { id: 1, code: 'A1', status: 'occupied' },
      { id: 2, code: 'A2', status: 'available' },
      { id: 3, code: 'A3', status: 'violation' },
      { id: 4, code: 'A4', status: 'available' },
    ]);
    setRecentTransactions([
      { id: 101, plate: 'K 141 KU', time: '16:05', status: 'Keluar' },
      { id: 102, plate: 'B 1234 XYZ', time: '15:50', status: 'Masuk' },
    ]);
  }, []);

  return (
    <div className="p-6 bg-slate-900 min-h-screen text-slate-200">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard Petugas</h1>
          <p className="text-slate-400 text-sm">Monitoring Gerbang Parkir Kampus</p>
        </div>
        
        {/* Header Actions */}
        <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 bg-slate-800 px-4 py-2 rounded-lg border border-slate-700">
              <Clock className="text-indigo-400" size={20} />
              <span className="font-mono font-bold text-white">
                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            
            {/* 🌟 Tombol Logout di Header */}
            <button 
                onClick={handleLogout}
                className="flex items-center gap-2 bg-rose-600/10 hover:bg-rose-600/20 text-rose-500 px-4 py-2 rounded-lg border border-rose-500/20 transition-all"
            >
                <LogOut size={18} />
                <span className="font-medium text-sm">Keluar</span>
            </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Monitor size={20} className="text-indigo-400" /> Status Slot Parkir
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {slots.map((slot) => (
              <div key={slot.id} className={`p-6 rounded-xl border ${
                slot.status === 'occupied' ? 'bg-rose-900/20 border-rose-500/30' : 
                slot.status === 'violation' ? 'bg-amber-900/20 border-amber-500/30' : 
                'bg-emerald-900/20 border-emerald-500/30'
              }`}>
                <div className="text-2xl font-black text-white">{slot.code}</div>
                <div className={`text-xs font-bold uppercase mt-2 ${
                  slot.status === 'occupied' ? 'text-rose-400' : 
                  slot.status === 'violation' ? 'text-amber-400' : 
                  'text-emerald-400'
                }`}>
                  {slot.status}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Activity size={20} className="text-indigo-400" /> Log Transaksi
          </h2>
          <div className="space-y-4">
            {recentTransactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-3 bg-slate-900 rounded-lg border border-slate-700">
                <div>
                  <div className="font-mono text-white font-bold">{tx.plate}</div>
                  <div className="text-xs text-slate-500">{tx.time}</div>
                </div>
                <span className={`text-xs px-2 py-1 rounded ${
                  tx.status === 'Masuk' ? 'bg-blue-500/20 text-blue-400' : 'bg-rose-500/20 text-rose-400'
                }`}>
                  {tx.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;