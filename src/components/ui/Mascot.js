import Image from 'next/image';
import { PiStarFourFill } from 'react-icons/pi';
import styles from './Mascot.module.css';

const RASIO = 342 / 316;

// Maskot SAPA (burung hantu perawat). Satu pose, suasana hati lewat gerakan dan hiasan:
//   idle: melayang pelan | senang: melompat + kilau | siaga: miring + denyut | mendengar: berdenyut halus
export default function Mascot({ size = 140, mood = 'idle', priority = false }) {
  return (
    <span className={`${styles.wrap} ${styles[mood]}`} style={{ width: size, height: Math.round(size * RASIO) }} aria-hidden="true">
      <Image src="/mascot.png" alt="" width={316} height={342} sizes={`${size}px`} className={styles.img} priority={priority} />
      {mood === 'senang' && (
        <>
          <PiStarFourFill className={`${styles.star} ${styles.s1}`} />
          <PiStarFourFill className={`${styles.star} ${styles.s2}`} />
          <PiStarFourFill className={`${styles.star} ${styles.s3}`} />
        </>
      )}
    </span>
  );
}
