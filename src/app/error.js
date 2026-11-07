'use client';

import Wordmark from '@/components/ui/Wordmark';
import styles from './status.module.css';

export default function Error({ reset }) {
  return (
    <main className={styles.page}>
      <Wordmark />
      <h1>Terjadi masalah</h1>
      <p>Halaman ini gagal dimuat. Coba lagi. Jika tetap gagal, periksa koneksi internet.</p>
      <button className={styles.btn} onClick={reset}>
        Coba lagi
      </button>
    </main>
  );
}
