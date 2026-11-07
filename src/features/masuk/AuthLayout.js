import Link from 'next/link';
import { PiArrowLeftBold } from 'react-icons/pi';
import Mascot from '@/components/ui/Mascot';
import Wordmark from '@/components/ui/Wordmark';
import styles from './AuthLayout.module.css';

// Kerangka halaman masuk: header biru logo (kembali, logo, judul, maskot), lalu isi di atas putih.
export default function AuthLayout({ title, lead, back = '/', mood = 'idle', children }) {
  return (
    <main className={styles.page}>
      <header className={styles.band}>
        <div className={styles.top}>
          <Link href={back} className={styles.back} aria-label="Kembali">
            <PiArrowLeftBold aria-hidden="true" />
          </Link>
          <Wordmark />
        </div>
        <div className={styles.row}>
          <div>
            <h1 className={styles.title}>{title}</h1>
            {lead && <p className={styles.lead}>{lead}</p>}
          </div>
          <span className={styles.mascot}>
            <Mascot size={92} mood={mood} />
          </span>
        </div>
      </header>
      <div className={styles.body}>{children}</div>
    </main>
  );
}
