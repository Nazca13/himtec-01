// Fitur yang dikendalikan variabel lingkungan.
// Mode demo (/demo): aktif di pengembangan; di produksi HARUS dinyalakan eksplisit (ENABLE_DEMO=true),
// karena /demo memberi siapa pun sesi admin pada keluarga contoh dan bisa mereset datanya.
export const demoAktif = () => (process.env.ENABLE_DEMO ? process.env.ENABLE_DEMO === 'true' : process.env.NODE_ENV !== 'production');
