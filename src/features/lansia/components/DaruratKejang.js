import * as m from 'motion/react-m';
import { PiBrainFill, PiLightningFill, PiVibrateFill } from 'react-icons/pi';
import styles from '../LansiaApp.module.css';

// Tombol darurat kejang (selalu andal, manual) + saklar deteksi guncangan otomatis (opsional).
export default function DaruratKejang({ deteksiAktif, onKejang, onUbahDeteksi }) {
  return (
    <div className={styles.extraSection}>
      <m.button whileTap={{ scale: 0.98 }} type="button" className={styles.quickKejangBtn} onClick={onKejang}>
        <span className={styles.quickKejangIcon}>
          <PiBrainFill aria-hidden="true" />
        </span>
        <span className={styles.quickKejangText}>
          <strong>Tombol Darurat Kejang</strong>
          <small>Ketuk jika orang tua mengalami kejang</small>
        </span>
        <span className={styles.quickKejangBadge}>
          <PiLightningFill aria-hidden="true" /> Darurat
        </span>
      </m.button>

      <div className={styles.cell}>
        <PiVibrateFill className={styles.cellIcon} aria-hidden="true" />
        <span className={styles.cellText}>
          <strong>Deteksi getar & kejang otomatis</strong>
          <small>{deteksiAktif ? 'Aktif: HP bergetar & kirim darurat otomatis' : 'Kirim darurat otomatis jika HP mendeteksi guncangan'}</small>
        </span>
        <button type="button" role="switch" aria-checked={deteksiAktif} aria-label="Deteksi getar dan kejang" className={`${styles.switch} ${deteksiAktif ? styles.on : ''}`} onClick={onUbahDeteksi}>
          <span />
        </button>
      </div>
    </div>
  );
}
