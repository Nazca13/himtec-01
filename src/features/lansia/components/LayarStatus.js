import Link from 'next/link';
import * as m from 'motion/react-m';
import { PiWarningCircleFill } from 'react-icons/pi';
import Mascot from '@/components/ui/Mascot';
import styles from '../LansiaApp.module.css';

export function LayarMengirim() {
  return (
    <>
      <Mascot size={100} mood="mendengar" />
      <p className={styles.msg}>Mengirim</p>
    </>
  );
}

export function LayarTerkirim({ balas }) {
  return (
    <>
      <Mascot size={130} mood="senang" />
      <p className={styles.msg}>Pesan Tersampaikan</p>
      <p className={styles.reply}>{balas}</p>
    </>
  );
}

export function LayarGalat({ teks, putus, onKembali }) {
  return (
    <>
      <PiWarningCircleFill className={styles.warn} aria-hidden="true" />
      <p className={`${styles.msg} ${styles.errText}`}>{teks}</p>
      {putus ? (
        <Link href="/hubungkan" className={styles.action}>
          Hubungkan ulang
        </Link>
      ) : (
        <m.button whileTap={{ scale: 0.97 }} className={styles.action} onClick={onKembali}>
          Kembali
        </m.button>
      )}
    </>
  );
}
