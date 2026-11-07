'use client';

import { useRecords } from './RecordsProvider';
import styles from './LansiaSwitcher.module.css';

// Pilih orang tua yang sedang dilihat. Titik warna = status kabar terakhir. Tidak tampil jika hanya satu.
export default function LansiaSwitcher() {
  const { lansia, dipilihId, pilih } = useRecords();
  if (lansia.length < 2) return null;

  return (
    <div className={styles.row} role="tablist" aria-label="Pilih orang tua">
      {lansia.map((l) => (
        <button key={l.id} role="tab" aria-selected={l.id === dipilihId} className={`${styles.pill} ${l.id === dipilihId ? styles.on : ''}`} onClick={() => pilih(l.id)}>
          <span className={`${styles.dot} ${l.terakhir ? `tone-${l.terakhir.statusBahaya}` : ''}`} aria-hidden="true" />
          {l.nama}
        </button>
      ))}
    </div>
  );
}
