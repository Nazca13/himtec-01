'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PiPhoneDisconnectBold, PiPlusBold, PiSignOutBold, PiTrashBold, PiUserGearBold } from 'react-icons/pi';
import ShareCode from '@/components/ui/ShareCode';
import { formatWaktu } from '@/lib/format';
import { postJson, requestJson } from '@/lib/http';
import Skeleton from './Skeleton';
import { useRecords } from './RecordsProvider';
import styles from './pengawas.module.css';

const PERAN = { ADMIN: 'Admin', PEMANTAU: 'Pemantau' };

export default function KeluargaView() {
  const router = useRouter();
  const { me, household, lansia, members, isAdmin, refresh } = useRecords();
  const [namaBaru, setNamaBaru] = useState('');
  const [pesan, setPesan] = useState(null); // { tipe: 'error' | 'ok', teks }
  const [busy, setBusy] = useState(false);
  if (!me) return <Skeleton />;

  // Jalankan aksi, tampilkan hasilnya, lalu muat ulang data dashboard.
  const aksi = async (fn, okTeks) => {
    setBusy(true);
    setPesan(null);
    const { ok, data } = await fn();
    setBusy(false);
    setPesan(ok ? (okTeks ? { tipe: 'ok', teks: okTeks } : null) : { tipe: 'error', teks: data.error || 'Gagal. Coba lagi.' });
    await refresh();
    return ok;
  };

  const tambah = async (e) => {
    e.preventDefault();
    const nama = namaBaru.trim();
    if (!nama) return setPesan({ tipe: 'error', teks: 'Isi nama orang tua dulu.' });
    if (await aksi(() => postJson('/api/lansia', { nama }), `${nama} ditambahkan. Kirim kode HP-nya di bawah.`)) setNamaBaru('');
  };

  const putus = (l) =>
    window.confirm(`Putuskan HP ${l.nama}? HP itu berhenti mengirim kabar sampai dihubungkan lagi dengan kode baru.`) &&
    aksi(() => postJson(`/api/lansia/${l.id}/putus`), `Kode HP ${l.nama} sudah diganti.`);

  const hapus = (l) =>
    window.confirm(`Hapus ${l.nama} beserta semua riwayatnya? Tindakan ini tidak bisa dibatalkan.`) &&
    aksi(() => requestJson(`/api/lansia/${l.id}`, { method: 'DELETE' }), `${l.nama} dihapus.`);

  const ubahPeran = (m, role) => aksi(() => requestJson(`/api/anggota/${m.id}`, { method: 'PATCH', body: { role } }), `${m.nama} sekarang ${PERAN[role]}.`);

  const keluarkan = (m) =>
    window.confirm(`Keluarkan ${m.nama} dari keluarga? Perangkatnya langsung tidak bisa membuka dashboard.`) &&
    aksi(() => requestJson(`/api/anggota/${m.id}`, { method: 'DELETE' }), `${m.nama} dikeluarkan.`);

  const keluar = async () => {
    await postJson('/api/auth/keluar');
    router.replace('/');
    router.refresh();
  };

  return (
    <div className={`${styles.stack} ${styles.narrow}`}>
      <div>
        <h1 className={styles.h1}>{household?.nama ?? 'Keluarga'}</h1>
        <p className={styles.muted}>
          Anda masuk sebagai <strong>{me.nama}</strong> ({PERAN[me.role]}).
          {!isAdmin && ' Hanya admin yang bisa menambah orang tua dan mengatur anggota.'}
        </p>
      </div>

      {pesan && (
        <p className={pesan.tipe === 'error' ? styles.formError : styles.formOk} role={pesan.tipe === 'error' ? 'alert' : 'status'}>
          {pesan.teks}
        </p>
      )}

      <section className={styles.panel} aria-labelledby="orang-tua">
        <h2 id="orang-tua" className={styles.h2}>
          Orang tua yang dipantau
        </h2>

        {lansia.length === 0 && <p className={styles.muted}>Belum ada orang tua.</p>}

        <ul className={styles.list}>
          {lansia.map((l) => (
            <li key={l.id} className={styles.item}>
              <div className={styles.itemHead}>
                <strong>{l.nama}</strong>
                <span className={`${styles.pill} ${l.terhubungAt ? styles.ok : styles.warn}`}>{l.terhubungAt ? `HP terhubung ${formatWaktu(l.terhubungAt)}` : 'HP belum terhubung'}</span>
              </div>

              {isAdmin && l.kodePairing && (
                <details className={styles.details} open={!l.terhubungAt}>
                  <summary>{l.terhubungAt ? 'Kode untuk HP baru' : `Kirim kode ke HP ${l.nama}`}</summary>
                  <ShareCode kode={l.kodePairing} path="/hubungkan" pesan={`Halo! Buka link ini di HP ${l.nama} lalu tekan "Hubungkan HP ini":`} />
                </details>
              )}

              {isAdmin && (
                <div className={styles.actions}>
                  {l.terhubungAt && (
                    <button className={styles.outline} onClick={() => putus(l)} disabled={busy}>
                      <PiPhoneDisconnectBold aria-hidden="true" />
                      Putuskan HP
                    </button>
                  )}
                  <button className={styles.danger} onClick={() => hapus(l)} disabled={busy}>
                    <PiTrashBold aria-hidden="true" />
                    Hapus
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>

        {isAdmin && (
          <form className={styles.addForm} onSubmit={tambah}>
            <label htmlFor="nama-baru">Tambah orang tua</label>
            <div className={styles.addRow}>
              <input id="nama-baru" className={styles.input} value={namaBaru} onChange={(e) => setNamaBaru(e.target.value)} placeholder="Mis. Opa Joko" maxLength={60} />
              <button className={styles.cta} disabled={busy}>
                <PiPlusBold aria-hidden="true" />
                Tambah
              </button>
            </div>
          </form>
        )}
      </section>

      <section className={styles.panel} aria-labelledby="anggota">
        <h2 id="anggota" className={styles.h2}>
          Anggota keluarga
        </h2>
        <ul className={styles.list}>
          {members.map((m) => (
            <li key={m.id} className={styles.item}>
              <div className={styles.itemHead}>
                <strong>
                  {m.nama}
                  {m.id === me.id && ' (Anda)'}
                </strong>
                <span className={`${styles.pill} ${m.role === 'ADMIN' ? styles.admin : ''}`}>{PERAN[m.role]}</span>
              </div>
              {isAdmin && (
                <div className={styles.actions}>
                  <button className={styles.outline} onClick={() => ubahPeran(m, m.role === 'ADMIN' ? 'PEMANTAU' : 'ADMIN')} disabled={busy}>
                    <PiUserGearBold aria-hidden="true" />
                    {m.role === 'ADMIN' ? 'Jadikan pemantau' : 'Jadikan admin'}
                  </button>
                  {m.id !== me.id && (
                    <button className={styles.danger} onClick={() => keluarkan(m)} disabled={busy}>
                      <PiTrashBold aria-hidden="true" />
                      Keluarkan
                    </button>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>

        {isAdmin && household?.kodeUndangan && (
          <details className={styles.details}>
            <summary>Undang anggota keluarga (sebagai pemantau)</summary>
            <p className={styles.muted}>Siapa pun yang punya kode ini bisa ikut memantau. Bagikan hanya ke keluarga.</p>
            <ShareCode kode={household.kodeUndangan} path="/gabung" pesan={`Gabung memantau keluarga di SAPA:`} />
          </details>
        )}
      </section>

      <button className={styles.outline} onClick={keluar}>
        <PiSignOutBold aria-hidden="true" />
        Keluar dari perangkat ini
      </button>
    </div>
  );
}
