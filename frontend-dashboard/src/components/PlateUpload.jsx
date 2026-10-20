import React, { useRef, useState } from 'react';
import axios from 'axios';
import { ImagePlus, RefreshCcw } from 'lucide-react';
import { AI_URL } from '../config';
import { downscaleImage } from '../utils/camera';

/**
 * Tombol "Unggah foto" untuk membaca plat dari gambar.
 * onResult({ plate, score (0..1), data }) dipanggil bila plat terbaca.
 * onMessage(teks) dipanggil untuk pesan status/galat (opsional).
 */
export default function PlateUpload({ onResult, onMessage, disabled = false, className = '', label = 'Unggah foto' }) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState(null);
  const [msg, setMsg] = useState('');

  const say = (m) => { setMsg(m); onMessage?.(m); };

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // izinkan memilih file yang sama lagi
    if (!file) return;
    if (!file.type.startsWith('image/')) { say('File harus berupa gambar (JPG/PNG).'); return; }

    setBusy(true);
    say('');
    try {
      const blob = await downscaleImage(file);
      setPreview((old) => { if (old) URL.revokeObjectURL(old); return URL.createObjectURL(blob); });
      const form = new FormData();
      form.append('file', blob, 'upload.jpg');
      const res = await axios.post(`${AI_URL}/detect-image`, form, { timeout: 60000 });
      const data = res.data;
      if (data.status !== 'success') {
        say(data.message || 'Gambar tidak bisa diproses.');
      } else if (data.plate) {
        say('');
        onResult?.({ plate: data.plate, score: data.score, data });
      } else {
        const raw = data.raw_text?.length ? ` (teks terbaca OCR: ${data.raw_text.join(' | ')})` : '';
        say(`Plat tidak terbaca. Coba foto yang lebih dekat, tajam, dan tegak lurus ke plat.${raw}`);
      }
    } catch (err) {
      say(err.code === 'ECONNABORTED'
        ? 'Pemrosesan terlalu lama. Coba lagi.'
        : 'Gagal menghubungi layanan deteksi plat.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={className}>
      <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={disabled || busy}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-[13px] font-semibold
                   border border-[#E2E6EE] bg-white text-[#475467] hover:border-[#26468A]/40 hover:text-[#26468A]
                   transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#26468A]/30"
      >
        {busy ? <RefreshCcw size={15} className="animate-spin" /> : <ImagePlus size={15} />}
        {busy ? 'Membaca plat…' : label}
      </button>
      {preview && (
        <img src={preview} alt="Pratinjau foto" className="mt-3 w-full max-h-48 object-contain rounded-xl border border-[#E2E6EE] bg-[#0B1220]" />
      )}
      {msg && <p className="mt-2 text-[12px] font-medium text-rose-600">{msg}</p>}
    </div>
  );
}