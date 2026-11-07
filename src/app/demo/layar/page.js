import Link from 'next/link';
import styles from './demo.module.css';

export const metadata = { title: 'Demo SAPA' };

// Dua tampilan berdampingan: HP lansia (kiri) dan dashboard keluarga (kanan). Keduanya memakai sesi demo.
// Ketuk tombol di HP lansia: dashboard di kanan berubah dalam hitungan detik.
export default function DemoLayar() {
  return (
    <main className={styles.page}>
      <header className={styles.head}>
        <h1>Demo SAPA</h1>
        <p>Ketuk tombol di HP kiri. Dashboard keluarga di kanan ikut berubah.</p>
        <nav>
          <Link href="/demo?reset=1">Ulangi data demo</Link>
        </nav>
      </header>
      <div className={styles.stage}>
        <div className={styles.phone}>
          <iframe className={styles.frame} src="/lansia" title="HP nenek (aplikasi lansia)" />
        </div>
        <div className={styles.desk}>
          <iframe className={styles.frame} src="/pengawas" title="Dashboard keluarga" />
        </div>
      </div>
      <p className={styles.small}>
        Di ponsel: <Link href="/lansia">buka tampilan lansia</Link> atau <Link href="/pengawas">buka dashboard keluarga</Link>.
      </p>
    </main>
  );
}
