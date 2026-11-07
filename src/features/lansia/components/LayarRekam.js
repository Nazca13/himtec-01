import * as m from 'motion/react-m';
import { PiStopFill } from 'react-icons/pi';
import Mascot from '@/components/ui/Mascot';
import { MAX_REKAM_S } from '../teks';
import styles from '../LansiaApp.module.css';

export default function LayarRekam({ detik, onSelesai }) {
  return (
    <>
      <span className={styles.listen}>
        <Mascot size={110} mood="mendengar" />
      </span>
      <p className={styles.msg}>Silakan bicara</p>
      <p className={styles.timer}>
        0:{String(detik).padStart(2, '0')} / 0:{MAX_REKAM_S}
      </p>
      <m.button whileTap={{ scale: 0.97 }} className={styles.action} onClick={onSelesai}>
        <PiStopFill aria-hidden="true" />
        Selesai bicara
      </m.button>
    </>
  );
}
