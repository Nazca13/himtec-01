'use client';

import LansiaSwitcher from './LansiaSwitcher';
import Skeleton from './Skeleton';
import Timeline from './Timeline';
import { useRecords } from './RecordsProvider';
import styles from './pengawas.module.css';

export default function RiwayatView() {
  const { records, dipilih } = useRecords();

  return (
    <div className={`${styles.stack} ${styles.narrow}`}>
      <div className={styles.headRow}>
        <h1 className={styles.h1}>Riwayat {dipilih?.nama}</h1>
        <LansiaSwitcher />
      </div>
      {records ? <Timeline records={records} /> : <Skeleton />}
    </div>
  );
}
