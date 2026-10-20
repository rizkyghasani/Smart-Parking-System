// =============================================================
// Sesi login PER TAB (sessionStorage) dan per peran.
// - Admin, staff, dan customer bisa login bersamaan di tab berbeda tanpa saling menimpa.
// - Refresh satu tab hanya memengaruhi tab itu.
// - Peran halaman ditentukan oleh URL (/admin, /staff, /customer), bukan oleh token mana yang ada.
// =============================================================
import axios from 'axios';
import { API_URL, ADMIN_LOGIN_PATH, STAFF_LOGIN_PATH } from '../config';

export const ROLES = ['admin', 'staff', 'customer'];

export const LOGIN_PATH = {
  admin: ADMIN_LOGIN_PATH,
  staff: STAFF_LOGIN_PATH,
  customer: '/customer/masuk',
};

const safe = (fn, fallback = null) => { try { return fn(); } catch { return fallback; } };

export const getToken = (role) => safe(() => sessionStorage.getItem(`${role}_token`));

export const clearSession = (role) => safe(() => {
  sessionStorage.removeItem(`${role}_token`);
  sessionStorage.removeItem(`${role}_user`);
});

// Peran halaman yang sedang dibuka, berdasarkan URL.
export const roleFromPath = (path = window.location.pathname) => {
  if (path === '/admin' || path.startsWith('/admin/') || path === ADMIN_LOGIN_PATH) return 'admin';
  if (path === '/staff' || path.startsWith('/staff/') || path === STAFF_LOGIN_PATH) return 'staff';
  if (path === '/customer' || path.startsWith('/customer/')) return 'customer';
  return null;
};

// Peran yang dituju sebuah request API, berdasarkan URL-nya.
const roleFromApiUrl = (url = '') => {
  const m = url.match(/\/api\/(admin|staff|customer)\b/) || url.match(/^\/?(admin|staff|customer)\b/);
  if (m) return m[1];
  if (url.includes('/auth/me')) return roleFromPath();
  return null;
};

let installed = false;
let unauthorizedHandler = null;
export const setUnauthorizedHandler = (fn) => { unauthorizedHandler = fn; };

// Dipanggil sekali saat modul dimuat, SEBELUM komponen anak mengirim request.
export function installAxiosAuth() {
  if (installed) return;
  installed = true;
  // Tidak ada header Authorization global: token dipilih per request.
  delete axios.defaults.headers.common['Authorization'];

  axios.interceptors.request.use((config) => {
    if (!config.headers?.Authorization && !config.headers?.get?.('Authorization')) {
      const role = roleFromApiUrl(config.url || '') || (String(config.url).startsWith(API_URL) ? roleFromPath() : null);
      const token = role && getToken(role);
      if (token) config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  axios.interceptors.response.use(
    (res) => res,
    (error) => {
      const status = error.response?.status;
      const url = error.config?.url || '';
      const isLogin = /\/(login|register)\b/.test(url);
      const role = roleFromApiUrl(url);
      // Token kedaluwarsa/dicabut: bersihkan sesi peran itu dan arahkan ke halaman masuk.
      if (status === 401 && role && !isLogin && getToken(role)) {
        clearSession(role);
        unauthorizedHandler?.(role);
      }
      return Promise.reject(error);
    }
  );
}

// Cek ke server: token valid DAN perannya cocok.
export async function verifyRole(role) {
  const token = getToken(role);
  if (!token) return { ok: false, reason: 'no-token' };
  try {
    const res = await axios.get(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const user = res.data?.data;
    if (user?.role !== role) { clearSession(role); return { ok: false, reason: 'wrong-role' }; }
    return { ok: true, user };
  } catch (e) {
    if (e.response?.status === 401) { clearSession(role); return { ok: false, reason: 'invalid' }; }
    return { ok: false, reason: 'network' };
  }
}
