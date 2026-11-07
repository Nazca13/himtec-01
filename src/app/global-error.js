'use client';

// Batas kesalahan terakhir: menangkap error yang terjadi di layout akar (error.js tidak menjangkaunya).
// Harus membawa <html> dan <body> sendiri dan tidak boleh bergantung pada CSS/komponen aplikasi.
export default function GlobalError({ reset }) {
  return (
    <html lang="id">
      <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif', background: '#f2f2f7', color: '#1c1c1e' }}>
        <main style={{ maxWidth: 480, margin: '0 auto', padding: '20vh 20px', textAlign: 'left' }}>
          <h1 style={{ fontSize: 28, margin: '0 0 8px' }}>Terjadi masalah</h1>
          <p style={{ color: '#636366', margin: '0 0 24px' }}>Aplikasi gagal dimuat. Coba lagi. Jika tetap gagal, periksa koneksi internet.</p>
          <button onClick={reset} style={{ minHeight: 52, padding: '0 24px', border: 0, borderRadius: 14, background: '#1565c0', color: '#fff', fontSize: 17, fontWeight: 600 }}>
            Coba lagi
          </button>
        </main>
      </body>
    </html>
  );
}
