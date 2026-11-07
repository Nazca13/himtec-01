import { PiMicrophoneFill, PiShieldCheckFill, PiSirenFill } from 'react-icons/pi';
import StatusBadge from '@/components/ui/StatusBadge';
import { TIPE_LABEL } from '@/lib/constants';
import { formatWaktu } from '@/lib/format';
import styles from './views.module.css';

const ICON = { TOMBOL_AMAN: PiShieldCheckFill, VOICE_NOTE: PiMicrophoneFill, TOMBOL_DARURAT: PiSirenFill };

// Garis waktu: terbaru di atas. Urutan memang bermakna, jadi memakai daftar berurutan.
export default function Timeline({ records }) {
  if (!records.length) {
    return <p className={styles.empty}>Belum ada aktivitas. Riwayat muncul setelah lansia memberi kabar.</p>;
  }

  return (
    <ol className={styles.timeline}>
      {records.map((r) => {
        const Icon = ICON[r.tipeInput];
        const analysis = r.aiAnalysis;
        return (
          <li key={r.id} className={`${styles.entry} tone-${r.statusBahaya}`}>
            <span className={styles.entryIcon}>
              <Icon aria-hidden="true" />
            </span>
            <div className={styles.entryBody}>
              <div className={styles.entryHead}>
                <strong>{TIPE_LABEL[r.tipeInput]}</strong>
                <StatusBadge status={r.statusBahaya} />
              </div>
              <time dateTime={new Date(r.createdAt).toISOString()}>{formatWaktu(r.createdAt)}</time>
              {analysis?.ringkasan && <p>{analysis.ringkasan}</p>}
              {analysis?.gejala?.length > 0 && (
                <ul className={styles.tags}>
                  {analysis.gejala.map((g) => (
                    <li key={g}>{g}</li>
                  ))}
                </ul>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
