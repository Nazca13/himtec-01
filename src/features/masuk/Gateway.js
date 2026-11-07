import Link from 'next/link';
import { PiArrowRightBold, PiCrownFill, PiEyeFill, PiHandHeartFill } from 'react-icons/pi';
import Mascot from '@/components/ui/Mascot';
import Wordmark from '@/components/ui/Wordmark';
import styles from './Gateway.module.css';

const step = (i) => ({ '--i': i });

// Tiga peran. Urutan = urutan alur: admin mendaftar dulu, lalu HP orang tua, lalu keluarga lain.
const PERAN = [
  {
    href: '/daftar',
    Icon: PiCrownFill,
    peran: 'Admin',
    judul: 'Daftarkan keluarga',
    desc: 'Untuk anak/pengurus. Tambah orang tua, bagikan kode, atur anggota.',
  },
  {
    href: '/hubungkan',
    Icon: PiHandHeartFill,
    peran: 'Lansia',
    judul: 'Hubungkan HP orang tua',
    desc: 'Buka di HP nenek atau kakek. Masukkan kode dari admin, cukup sekali.',
    lansia: true,
  },
  {
    href: '/gabung',
    Icon: PiEyeFill,
    peran: 'Pemantau',
    judul: 'Masuk dengan kode undangan',
    desc: 'Untuk anggota keluarga lain. Ikut melihat kabar dan bertanya ke AI.',
  },
];

const CARA = [
  'Admin mendaftarkan keluarga dan orang tua, lalu mendapat kode.',
  'Kode HP dibuka di HP orang tua (lewat link WhatsApp), cukup sekali.',
  'Orang tua menekan tombol. Admin dan pemantau langsung melihatnya di dashboard.',
];

// Halaman pertama untuk perangkat tanpa sesi. Perangkat yang sudah masuk dialihkan oleh src/proxy.js.
export default function Gateway() {
  return (
    <main className={styles.page}>
      <header className={styles.hero}>
        <Wordmark />
        <h1 className={`${styles.rise} ${styles.headline}`} style={step(0)}>
          Pantau orang tua dari jauh, tanpa membuat mereka repot.
        </h1>
        <div className={styles.heroRow}>
          <p className={`${styles.rise} ${styles.sub}`} style={step(1)}>
            Nenek atau kakek cukup menekan satu tombol. Keluarga langsung tahu kondisinya.
          </p>
          <span className={`${styles.rise} ${styles.mascot}`} style={step(2)}>
            <Mascot size={120} priority />
          </span>
        </div>
      </header>

      <div className={styles.body}>
        <section className={`${styles.rise} ${styles.group}`} style={step(3)} aria-labelledby="peran">
          <h2 id="peran">Pilih peran Anda</h2>
          <ul>
            {PERAN.map(({ href, Icon, peran, judul, desc, lansia }) => (
              <li key={href}>
                <Link href={href} className={`${styles.card} ${lansia ? styles.lansia : ''}`}>
                  <span className={styles.icon}>
                    <Icon aria-hidden="true" />
                  </span>
                  <span className={styles.text}>
                    <span className={styles.role}>{peran}</span>
                    <strong>{judul}</strong>
                    <span>{desc}</span>
                  </span>
                  <PiArrowRightBold className={styles.go} aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className={`${styles.rise} ${styles.cara}`} style={step(5)} aria-labelledby="cara">
          <h2 id="cara">Cara kerjanya</h2>
          <ol>
            {CARA.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ol>
        </section>

        <p className={`${styles.rise} ${styles.demo}`} style={step(6)}>
          Masih bingung? <Link href="/panduan">Baca panduan lengkap</Link>
          <br />
          Juri atau ingin mencoba cepat? {/* <a>, bukan <Link>: /demo memasang cookie, tidak boleh di-prefetch */}
          <a href="/demo">Buka mode demo</a>
        </p>
      </div>
    </main>
  );
}
