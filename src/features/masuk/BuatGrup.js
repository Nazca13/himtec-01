'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ShareCode from '@/components/ui/ShareCode';
import { postJson } from '@/lib/http';
import AuthLayout from './AuthLayout';
import styles from './forms.module.css';

export default function BuatGrup() {
  const router = useRouter();
  const [nama, setNama] = useState('');
  const [namaLansia, setNamaLansia] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [grup, setGrup] = useState(null); // diisi setelah grup dibuat

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    const { ok, data } = await postJson('/api/auth/buat', { nama, namaLansia });
    setBusy(false);
    if (ok) setGrup(data.household);
    else setError(data.error || 'Gagal membuat grup.');
  };

  if (grup) {
    return (
      <AuthLayout title={`Grup ${grup.namaLansia} sudah dibuat`} lead="Dua langkah supaya kabar mulai masuk. Kode ini juga tersimpan di menu Keluarga.">
        <div className={styles.done}>
          <section className={styles.step}>
            <h2>
              <span className={styles.num}>1</span>Hubungkan HP {grup.namaLansia}
            </h2>
            <p>Kirim link ini ke HP {grup.namaLansia}. Setelah dibuka, cukup tekan satu tombol.</p>
            <ShareCode kode={grup.kodeLansia} path="/hubungkan" pesan={`Halo! Buka link ini di HP ${grup.namaLansia} lalu tekan "Hubungkan HP ini":`} />
          </section>

          <section className={styles.step}>
            <h2>
              <span className={styles.num}>2</span>Undang keluarga lain
            </h2>
            <p>Boleh nanti. Anggota keluarga yang bergabung bisa ikut memantau {grup.namaLansia}.</p>
            <ShareCode kode={grup.kodeKeluarga} path="/gabung" pesan={`Gabung memantau ${grup.namaLansia} di SAPA:`} />
          </section>

          <button className={styles.submit} onClick={() => router.push('/pengawas')}>
            Buka pusat pantau
          </button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Buat grup pantau" lead="Satu grup untuk satu orang yang dipantau. Anggota keluarga lain bisa menyusul lewat kode.">
      <form className={styles.form} onSubmit={submit}>
        <div className={styles.field}>
          <label htmlFor="nama">Nama Anda</label>
          <input id="nama" className={styles.input} value={nama} onChange={(e) => setNama(e.target.value)} placeholder="Mis. Budi" maxLength={40} autoComplete="given-name" required />
        </div>
        <div className={styles.field}>
          <label htmlFor="lansia">Nama nenek atau kakek</label>
          <input id="lansia" className={styles.input} value={namaLansia} onChange={(e) => setNamaLansia(e.target.value)} placeholder="Mis. Oma Siti" maxLength={60} required />
          <span className={styles.hint}>Panggilan yang Anda pakai sehari-hari. Nama ini tampil di aplikasi.</span>
        </div>
        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}
        <button className={styles.submit} disabled={busy || !nama.trim() || !namaLansia.trim()}>
          {busy ? 'Membuat grup' : 'Buat grup'}
        </button>
      </form>
    </AuthLayout>
  );
}
