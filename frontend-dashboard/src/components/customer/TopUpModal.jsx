import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Wallet, X, CheckCircle, AlertTriangle, Loader2, Banknote, QrCode, CreditCard } from 'lucide-react';
import { formatRupiah } from '../../utils/formatRupiah';

const MIN_AMOUNT = 20000;
const MAX_AMOUNT = 2000000;

const PRESET_AMOUNTS = [20000, 50000, 100000, 200000];

const PAYMENT_METHODS = [
    { value: 'virtual_account', label: 'Virtual Account', desc: 'Transfer bank', Icon: Banknote },
    { value: 'qris', label: 'QRIS', desc: 'Scan kode QR', Icon: QrCode },
    { value: 'debit_card', label: 'Kartu Debit', desc: 'Pembayaran kartu', Icon: CreditCard },
];

const TopUpModal = ({ isOpen, onClose, onSuccess, notice }) => {
    const [step, setStep] = useState('form'); // 'form' | 'pay' | 'result'
    const [amount, setAmount] = useState('');
    const [method, setMethod] = useState('qris');
    const [topupId, setTopupId] = useState(null);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState(null);
    const [result, setResult] = useState(null);

    useEffect(() => {
        if (isOpen) {
            setStep('form');
            setAmount('');
            setMethod('qris');
            setTopupId(null);
            setError(null);
            setResult(null);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const numericAmount = Number(amount || 0);

    const validateAmount = () => {
        if (!numericAmount || numericAmount < MIN_AMOUNT || numericAmount > MAX_AMOUNT) {
            setError(`Nominal top-up harus antara ${formatRupiah(MIN_AMOUNT)} hingga ${formatRupiah(MAX_AMOUNT)}.`);
            return false;
        }
        setError(null);
        return true;
    };

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
    const token = localStorage.getItem('customer_token');

    const handlePreset = (value) => {
        setAmount(String(value));
        setError(null);
    };

    const handleInitiate = async () => {
        if (!validateAmount()) return;
        setProcessing(true);
        setError(null);
        try {
            const res = await axios.post(`${API_URL}/customer/topup/initiate`, {
                amount: numericAmount,
                payment_method: method,
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTopupId(res.data.data.topup.id);
            setStep('pay');
        } catch (err) {
            setError(err.response?.data?.message || 'Gagal membuat transaksi top-up.');
        } finally {
            setProcessing(false);
        }
    };

    const handleConfirm = async (status) => {
        setProcessing(true);
        setError(null);
        try {
            const res = await axios.post(`${API_URL}/customer/topup/${topupId}/confirm`, {
                status,
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setResult({ status, balance: res.data.data.balance, message: res.data.message });
            setStep('result');
            if (onSuccess) onSuccess(res.data.data.balance);
        } catch (err) {
            setError(err.response?.data?.message || 'Gagal memproses pembayaran.');
        } finally {
            setProcessing(false);
        }
    };

    const inputCls =
        'w-full h-12 px-4 rounded-xl bg-white border border-[#E2E6EE] text-[#101828] font-bold text-lg outline-none focus:border-[#26468A] focus:ring-2 focus:ring-[#26468A]/20 transition-all';

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#101828]/50 backdrop-blur-sm p-4"
            onClick={onClose}
        >
            <div
                className="relative w-full max-w-md bg-white border border-[#E2E6EE] rounded-3xl shadow-xl p-6 text-[#101828]"
                onClick={(e) => e.stopPropagation()}
                style={{ fontFamily: "'Manrope', sans-serif" }}
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-[#98A2B3] hover:text-[#101828] transition-colors"
                >
                    <X size={18} />
                </button>

                <div className="flex items-center gap-3 mb-5">
                    <div className="p-2.5 rounded-2xl bg-[#26468A]/10">
                        <Wallet size={22} className="text-[#26468A]" />
                    </div>
                    <div>
                        <p className="text-[13px] text-[#667085] font-medium">
                            Saldo e-wallet
                        </p>
                        <p className="text-lg font-bold tracking-tight text-[#101828]">
                            Top-Up Saldo
                        </p>
                    </div>
                </div>

                {notice && (
                    <div className="mb-4 bg-[#C97A1D]/10 border border-[#C97A1D]/30 px-4 py-3 rounded-xl flex items-start gap-3">
                        <AlertTriangle size={18} className="text-[#C97A1D] flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-[#667085] font-medium leading-relaxed">{notice}</p>
                    </div>
                )}

                {error && (
                    <div className="mb-4 bg-rose-50 border border-rose-200 px-4 py-3 rounded-xl flex items-start gap-2.5">
                        <AlertTriangle size={16} className="text-rose-600 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-rose-600 font-medium">{error}</p>
                    </div>
                )}

                {step === 'form' && (
                    <>
                        <p className="text-xs text-[#667085] font-bold uppercase tracking-widest mb-2">Nominal top-up</p>
                        <div className="grid grid-cols-4 gap-2 mb-3">
                            {PRESET_AMOUNTS.map((p) => (
                                <button
                                    key={p}
                                    onClick={() => handlePreset(p)}
                                    className={`py-2.5 rounded-xl text-xs font-bold transition-all border ${Number(amount) === p ? 'bg-[#26468A] text-white border-[#26468A] shadow-md shadow-[#26468A]/20' : 'bg-[#F3F5F9] text-[#475467] border-[#E2E6EE] hover:border-[#26468A]/40'}`}
                                >
                                    {p / 1000}rb
                                </button>
                            ))}
                        </div>
                        <input
                            type="number"
                            min={MIN_AMOUNT}
                            max={MAX_AMOUNT}
                            placeholder={`min ${formatRupiah(MIN_AMOUNT)}`}
                            value={amount}
                            onChange={(e) => { setAmount(e.target.value); setError(null); }}
                            className={inputCls}
                        />
                        <p className="mt-1.5 text-[11px] text-[#98A2B3] font-medium">
                            Minimal {formatRupiah(MIN_AMOUNT)} • Maksimal {formatRupiah(MAX_AMOUNT)}
                        </p>

                        <p className="text-xs text-[#667085] font-bold uppercase tracking-widest mt-5 mb-2">Metode pembayaran</p>
                        <div className="space-y-2">
                            {PAYMENT_METHODS.map(({ value, label, desc, Icon }) => (
                                <button
                                    key={value}
                                    onClick={() => setMethod(value)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left ${method === value ? 'border-[#26468A] bg-[#26468A]/5 ring-2 ring-[#26468A]/20' : 'border-[#E2E6EE] bg-white hover:border-[#26468A]/40'}`}
                                >
                                    <div className={`p-2 rounded-lg ${method === value ? 'bg-[#26468A] text-white' : 'bg-[#F3F5F9] text-[#667085]'}`}>
                                        <Icon size={18} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-bold text-[#101828]">{label}</p>
                                        <p className="text-[11px] text-[#98A2B3] font-medium">{desc}</p>
                                    </div>
                                    <div className={`w-4 h-4 rounded-full border-2 ${method === value ? 'border-[#26468A] bg-[#26468A]' : 'border-[#C1C9D4]'}`} />
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={handleInitiate}
                            disabled={processing}
                            className="mt-6 w-full py-3.5 rounded-2xl font-bold text-sm text-white bg-[#26468A] hover:bg-[#1d3872] transition-colors shadow-lg shadow-[#26468A]/20 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {processing ? <Loader2 size={18} className="animate-spin" /> : <Wallet size={18} />}
                            {processing ? 'Memproses...' : 'Inisiasi Top-Up'}
                        </button>
                    </>
                )}

                {step === 'pay' && (
                    <>
                        <div className="bg-[#F3F5F9] rounded-2xl border border-[#E2E6EE] p-4 mb-4 space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-[#667085]">Nominal</span>
                                <span className="font-black text-lg text-[#101828]">{formatRupiah(numericAmount)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-[#667085]">Metode</span>
                                <span className="font-semibold text-[#101828]">
                                    {PAYMENT_METHODS.find((m) => m.value === method)?.label}
                                </span>
                            </div>
                            <div className="border-t border-[#E2E6EE] pt-3 bg-[#26468A]/5 rounded-xl px-3 py-2.5">
                                <p className="text-[11px] text-[#26468A] font-bold uppercase tracking-widest mb-1">Simulasi pembayaran</p>
                                <p className="text-[11px] text-[#667085] font-medium leading-relaxed">
                                    Dalam sistem riil, kode pembayaran akan ditampilkan di sini (VA/QRIS). Untuk skripsi, pilih status pembayaran.
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={() => handleConfirm('success')}
                            disabled={processing}
                            className="w-full py-3.5 rounded-2xl font-bold text-sm text-white bg-emerald-600 hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {processing ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} />}
                            {processing ? 'Memproses...' : 'Konfirmasi Berhasil'}
                        </button>
                        <button
                            onClick={() => handleConfirm('failed')}
                            disabled={processing}
                            className="w-full mt-2.5 py-2 rounded-xl text-[11px] font-bold uppercase tracking-widest text-rose-600/80 hover:text-rose-600 hover:bg-rose-50 transition-all flex items-center justify-center gap-1.5"
                        >
                            <AlertTriangle size={13} /> Simulasi Gagal
                        </button>
                    </>
                )}

                {step === 'result' && (
                    <>
                        <div className={`rounded-2xl border p-6 text-center mb-4 ${result?.status === 'success' ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'}`}>
                            <div className={`mx-auto w-14 h-14 rounded-2xl flex items-center justify-center ${result?.status === 'success' ? 'bg-emerald-600 shadow-emerald-600/30' : 'bg-rose-600 shadow-rose-600/30'} shadow-lg mb-3`}>
                                {result?.status === 'success'
                                    ? <CheckCircle size={28} className="text-white" />
                                    : <AlertTriangle size={28} className="text-white" />}
                            </div>
                            <p className={`font-black text-lg ${result?.status === 'success' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                {result?.status === 'success' ? 'Top-Up Berhasil' : 'Pembayaran Gagal'}
                            </p>
                            <p className="text-xs text-[#667085] font-medium mt-1.5 leading-relaxed">
                                {result?.message}
                            </p>
                            <div className="mt-4 pt-4 border-t border-[#E2E6EE] flex justify-between items-center">
                                <span className="text-xs text-[#667085] font-bold uppercase tracking-widest">Saldo saat ini</span>
                                <span className="font-black text-xl text-[#101828]">{formatRupiah(result?.balance)}</span>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-full py-3.5 rounded-2xl font-bold text-sm text-white bg-[#26468A] hover:bg-[#1d3872] transition-colors shadow-lg shadow-[#26468A]/20"
                        >
                            Selesai
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default TopUpModal;