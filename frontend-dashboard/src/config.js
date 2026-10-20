// Konfigurasi URL terpusat.
//
// Produksi (build Docker): URL relatif. Browser memanggil domain yang sama,
//   /api -> Laravel, /ai -> vision service, /app -> Reverb (WebSocket).
//   Semuanya diteruskan oleh reverse proxy (Caddy), jadi tidak ada masalah CORS
//   maupun mixed content.
// Dev (npm run dev): default lama dipertahankan (localhost:8000 dan :8001).
// Bisa dioverride lewat VITE_API_URL dan VITE_AI_URL.

const trimSlash = (s) => s.replace(/\/+$/, '');
const isDev = import.meta.env.DEV;

export const API_URL = trimSlash(
  import.meta.env.VITE_API_URL || (isDev ? 'http://localhost:8000/api' : '/api')
);

// Nama variabel VITE_AI_SERVICE_URL juga diterima (dipakai di docker-compose.prod.yml).
export const AI_URL = trimSlash(
  import.meta.env.VITE_AI_URL ||
    import.meta.env.VITE_AI_SERVICE_URL ||
    (isDev ? 'http://localhost:8001' : '/ai')
);

// Alamat halaman masuk admin dan staff. Tidak ditautkan dari halaman publik.
// Bisa diganti saat build: VITE_ADMIN_LOGIN_PATH=/masuk-xxxx
const cleanPath = (p, d) => { const v = (p || d).trim(); return v.startsWith('/') ? v : `/${v}`; };
export const ADMIN_LOGIN_PATH = cleanPath(import.meta.env.VITE_ADMIN_LOGIN_PATH, '/masuk-admin');
export const STAFF_LOGIN_PATH = cleanPath(import.meta.env.VITE_STAFF_LOGIN_PATH, '/masuk-staff');
