'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PiCheckCircleFill } from 'react-icons/pi';
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
    setBusy(true);
    setError('');
    const { ok, data } = await postJson('/api/auth/hubungkan', { kode });
    setBusy(false);
    if (ok) setNama(data.namaLansia);
    else setError(data.error || 'Gagal menghubungkan.');
  };

  // Setelah terhubung, tampilkan sapaan sebentar lalu masuk ke tiga tombol.
  useEffect(() => {
    if (!nama) return;
    const t = setTimeout(() => router.replace('/lansia'), 1800);
    return () => clearTimeout(t);
  }, [nama, router]);

  if (nama) {
    return (
      <AuthLayout title="HP ini sudah terhubung">
        <div className={styles.connected} role="status">
          <PiCheckCircleFill aria-hidden="true" />
          <strong>Halo, {nama}</strong>
          <p>Sebentar lagi tiga tombol muncul.</p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Hubungkan HP ini" lead="Masukkan kode dari keluarga. Cukup sekali; setelah itu HP ini langsung menampilkan tiga tombol.">
      <form className={styles.form} onSubmit={submit}>
        <div className={styles.field}>
          <label htmlFor="kode">Kode dari keluarga</label>
          <input id="kode" className={`${styles.input} ${styles.code}`} value={kode} onChange={(e) => setKode(e.target.value)} maxLength={12} autoCapitalize="characters" autoComplete="off" spellCheck={false} required />
        </div>
        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}
        <button className={styles.submit} disabled={busy || !kode.trim()}>
          {busy ? 'Menghubungkan' : 'Hubungkan HP ini'}
        </button>
      </form>
    </AuthLayout>
  );
}
