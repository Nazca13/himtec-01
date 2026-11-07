import Link from 'next/link';
import Wordmark from '@/components/ui/Wordmark';
import styles from './status.module.css';

export const metadata = { title: 'Halaman tidak ditemukan' };

export default function NotFound() {
  return (
    <main className={styles.page}>
      <Wordmark />
      <h1>Halaman tidak ditemukan</h1>
      <p>Alamat yang Anda buka tidak ada. Kembali ke beranda untuk memilih peran.</p>
      <Link href="/" className={styles.btn}>
        Ke beranda
      </Link>
    </main>
  );
}
