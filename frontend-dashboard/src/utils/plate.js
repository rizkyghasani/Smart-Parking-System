export const normalizePlate = (plate) =>
    String(plate || '')
        .toUpperCase()
        .replace(/[\s.\-]/g, '');