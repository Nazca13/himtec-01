'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ShareCode from '@/components/ui/ShareCode';
import { postJson } from '@/lib/http';
import AuthLayout from './AuthLayout';
import styles from './forms.module.css';

// Pengurus (admin) mendaftarkan keluarga + orang tua pertama. Orang tua lain bisa ditambah nanti di menu Keluarga.
export default function DaftarKeluarga() {
  const router = useRouter();
  const [nama, setNama] = useState('');
  const [namaLansia, setNamaLansia] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [hasil, setHasil] = useState(null); // diisi setelah terdaftar

  const submit = async (e) => {
    e.preventDefault();
    if (!nama.trim() || !namaLansia.trim()) return setError('Isi nama Anda dan nama orang tua dulu.');
    setBusy(true);
    setError('');
    const { ok, data } = await postJson('/api/auth/daftar', { nama, namaLansia });
    setBusy(false);
    if (ok) setHasil(data);
    else setError(data.error || 'Gagal mendaftarkan keluarga.');
  };

  if (hasil) {
    const { lansia, household } = hasil;
    return (
      <AuthLayout mood="senang" title="Keluarga terdaftar" lead={`Anda admin ${household.nama}. Dua langkah lagi supaya kabar mulai masuk.`}>
        <div className={styles.done}>
          <section className={styles.step}>
            <h2>
              <span className={styles.num}>1</span>Hubungkan HP {lansia.nama}
            </h2>
            <p>Kirim link ini ke HP {lansia.nama}. Setelah dibuka, cukup tekan satu tombol. HP itu lalu menjadi aplikasi tiga tombol.</p>
            <ShareCode kode={lansia.kodePairing} path="/hubungkan" pesan={`Halo! Buka link ini di HP ${lansia.nama} lalu tekan "Hubungkan HP ini":`} />
          </section>

          <section className={styles.step}>
            <h2>
              <span className={styles.num}>2</span>Undang keluarga lain (pemantau)
            </h2>
            <p>Boleh nanti. Mereka bisa ikut melihat kabar, tetapi tidak bisa mengubah pengaturan. Kode ini juga ada di menu Keluarga.</p>
            <ShareCode kode={household.kodeUndangan} path="/gabung" pesan={`Gabung memantau ${lansia.nama} di SAPA:`} />
          </section>

          <button className={styles.submit} onClick={() => router.push('/pengawas')}>
            Buka dashboard
          </button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Daftarkan keluarga" lead="Anda menjadi admin: bisa menambah orang tua, membagikan kode, dan mengatur anggota keluarga.">
      <form className={styles.form} onSubmit={submit}>
        <div className={styles.field}>
          <label htmlFor="nama">Nama Anda</label>
          <input id="nama" className={styles.input} value={nama} onChange={(e) => setNama(e.target.value)} placeholder="Mis. Budi" maxLength={40} autoComplete="given-name" required />
        </div>
        <div className={styles.field}>
          <label htmlFor="lansia">Nama orang tua yang dipantau</label>
          <input id="lansia" className={styles.input} value={namaLansia} onChange={(e) => setNamaLansia(e.target.value)} placeholder="Mis. Oma Siti" maxLength={60} required />
          <span className={styles.hint}>Panggilan sehari-hari. Orang tua lain bisa ditambah nanti di menu Keluarga.</span>
        </div>
        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}
        <button className={styles.submit} disabled={busy}>
          {busy ? 'Mendaftarkan' : 'Daftarkan keluarga'}
        </button>
      </form>
    </AuthLayout>
  );
}
