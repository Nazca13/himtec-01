'use client';

// Lokasi HP lansia untuk dikirim bersama kabar. Tidak pernah menahan pengiriman lebih dari ~3 detik:
// tombol DARURAT harus tetap cepat walau GPS lambat atau izin ditolak (kabar terkirim tanpa lokasi).
const SEGAR_MS = 5 * 60 * 1000;
let cache = null; // { latitude, longitude, akurasi, at }

function baca(timeout) {
  return new Promise((resolve) => {
    if (typeof navigator === 'undefined' || !('geolocation' in navigator)) return resolve(null);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        cache = { latitude: coords.latitude, longitude: coords.longitude, akurasi: coords.accuracy, at: Date.now() };
        resolve(cache);
      },
      () => resolve(null),
      { enableHighAccuracy: true, timeout, maximumAge: 60_000 }
    );
  });
}

// Dipanggil saat tombol ditekan: lokasi segar dari cache, atau tunggu GPS maksimal 3 detik.
export async function lokasiUntukKirim() {
  if (cache && Date.now() - cache.at < SEGAR_MS) return cache;
  return Promise.race([baca(3000), new Promise((r) => setTimeout(() => r(cache), 3200))]);
}

// Dipanggil saat app dibuka: ambil lokasi di latar belakang HANYA jika izin sudah diberikan (tanpa memunculkan dialog).
export async function panaskanLokasi() {
  try {
    const status = await navigator.permissions?.query({ name: 'geolocation' });
    if (status?.state === 'granted') baca(15_000);
  } catch {}
}

// Memunculkan dialog izin lokasi (dipakai sekali saat HP dihubungkan).
export const mintaIzinLokasi = () => baca(20_000);
