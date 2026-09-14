const WIB_OFFSET = '+07:00';

const toDate = (str) => {
    if (!str) return null;
    if (/Z|[+-]\d{2}:\d{2}$/.test(str)) {
        const d = new Date(str);
        return isNaN(d.getTime()) ? null : d;
    }
    const isDateOnly = /^\d{4}-\d{2}-\d{2}$/.test(str);
    const iso = isDateOnly ? `${str}T00:00:00${WIB_OFFSET}` : `${String(str).replace(' ', 'T')}${WIB_OFFSET}`;
    const d = new Date(iso);
    return isNaN(d.getTime()) ? null : d;
};

export const parseWib = (str) => toDate(str);

const formatWib = (str, opts) => {
    const d = toDate(str);
    if (!d) return '-';
    return d.toLocaleString('id-ID', { timeZone: 'Asia/Jakarta', ...opts });
};

export const wibTime = (str, opts = { hour: '2-digit', minute: '2-digit' }) =>
    formatWib(str, opts);

export const wibDate = (str, opts = { day: '2-digit', month: 'short', year: 'numeric' }) =>
    formatWib(str, opts);

export const wibDateTime = (str, opts = {}) =>
    formatWib(str, {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        ...opts,
    });

const toWibDateString = (date) =>
    new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Jakarta',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).format(date);

export const todayWib = () => toWibDateString(new Date());

export const dateToWibString = (str) => toWibDateString(toDate(str) || new Date());

export const addDaysWib = (dateStr, days) => {
    const base = toDate(dateStr);
    if (!base) return dateStr;
    base.setUTCDate(base.getUTCDate() + days);
    return toWibDateString(base);
};

export const monthFirstWib = () => {
    const parts = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Jakarta',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).formatToParts(new Date());
    const get = (t) => parts.find((p) => p.type === t)?.value;
    return `${get('year')}-${get('month')}-01`;
};