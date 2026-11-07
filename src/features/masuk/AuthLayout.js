import Link from 'next/link';
import { PiArrowLeftBold } from 'react-icons/pi';
import Wordmark from '@/components/ui/Wordmark';
import styles from './AuthLayout.module.css';

// Kerangka halaman masuk: logo, tombol kembali, judul, penjelasan singkat, lalu isi.
export default function AuthLayout({ title, lead, back = '/', children }) {
  return (
    <main className={styles.page}>
      <header className={styles.top}>
        <Link href={back} className={styles.back} aria-label="Kembali">
          <PiArrowLeftBold aria-hidden="true" />
        </Link>
        <Wordmark />
      </header>
      <h1 className={styles.title}>{title}</h1>
      {lead && <p className={styles.lead}>{lead}</p>}
      {children}
    </main>
  );
}
