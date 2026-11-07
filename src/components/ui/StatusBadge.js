import { STATUS_LABEL } from '@/lib/constants';
import styles from './StatusBadge.module.css';

// Teks selalu menyertai warna, agar status tidak hanya dibedakan lewat warna.
export default function StatusBadge({ status }) {
  return (
    <span className={`${styles.badge} tone-${status}`}>
      <span className={styles.dot} aria-hidden="true" />
      {STATUS_LABEL[status]}
    </span>
  );
}
