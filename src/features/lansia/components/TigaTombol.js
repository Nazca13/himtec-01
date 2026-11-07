import * as m from 'motion/react-m';
import { PiChatTeardropDotsFill, PiShieldCheckFill, PiSirenFill } from 'react-icons/pi';
import styles from '../LansiaApp.module.css';

const TAP = { scale: 0.97 };

// Tiga tombol besar: inti aplikasi orang tua.
export default function TigaTombol({ onAman, onKeluhan, onDarurat }) {
  return (
    <div className={styles.buttons}>
      <m.button whileTap={TAP} className={`${styles.big} tone-HIJAU`} onClick={onAman}>
        <span className={styles.disc}>
          <PiShieldCheckFill aria-hidden="true" />
        </span>
        <span className={styles.label}>
          <strong>Saya Aman</strong>
          <span>Kabari keluarga: saya baik-baik saja</span>
        </span>
      </m.button>

      <m.button whileTap={TAP} className={`${styles.big} tone-KUNING`} onClick={onKeluhan}>
        <span className={styles.disc}>
          <PiChatTeardropDotsFill aria-hidden="true" />
        </span>
        <span className={styles.label}>
          <strong>Keluhan</strong>
          <span>Bicara, atau pilih gambar</span>
        </span>
      </m.button>

      <m.button whileTap={TAP} className={`${styles.big} tone-MERAH`} onClick={onDarurat}>
        <span className={styles.disc}>
          <PiSirenFill aria-hidden="true" />
        </span>
        <span className={styles.label}>
          <strong>Darurat</strong>
          <span>Panggil keluarga sekarang</span>
        </span>
      </m.button>
    </div>
  );
}
