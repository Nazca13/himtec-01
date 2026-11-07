import * as m from 'motion/react-m';
import { PiMicrophoneFill, PiShieldCheckFill, PiSirenFill, PiWarningFill } from 'react-icons/pi';
import AudioPlayer from '@/components/ui/AudioPlayer';
import { STATUS_LABEL, TIPE_LABEL } from '@/lib/constants';
import { formatLalu, formatWaktu } from '@/lib/format';
import styles from './pengawas.module.css';

const ICON = { HIJAU: PiShieldCheckFill, KUNING: PiMicrophoneFill, MERAH: PiSirenFill };
const SEPI_MS = 12 * 60 * 60 * 1000; // tanpa kabar selama ini dianggap patut dicek

// Kartu utama: warna dan ikon mengikuti row terbaru di database.
export default function StatusCard({ latest, now }) {
  if (!latest) {
    return (
      <section className={`${styles.status} ${styles.statusEmpty}`} aria-label="Status terkini">
        <h2 className={styles.statusWord}>Belum ada kabar</h2>
        <p className={styles.statusMeta}>Status muncul di sini begitu lansia menekan salah satu tombol.</p>
      </section>
    );
  }

  const Icon = ICON[latest.statusBahaya];
  const ringkasan = latest.aiAnalysis?.ringkasan;
  const sepi = now - new Date(latest.createdAt).getTime() > SEPI_MS;

  return (
    <m.section
      key={latest.id}
      initial={{ opacity: 0.4, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 22 }}
      className={`${styles.status} tone-${latest.statusBahaya}`}
      aria-label="Status terkini"
    >
      <span className={`${styles.orb} ${latest.statusBahaya === 'MERAH' ? styles.alarm : ''}`}>
        <Icon aria-hidden="true" />
      </span>
      <div>
        <h2 className={styles.statusWord}>{STATUS_LABEL[latest.statusBahaya]}</h2>
        <p className={styles.statusMeta}>
          {TIPE_LABEL[latest.tipeInput]}, {formatWaktu(latest.createdAt)}
          <br />
          {formatLalu(latest.createdAt)}
        </p>
        {ringkasan && <p className={styles.statusNote}>{ringkasan}</p>}
        {(latest.tipeInput === 'VOICE_NOTE' || latest.hasAudio) && (
          <AudioPlayer record={latest} compact />
        )}
        {sepi && (
          <p className={styles.sepi}>
            <PiWarningFill aria-hidden="true" />
            Sudah lama tanpa kabar. Coba hubungi langsung.
          </p>
        )}
      </div>
    </m.section>
  );
}
