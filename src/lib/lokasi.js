// Lokasi dari HP lansia (Geolocation API). Input tidak tepercaya: hanya angka dalam rentang yang diterima.
// Mengembalikan kolom DailyRecord, atau {} jika tidak ada/tidak valid (kabar tetap tersimpan tanpa lokasi).
export function bersihkanLokasi(lokasi) {
  const lat = Number(lokasi?.latitude);
  const lng = Number(lokasi?.longitude);
  const akurasi = Number(lokasi?.akurasi);
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) return {};
  return { latitude: lat, longitude: lng, akurasiMeter: Number.isFinite(akurasi) && akurasi >= 0 ? Math.min(akurasi, 100_000) : null };
}
