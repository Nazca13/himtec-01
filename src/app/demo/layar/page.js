import Link from 'next/link';
import { notFound } from 'next/navigation';
import { demoAktif } from '@/lib/flags';
import Simulasi from './Simulasi';
import RolePill from '@/components/ui/RolePill';
import styles from './demo.module.css';

export const metadata = { title: 'Demo SAPA' };

// Dua tampilan berdampingan: HP lansia (kiri) dan dashboard keluarga (kanan). Keduanya memakai sesi demo.
// Ketuk tombol di HP lansia: dashboard di kanan berubah dalam hitungan detik.
export default function DemoLayar() {
  if (!demoAktif()) notFound();
  return (
    <main className={styles.page}>
      <header className={styles.head}>
        <h1>Demo SAPA</h1>
        <p>Ketuk tombol di HP kiri. Dashboard keluarga di kanan ikut berubah.</p>
        <nav>
          <Simulasi className={styles.sim} />
          {/* <a>, bukan <Link>: prefetch akan mereset data diam-diam */}
          <a href="/demo?reset=1">Ulangi data demo</a>
        </nav>
      </header>
      <div className={styles.stage}>
        <div className={styles.col}>
          <p className={styles.cap}>
            <RolePill role="LANSIA" /> HP orang tua: aplikasi tiga tombol
          </p>
          <div className={styles.phone}>
            <iframe data-hp-lansia className={styles.frame} allow="autoplay; geolocation; microphone" src="/lansia" title="HP nenek (aplikasi lansia)" />
          </div>
        </div>
        <div className={styles.col}>
          <p className={styles.cap}>
            <RolePill role="ADMIN" /> Dashboard keluarga: memantau dan mengelola
          </p>
          <div className={styles.desk}>
            <iframe className={styles.frame} allow="autoplay; geolocation; microphone" src="/pengawas" title="Dashboard keluarga" />
          </div>
        </div>
      </div>
      <p className={styles.small}>
        Di ponsel: <Link href="/lansia">buka tampilan lansia</Link> atau <Link href="/pengawas">buka dashboard keluarga</Link>.
      </p>
    </main>
  );
}
