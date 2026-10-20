import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

// Produksi: lewat reverse proxy di domain yang sama (wss://domain/app/...).
// Jadi host dan port default diambil dari alamat halaman, dan hanya
// VITE_REVERB_APP_KEY yang wajib diisi (harus sama dengan REVERB_APP_KEY di backend).
// Dev lokal (npm run dev): isi VITE_REVERB_HOST/PORT/SCHEME di .env seperti sebelumnya.
const isHttps = window.location.protocol === 'https:';
const scheme = import.meta.env.VITE_REVERB_SCHEME || (isHttps ? 'https' : 'http');
const defaultPort = window.location.port ? Number(window.location.port) : (isHttps ? 443 : 80);
const port = Number(import.meta.env.VITE_REVERB_PORT || defaultPort);

export const echo = new Echo({
    broadcaster: 'reverb',
    key: import.meta.env.VITE_REVERB_APP_KEY,
    wsHost: import.meta.env.VITE_REVERB_HOST || window.location.hostname,
    wsPort: port,
    wssPort: port,
    forceTLS: scheme === 'https',
    enabledTransports: ['ws', 'wss'],
});
