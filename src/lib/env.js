// Validasi variabel lingkungan. Fungsi murni (mudah diuji); dipanggil sekali saat server start
// dari src/instrumentation.js. Di produksi, konfigurasi yang salah menghentikan server dengan pesan jelas,
// bukan membiarkan pengguna menemui error samar di tengah pemakaian.
const PLACEHOLDER = /\[[A-Z-]+\]|your_|isi_dengan/i;

export function validateEnv(env = process.env) {
  const errors = [];
  const warnings = [];

  const db = env.DATABASE_URL ?? '';
  if (!db) errors.push('DATABASE_URL belum diisi.');
  else if (!/^postgres(ql)?:\/\//.test(db)) errors.push('DATABASE_URL harus diawali postgresql://');
  else if (PLACEHOLDER.test(db)) errors.push('DATABASE_URL masih berisi placeholder ([PASSWORD], [REGION], ...). Ganti dengan nilai asli dari Supabase.');

  const secret = env.SESSION_SECRET ?? '';
  if (!secret) errors.push('SESSION_SECRET belum diisi. Buat dengan: openssl rand -base64 48');
  else if (secret.length < 32) errors.push('SESSION_SECRET terlalu pendek (minimal 32 karakter).');
  else if (PLACEHOLDER.test(secret)) errors.push('SESSION_SECRET masih berisi placeholder.');

  const orca = env.ORCA_API_KEY ?? '';
  if (!orca || PLACEHOLDER.test(orca)) warnings.push('ORCA_API_KEY belum diisi: fitur AI memakai teks cadangan.');

  if (env.NODE_ENV === 'production' && env.ENABLE_DEMO === 'true') warnings.push('ENABLE_DEMO=true: /demo aktif di produksi (publik, data contoh).');

  return { errors, warnings };
}
