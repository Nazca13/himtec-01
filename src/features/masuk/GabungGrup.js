'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { postJson } from '@/lib/http';
import AuthLayout from './AuthLayout';
import styles from './forms.module.css';

export default function GabungGrup({ kodeAwal = '' }) {
  const router = useRouter();
  const [nama, setNama] = useState('');
  const [kode, setKode] = useState(kodeAwal);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    const { ok, data } = await postJson('/api/auth/gabung', { nama, kode });
    if (ok) return router.replace('/pengawas');
    setBusy(false);
    setError(data.error || 'Gagal bergabung.');
  };

  return (
    <AuthLayout title="Gabung ke grup keluarga" lead="Minta kode keluarga dari anggota yang membuat grup. Kodenya ada di menu Keluarga.">
      <form className={styles.form} onSubmit={submit}>
        <div className={styles.field}>
          <label htmlFor="nama">Nama Anda</label>
          <input id="nama" className={styles.input} value={nama} onChange={(e) => setNama(e.target.value)} placeholder="Mis. Sari" maxLength={40} autoComplete="given-name" required />
        </div>
        <div className={styles.field}>
          <label htmlFor="kode">Kode keluarga</label>
          <input id="kode" className={`${styles.input} ${styles.code}`} value={kode} onChange={(e) => setKode(e.target.value)} maxLength={12} autoCapitalize="characters" autoComplete="off" spellCheck={false} required />
        </div>
        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}
        <button className={styles.submit} disabled={busy || !nama.trim() || !kode.trim()}>
          {busy ? 'Bergabung' : 'Gabung'}
        </button>
      </form>
    </AuthLayout>
  );
}
