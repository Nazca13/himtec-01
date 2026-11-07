import Image from 'next/image';
import styles from './Wordmark.module.css';

export default function Wordmark() {
  return (
    <span className={styles.mark}>
      <Image src="/icon-96.png" width={32} height={32} alt="" className={styles.badge} priority />
      SAPA
    </span>
  );
}
