// Pesan error yang bisa ditindaklanjuti untuk kesalahan konfigurasi server; selain itu pakai pesan umum.
export function pesanServer(error, fallback) {
  const msg = String(error?.message ?? '');
  if (msg.includes('SESSION_SECRET')) return 'Server belum siap: SESSION_SECRET belum diisi di .env.';
  if (error?.name === 'PrismaClientInitializationError' || /Can't reach database|P1001|P1000|authentication failed/i.test(msg)) {
    return 'Server tidak terhubung ke database. Periksa DATABASE_URL di .env.';
  }
  return fallback;
}

// Input dari klien tidak valid (HTTP 400). Dilempar oleh service, ditangkap route handler.
export class ValidationError extends Error {}
