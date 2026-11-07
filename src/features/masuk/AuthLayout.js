import Link from 'next/link';
import { PiCaretLeftBold } from 'react-icons/pi';
import Mascot from '@/components/ui/Mascot';
import styles from './AuthLayout.module.css';

// Kerangka halaman masuk gaya iOS: tombol kembali bertint, Large Title, penjelasan, lalu isi.
// mood="senang" menampilkan maskot di atas judul (layar sukses).
export default function AuthLayout({ title, lead, back = '/', mood, children }) {
  return (
    <main className={styles.page}>
      <nav className={styles.nav}>
        <Link href={back} className={styles.back}>
          <PiCaretLeftBold aria-hidden="true" />
          Kembali
        </Link>
      </nav>
      {mood === 'senang' && (
        <div className={styles.mascot}>
          <Mascot size={88} mood="senang" />
        </div>
      )}
      <h1 className={styles.title}>{title}</h1>
      {lead && <p className={styles.lead}>{lead}</p>}
      <div className={styles.body}>{children}</div>
    </main>
  );
}
