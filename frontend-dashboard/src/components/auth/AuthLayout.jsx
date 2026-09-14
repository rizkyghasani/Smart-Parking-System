import React from 'react';
import { ArrowLeft } from 'lucide-react';

const FONT_STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@500;600;700&display=swap');
`;

// =============================================================
// Preset aksen per actor — semua string class LITERAL agar
// Tailwind dapat memindainya saat build. Langsung reusable
// untuk halaman login maupun register.
// =============================================================
export const ADMIN_ACCENT = {
    iconBg:    'bg-[#2E5FA3]/10',
    iconText:  'text-[#2E5FA3]',
    field:     'bg-white border-[#E2E6EE] text-[#101828] placeholder:text-[#98A2B3] focus:outline-none focus:border-[#2E5FA3] focus:ring-1 focus:ring-[#2E5FA3]/30',
    btn:       'bg-[#2E5FA3] hover:bg-[#244E87] shadow-md shadow-[#2E5FA3]/20',
    btnBusy:   'disabled:bg-[#244E87]',
    link:      'text-[#2E5FA3] hover:text-[#244E87]',
    backHover: 'hover:text-[#2E5FA3]',
};

export const STAFF_ACCENT = {
    iconBg:    'bg-[#C97A1D]/10',
    iconText:  'text-[#C97A1D]',
    field:     'bg-white border-[#E2E6EE] text-[#101828] placeholder:text-[#98A2B3] focus:outline-none focus:border-[#C97A1D] focus:ring-1 focus:ring-[#C97A1D]/30',
    btn:       'bg-[#C97A1D] hover:bg-[#b06a17] shadow-md shadow-[#C97A1D]/20',
    btnBusy:   'disabled:bg-[#b06a17]',
    link:      'text-[#C97A1D] hover:text-[#b06a17]',
    backHover: 'hover:text-[#C97A1D]',
};

export const CUSTOMER_ACCENT = {
    iconBg:    'bg-emerald-600/10',
    iconText:  'text-emerald-600',
    field:     'bg-white border-[#E2E6EE] text-[#101828] placeholder:text-[#98A2B3] focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30',
    btn:       'bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20',
    btnBusy:   'disabled:bg-emerald-700',
    link:      'text-emerald-600 hover:text-emerald-700',
    backHover: 'hover:text-emerald-600',
};

const AuthLayout = ({
    icon: Icon,
    title,
    subtitle,
    accent,
    onBack,
    backLabel = 'Kembali',
    children,
    footer
}) => {
    return (
        <div
            className="relative min-h-screen bg-[#F3F5F9] flex items-center justify-center p-5 overflow-hidden"
            style={{ fontFamily: "'Manrope', sans-serif" }}
        >
            <style>{FONT_STYLE}</style>

            {/* ── LAPISAN BACKGROUND: dashboard utama yang diburamkan ── */}
            <div className="absolute inset-0 pointer-events-none select-none" aria-hidden="true">
                <div className="absolute inset-0 bg-gradient-to-br from-[#F3F5F9] via-white to-[#26468A]/[0.06]" />

                {/* Blok kamera gelap (zona Live Entrance Camera) */}
                <div className="absolute -top-16 -left-24 w-[420px] h-[300px] bg-[#0B1220] rounded-[2.5rem] blur-2xl opacity-25 rotate-[6deg]" />
                <div className="absolute top-24 -left-10 w-[160px] h-[90px] bg-[#26468A] rounded-2xl blur-2xl opacity-30" />

                {/* Kartu putih (panel konsol & peta slot) */}
                <div className="absolute top-24 right-[-80px] w-[440px] h-[220px] bg-white rounded-[2.5rem] blur-3xl opacity-60" />
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[560px] h-[180px] bg-white rounded-[2.5rem] blur-3xl opacity-50" />

                {/* Blob amber (plat tak terdeteksi / scanning) */}
                <div className="absolute bottom-24 -left-20 w-[260px] h-[260px] bg-[#C97A1D] rounded-full blur-3xl opacity-25" />

                {/* Blob emerald (terbaca / member) */}
                <div className="absolute top-1/2 -right-24 w-[240px] h-[240px] bg-emerald-500 rounded-full blur-3xl opacity-[0.18]" />

                {/* Blob navy (aksen utama toolbar) */}
                <div className="absolute right-10 bottom-[-60px] w-[280px] h-[280px] bg-[#26468A] rounded-full blur-3xl opacity-20" />

                {/* Aksen garis topologi halus */}
                <div className="absolute top-6 right-8 flex gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#2E5FA3]/30" />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C97A1D]/30" />
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/30" />
                </div>
            </div>

            {/* Tombol kembali */}
            {onBack && (
                <button
                    onClick={onBack}
                    className={`absolute top-6 left-6 flex items-center gap-2 text-[13px] font-semibold text-[#475467] ${accent.backHover} transition-colors z-10`}
                >
                    <ArrowLeft size={16} /> {backLabel}
                </button>
            )}

            {/* Kartu frosted */}
            <div className="relative w-full max-w-md z-10">
                <div className="bg-white/80 backdrop-blur-xl border border-[#E2E6EE] rounded-3xl shadow-xl shadow-black/[0.06] p-8">
                    {Icon && (
                        <div className="text-center mb-7">
                            <div className={`w-12 h-12 mx-auto mb-4 p-3.5 rounded-2xl flex items-center justify-center ${accent.iconBg}`}>
                                <Icon size={26} strokeWidth={2.25} className={accent.iconText} />
                            </div>
                            <h2 className="text-[22px] font-bold text-[#101828] tracking-tight">{title}</h2>
                            {subtitle && <p className="text-sm text-[#98A2B3] mt-1.5">{subtitle}</p>}
                        </div>
                    )}

                    {children}
                </div>

                {footer && (
                    <p className="text-sm text-[#98A2B3] text-center mt-6">{footer}</p>
                )}
            </div>
        </div>
    );
};

export default AuthLayout;