import { AnimatePresence } from 'motion/react';
import * as m from 'motion/react-m';
import { PiChatTeardropDotsFill, PiMapPinFill, PiMicrophoneFill, PiShieldCheckFill, PiSirenFill, PiVibrateFill } from 'react-icons/pi';
import AudioPlayer from '@/components/ui/AudioPlayer';
import StatusBadge from '@/components/ui/StatusBadge';
import { TIPE_LABEL } from '@/lib/constants';
import { formatWaktu } from '@/lib/format';
import styles from './pengawas.module.css';

const ICON = {
  TOMBOL_AMAN: PiShieldCheckFill,
  VOICE_NOTE: PiMicrophoneFill,
  TOMBOL_DARURAT: PiSirenFill,
  KELUHAN: PiChatTeardropDotsFill,
  DETEKSI_OTOMATIS: PiVibrateFill,
};

// Garis waktu: terbaru di atas. Urutan memang bermakna, jadi memakai daftar berurutan.
export default function Timeline({ records }) {
  if (!records.length) {
    return <p className={styles.empty}>Belum ada aktivitas. Riwayat muncul setelah lansia memberi kabar.</p>;
  }

  return (
    <ol className={styles.timeline}>
      <AnimatePresence initial={false}>
      {records.map((r, i) => {
        const Icon = ICON[r.tipeInput];
        const analysis = r.aiAnalysis;
        return (
          <m.li
            key={r.id}
            initial={{ opacity: 0, y: -14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 26, delay: Math.min(i, 6) * 0.04 }}
            className={`${styles.entry} tone-${r.statusBahaya}`}
          >
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
              {(r.tipeInput === 'VOICE_NOTE' || r.hasAudio) && <AudioPlayer record={r} />}
              {r.latitude != null && (
                <a className={styles.loc} href={`https://www.google.com/maps/search/?api=1&query=${r.latitude},${r.longitude}`} target="_blank" rel="noopener noreferrer">
                  <PiMapPinFill aria-hidden="true" />
                  Lihat lokasi
                </a>
              )}
              {analysis?.gejala?.length > 0 && (
                <ul className={styles.tags}>
                  {analysis.gejala.map((g) => (
                    <li key={g}>{g}</li>
                  ))}
                </ul>
              )}
            </div>
          </m.li>
        );
      })}
      </AnimatePresence>
    </ol>
  );
}
