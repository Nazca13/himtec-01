'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { mintaIzinLokasi } from '@/lib/geo';
import { postJson } from '@/lib/http';
import AuthLayout from './AuthLayout';
import styles from './forms.module.css';

// Dibuka di HP nenek atau kakek. Dari link WhatsApp, kode sudah terisi: cukup satu ketukan.
export default function HubungkanLansia({ kodeAwal = '' }) {
  const router = useRouter();
  const [kode, setKode] = useState(kodeAwal);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [nama, setNama] = useState(null); // terisi saat berhasil

  const submit = async (e) => {
    e.preventDefault();
    if (!kode.trim()) return setError('Isi kode dari keluarga dulu.');
    setBusy(true);
    setError('');
    const { ok, data } = await postJson('/api/auth/hubungkan', { kode });
    setBusy(false);
    if (ok) setNama(data.namaLansia);
    else setError(data.error || 'Gagal menghubungkan.');
  };

  // Setelah terhubung: minta izin lokasi sekali (agar keluarga tahu posisi saat darurat), lalu masuk ke tiga tombol.
  useEffect(() => {
    if (!nama) return;
    let t;
    mintaIzinLokasi().finally(() => {
      t = setTimeout(() => router.replace('/lansia'), 900);
    });
    return () => clearTimeout(t);
  }, [nama, router]);

  if (nama) {
    return (
      <AuthLayout mood="senang" title="HP ini sudah terhubung">
        <div className={styles.connected} role="status">
          <strong>Halo, {nama}</strong>
          <p>Jika muncul pertanyaan izin lokasi, pilih Izinkan. Keluarga jadi tahu posisi saat tombol ditekan. Sebentar lagi tiga tombol muncul.</p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Peduli hari ini, untuk mereka nanti" lead="Masukkan kode HP dari admin keluarga. Cukup sekali; setelah itu HP ini langsung siap digunakan orang tua setiap hari.">
      <form className={styles.form} onSubmit={submit}>
        <div className={styles.field}>
          <label htmlFor="kode">Kode HP dari keluarga</label>
          <input id="kode" className={`${styles.input} ${styles.code}`} value={kode} onChange={(e) => setKode(e.target.value)} maxLength={12} autoCapitalize="characters" autoComplete="off" spellCheck={false} required />
        </div>
        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}
        <button className={styles.submit} disabled={busy}>
          {busy ? 'Menghubungkan' : 'Hubungkan HP ini'}
        </button>
      </form>
    </AuthLayout>
  );
}
