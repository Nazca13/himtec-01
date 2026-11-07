'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ShareCode from '@/components/ui/ShareCode';
import { postJson } from '@/lib/http';
import AuthLayout from './AuthLayout';
import styles from './forms.module.css';

// Pengurus (admin) mendaftarkan data keluarga lengkap + orang tua pertama.
export default function DaftarKeluarga() {
  const router = useRouter();
  const [namaKeluarga, setNamaKeluarga] = useState('');
  const [nama, setNama] = useState('');
  const [hubungan, setHubungan] = useState('Anak Kandung');
  const [telepon, setTelepon] = useState('');
  const [namaLansia, setNamaLansia] = useState('');
  const [kondisiLansia, setKondisiLansia] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [hasil, setHasil] = useState(null); // diisi setelah terdaftar

  const submit = async (e) => {
    e.preventDefault();
    if (!nama.trim() || !namaLansia.trim()) {
      return setError('Isi nama Anda dan nama orang tua terlebih dahulu.');
    }
    setBusy(true);
    setError('');
    const { ok, data } = await postJson('/api/auth/daftar', {
      namaKeluarga: namaKeluarga.trim() || undefined,
      nama: nama.trim(),
      hubungan,
      telepon: telepon.trim() || undefined,
      namaLansia: namaLansia.trim(),
      kondisiLansia: kondisiLansia.trim() || undefined,
    });
    setBusy(false);
    if (ok) setHasil(data);
    else setError(data.error || 'Gagal mendaftarkan keluarga.');
  };

  if (hasil) {
    const { lansia, household } = hasil;
    return (
      <AuthLayout mood="senang" title="Keluarga terdaftar" lead={`Anda admin ${household.nama}. Dua langkah lagi agar pantauan mulai aktif.`}>
        <div className={styles.done}>
          <section className={styles.step}>
            <h2>
              <span className={styles.num}>1</span>Peduli Hari Ini: Hubungkan HP {lansia.nama}
            </h2>
            <p>
              Peduli hari ini, untuk mereka nanti. Kirim link ini ke HP {lansia.nama}. Setelah dibuka, cukup tekan satu tombol agar HP langsung siap pakai.
            </p>
            <ShareCode kode={lansia.kodePairing} path="/hubungkan" pesan={`Halo! Buka link ini di HP ${lansia.nama} lalu tekan "Hubungkan HP ini":`} />
          </section>

          <section className={styles.step}>
            <h2>
              <span className={styles.num}>2</span>Undang keluarga lain (pemantau)
            </h2>
            <p>Bisa kapan saja. Anggota keluarga lain bisa memantau kondisi dan bertanya ke AI tanpa bisa mengubah pengaturan.</p>
            <ShareCode kode={household.kodeUndangan} path="/gabung" pesan={`Gabung memantau ${lansia.nama} di SAPA:`} />
          </section>

          <button className={styles.submit} onClick={() => router.push('/pengawas')}>
            Buka dashboard keluarga
          </button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Daftarkan keluarga" lead="Lengkapi data keluarga untuk mulai memantau orang tua tercinta dengan aman dan terpadu.">
      <form className={styles.form} onSubmit={submit}>
        <h3 className={styles.sectionTitle}>Data Rumah / Keluarga</h3>

        <div className={styles.field}>
          <label htmlFor="namaKeluarga">Nama Keluarga</label>
          <input
            id="namaKeluarga"
            className={styles.input}
            value={namaKeluarga}
            onChange={(e) => setNamaKeluarga(e.target.value)}
            placeholder="Mis. Keluarga Santoso"
            maxLength={60}
          />
          <span className={styles.hint}>Jika dikosongkan, otomatis menggunakan nama Anda.</span>
        </div>

        <h3 className={styles.sectionTitle}>Data Pengurus (Admin)</h3>

        <div className={styles.field}>
          <label htmlFor="nama">Nama Lengkap Anda</label>
          <input
            id="nama"
            className={styles.input}
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            placeholder="Mis. Budi Santoso"
            maxLength={35}
            autoComplete="name"
            required
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="hubungan">Hubungan dengan Orang Tua</label>
          <select
            id="hubungan"
            className={styles.select}
            value={hubungan}
            onChange={(e) => setHubungan(e.target.value)}
          >
            <option value="Anak Kandung">Anak Kandung</option>
            <option value="Menantu">Menantu</option>
            <option value="Cucu">Cucu</option>
            <option value="Keponakan">Keponakan</option>
            <option value="Wali / Pendamping">Wali / Pendamping</option>
            <option value="Lainnya">Lainnya</option>
          </select>
        </div>

        <div className={styles.field}>
          <label htmlFor="telepon">Kontak Darurat / WhatsApp Admin</label>
          <input
            id="telepon"
            type="tel"
            className={styles.input}
            value={telepon}
            onChange={(e) => setTelepon(e.target.value)}
            placeholder="Mis. 0812-3456-7890"
            maxLength={20}
            autoComplete="tel"
          />
          <span className={styles.hint}>Digunakan saat situasi darurat atau rujukan medis.</span>
        </div>

        <h3 className={styles.sectionTitle}>Data Orang Tua (Lansia)</h3>

        <div className={styles.field}>
          <label htmlFor="lansia">Nama Orang Tua yang Dipantau</label>
          <input
            id="lansia"
            className={styles.input}
            value={namaLansia}
            onChange={(e) => setNamaLansia(e.target.value)}
            placeholder="Mis. Oma Siti"
            maxLength={45}
            required
          />
          <span className={styles.hint}>Panggilan sehari-hari di rumah.</span>
        </div>

        <div className={styles.field}>
          <label htmlFor="kondisi">Catatan Kondisi / Riwayat Kesehatan (Opsional)</label>
          <input
            id="kondisi"
            className={styles.input}
            value={kondisiLansia}
            onChange={(e) => setKondisiLansia(e.target.value)}
            placeholder="Mis. Tinggal sendiri, riwayat vertigo/hipertensi"
            maxLength={30}
          />
          <span className={styles.hint}>Membantu pengawasan keluarga dan triase asisten AI.</span>
        </div>

        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}

        <button className={styles.submit} disabled={busy}>
          {busy ? 'Mendaftarkan...' : 'Daftarkan keluarga'}
        </button>
      </form>
    </AuthLayout>
  );
}
