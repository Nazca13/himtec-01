'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PiPhoneDisconnectBold, PiSignOutBold } from 'react-icons/pi';
import ShareCode from '@/components/ui/ShareCode';
import { formatWaktu } from '@/lib/format';
import { postJson } from '@/lib/http';
import Skeleton from './Skeleton';
import { useRecords } from './RecordsProvider';
import styles from './pengawas.module.css';

export default function KeluargaView() {
  const router = useRouter();
  const { household, me, refresh } = useRecords();
  const [busy, setBusy] = useState(false);
  if (!household) return <Skeleton />;

  const { namaLansia, kodeLansia, kodeKeluarga, lansiaTerhubungAt } = household;

  const putus = async () => {
    if (!window.confirm(`Putuskan HP ${namaLansia}? HP itu berhenti mengirim kabar sampai dihubungkan lagi dengan kode baru.`)) return;
    setBusy(true);
    await postJson('/api/lansia/putus');
    await refresh();
    setBusy(false);
  };

  const keluar = async () => {
    await postJson('/api/auth/keluar');
    router.replace('/');
    router.refresh();
  };

  return (
    <div className={`${styles.stack} ${styles.narrow}`}>
      <h1 className={styles.h1}>Keluarga</h1>

      <section className={styles.panel} aria-labelledby="hp-lansia">
        <h2 id="hp-lansia" className={styles.h2}>
          HP {namaLansia}
        </h2>
        <p className={`${styles.pill} ${lansiaTerhubungAt ? styles.ok : styles.warn}`}>
          {lansiaTerhubungAt ? `Terhubung sejak ${formatWaktu(lansiaTerhubungAt)}` : 'Belum terhubung'}
        </p>
        <p className={styles.muted}>
          {lansiaTerhubungAt
            ? 'Kabar dari HP ini langsung muncul di Beranda.'
            : `Kirim link ini ke HP ${namaLansia}, lalu minta ${namaLansia} menekan "Hubungkan HP ini".`}
        </p>
        <ShareCode kode={kodeLansia} path="/hubungkan" pesan={`Halo! Buka link ini di HP ${namaLansia} lalu tekan "Hubungkan HP ini":`} />
        {lansiaTerhubungAt && (
          <button className={styles.danger} onClick={putus} disabled={busy}>
            <PiPhoneDisconnectBold aria-hidden="true" />
            Putuskan HP ini dan buat kode baru
          </button>
        )}
      </section>

      <section className={styles.panel} aria-labelledby="undang">
        <h2 id="undang" className={styles.h2}>
          Undang anggota keluarga
        </h2>
        <p className={styles.muted}>Siapa pun yang punya kode ini bisa ikut memantau {namaLansia}. Bagikan hanya ke keluarga.</p>
        <ShareCode kode={kodeKeluarga} path="/gabung" pesan={`Gabung memantau ${namaLansia} di SAPA:`} />
      </section>

      <section className={styles.panel} aria-labelledby="akun">
        <h2 id="akun" className={styles.h2}>
          Akun di perangkat ini
        </h2>
        <p className={styles.muted}>
          Masuk sebagai <strong>{me?.nama}</strong>.
        </p>
        <button className={styles.outline} onClick={keluar}>
          <PiSignOutBold aria-hidden="true" />
          Keluar dari perangkat ini
        </button>
      </section>
    </div>
  );
}
