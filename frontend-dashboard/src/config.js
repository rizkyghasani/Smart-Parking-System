// =============================================================
// Pusat konfigurasi URL & real-time.
// Nilai dibaca dari environment (Vite) dengan fallback ke localhost,
// sehingga kode yang sama dapat berjalan di lokal (dev) maupun
// produksi (domain VPS) tanpa mengubah source.
//
// Dev  : isi frontend-dashboard/.env
// Prod : isi frontend-dashboard/.env.production (lihat .env.production.example)
// =============================================================

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const AI_SERVICE_URL = import.meta.env.VITE_AI_SERVICE_URL || 'http://localhost:8001';

export const REVERB = {
    key: import.meta.env.VITE_REVERB_APP_KEY,
    host: import.meta.env.VITE_REVERB_HOST || '127.0.0.1',
    port: import.meta.env.VITE_REVERB_PORT ?? 8080,
    scheme: import.meta.env.VITE_REVERB_SCHEME ?? 'http',
};
