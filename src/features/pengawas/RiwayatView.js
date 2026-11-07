'use client';

import Skeleton from './Skeleton';
import Timeline from './Timeline';
import { useRecords } from './RecordsProvider';
import styles from './pengawas.module.css';

export default function RiwayatView() {
  const { records } = useRecords();

  return (
    <div className={styles.stack}>
      <h1 className={styles.h1}>Riwayat</h1>
      {records ? <Timeline records={records} /> : <Skeleton />}
    </div>
  );
}
