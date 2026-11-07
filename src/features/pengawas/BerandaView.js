'use client';

import Link from 'next/link';
import { PiArrowRightBold } from 'react-icons/pi';
import AiLiveWidget from './AiLiveWidget';
import LansiaSwitcher from './LansiaSwitcher';
import LokasiCard from './LokasiCard';
import MulaiCard from './MulaiCard';
import PertolonganCard from './PertolonganCard';
import Skeleton from './Skeleton';
import StatusCard from './StatusCard';
import Timeline from './Timeline';
import TodayStats from './TodayStats';
import WeekChart from './WeekChart';
import { useRecords } from './RecordsProvider';
import styles from './pengawas.module.css';

// Dashboard: kolom kiri = kondisi sekarang, kolom kanan = AI live dan tren. Satu kolom di ponsel.
export default function BerandaView() {
  const { records, lansia, dipilih, isAdmin, now, me, lokasiTerakhir } = useRecords();
  if (!me) return <Skeleton />;

  if (!lansia.length) {
    return (
      <div className={`${styles.stack} ${styles.narrow}`}>
        <h1 className={styles.h1}>Belum ada orang tua</h1>
        <p className={styles.empty}>
          {isAdmin ? 'Tambahkan orang tua yang ingin dipantau di menu Keluarga.' : 'Admin keluarga belum menambahkan orang tua.'}
        </p>
        {isAdmin && (
          <Link href="/pengawas/keluarga" className={styles.cta}>
            Tambah orang tua
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className={styles.stack}>
      <div className={styles.headRow}>
        <h1 className={styles.heading}>Kondisi {dipilih?.nama}</h1>
        <LansiaSwitcher />
      </div>

      {dipilih && !dipilih.terhubungAt && records?.length > 0 && (
        <div className={styles.notice}>
          <p>
            <strong>HP {dipilih.nama} belum terhubung</strong>
            {isAdmin ? 'Kirim kode HP-nya dari menu Keluarga.' : 'Minta admin keluarga mengirim kode ke HP-nya.'}
          </p>
          {isAdmin && <Link href="/pengawas/keluarga">Hubungkan</Link>}
        </div>
      )}

      {records === null ? (
        <Skeleton />
      ) : records.length === 0 ? (
        dipilih && <MulaiCard lansia={dipilih} isAdmin={isAdmin} />
      ) : (
        <div className={styles.dash}>
          <div className={styles.main}>
            <div className={styles.o1}>
              <StatusCard latest={records[0]} now={now} />
            </div>
            {records[0]?.statusBahaya === 'MERAH' && (
              <div className={styles.o2}>
                <PertolonganCard record={records[0]} nama={dipilih?.nama} lokasi={lokasiTerakhir} />
              </div>
            )}
            <div className={styles.o5}>
              <TodayStats records={records} />
            </div>
            <section className={styles.o6} aria-labelledby="terbaru">
              <div className={styles.row}>
                <h2 id="terbaru" className={styles.h2}>
                  Kabar terbaru
                </h2>
                <Link href="/pengawas/riwayat" className={styles.more}>
                  Lihat semua
                  <PiArrowRightBold aria-hidden="true" />
                </Link>
              </div>
              <Timeline records={records.slice(0, 3)} />
            </section>
          </div>

          <aside className={styles.side}>
            <div className={styles.o3}>
              <AiLiveWidget />
            </div>
            <div className={styles.o4}>
              <LokasiCard />
            </div>
            <div className={styles.o7}>
              <WeekChart records={records} now={now} />
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
