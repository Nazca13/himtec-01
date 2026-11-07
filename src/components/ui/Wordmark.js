import { PiHeartbeatBold } from 'react-icons/pi';
import styles from './Wordmark.module.css';

export default function Wordmark({ tone = 'dark' }) {
  return (
    <span className={`${styles.mark} ${tone === 'light' ? styles.light : ''}`}>
      <span className={styles.badge}>
        <PiHeartbeatBold aria-hidden="true" />
      </span>
      SAPA
    </span>
  );
}
