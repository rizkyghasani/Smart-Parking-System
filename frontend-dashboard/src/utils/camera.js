// Membuka kamera dengan pengaturan yang ramah HP.
// - facing 'environment' = kamera belakang (menghadap plat), 'user' = kamera depan.
// - 'ideal' (bukan 'exact') supaya laptop tanpa kamera belakang tetap jalan.
export async function openCamera(facing = 'environment') {
  if (!navigator.mediaDevices?.getUserMedia) {
    const err = new Error('Kamera butuh koneksi HTTPS atau browser yang mendukung.');
    err.code = 'NO_API';
    throw err;
  }
  const base = { audio: false };
  try {
    return await navigator.mediaDevices.getUserMedia({
      ...base,
      video: { facingMode: { ideal: facing }, width: { ideal: 1280 }, height: { ideal: 720 } },
    });
  } catch (e) {
    // Perangkat tidak punya kamera yang diminta / batasan tidak terpenuhi: coba tanpa batasan.
    if (e.name === 'OverconstrainedError' || e.name === 'NotFoundError') {
      return navigator.mediaDevices.getUserMedia({ ...base, video: true });
    }
    throw e;
  }
}

export function cameraErrorMessage(e) {
  if (e?.code === 'NO_API') return 'Kamera hanya bisa dipakai lewat HTTPS. Buka alamat https:// situs ini.';
  switch (e?.name) {
    case 'NotAllowedError':
    case 'SecurityError':
      return 'Izin kamera ditolak. Aktifkan izin kamera untuk situs ini di pengaturan browser, lalu coba lagi.';
    case 'NotFoundError':
      return 'Kamera tidak ditemukan di perangkat ini.';
    case 'NotReadableError':
      return 'Kamera sedang dipakai aplikasi lain. Tutup aplikasi itu lalu coba lagi.';
    default:
      return 'Kamera tidak bisa dibuka.';
  }
}

// Perkecil foto (HP bisa 12 MP, 5 MB+) sebelum diunggah. Mengembalikan Blob JPEG.
export async function downscaleImage(file, maxSide = 1600, quality = 0.88) {
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  const k = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * k);
  canvas.height = Math.round(bitmap.height * k);
  canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close?.();
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Gagal memproses gambar'))), 'image/jpeg', quality)
  );
}
