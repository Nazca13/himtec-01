'use client';

import Link from 'next/link';
import { PiArrowRightBold } from 'react-icons/pi';
import Skeleton from './Skeleton';
import StatusCard from './StatusCard';
import Timeline from './Timeline';
import TodayStats from './TodayStats';
import { useRecords } from './RecordsProvider';
import styles from './pengawas.module.css';

export default function BerandaView() {
  const { records, now } = useRecords();
  if (!records) return <Skeleton />;

  return (
    <div className={styles.stack}>
      <StatusCard latest={records[0]} now={now} />
      <TodayStats records={records} />
      <section aria-labelledby="terbaru">
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
  );
}
