import Image from 'next/image';
import Link from 'next/link';
import { PiCaretRightBold, PiCrownFill, PiEyeFill, PiHandHeartFill } from 'react-icons/pi';
import styles from './Gateway.module.css';

// Tiga peran. Urutan = urutan alur: admin mendaftar dulu, lalu HP orang tua, lalu keluarga lain.
const PERAN = [
  { href: '/daftar', Icon: PiCrownFill, warna: styles.blue, peran: 'Admin', judul: 'Daftarkan keluarga', desc: 'Untuk anak atau pengurus. Tambah orang tua, bagikan kode, atur anggota.' },
  { href: '/hubungkan', Icon: PiHandHeartFill, warna: styles.green, peran: 'Lansia', judul: 'Hubungkan HP orang tua', desc: 'Buka di HP nenek atau kakek, masukkan kode dari admin. Cukup sekali.' },
  { href: '/gabung', Icon: PiEyeFill, warna: styles.indigo, peran: 'Pemantau', judul: 'Masuk dengan kode undangan', desc: 'Untuk anggota keluarga lain. Ikut melihat kabar dan bertanya ke AI.' },
];

const CARA = [
  'Admin mendaftarkan keluarga dan orang tua, lalu mendapat kode.',
  'Kode HP dibuka di HP orang tua lewat link WhatsApp, cukup sekali.',
  'Orang tua menekan tombol. Keluarga langsung melihatnya di dashboard.',
];

// Halaman pertama untuk perangkat tanpa sesi. Perangkat yang sudah masuk dialihkan oleh src/proxy.js.
export default function Gateway() {
  return (
    <main className={styles.page}>
      <header className={styles.hero}>
        <Image src="/icon-192.png" width={96} height={96} alt="" className={styles.appIcon} priority />
        <h1 className={styles.title}>SAPA</h1>
        <p className={styles.sub}>Pantau orang tua dari jauh. Mereka cukup menekan satu tombol, keluarga langsung tahu kondisinya.</p>
      </header>

      <section className={styles.section} aria-labelledby="peran">
        <h2 id="peran" className={styles.label}>
          Pilih peran Anda
        </h2>
        <ul className={styles.list}>
          {PERAN.map(({ href, Icon, warna, peran, judul, desc }) => (
            <li key={href}>
              <Link href={href} className={styles.row}>
                <span className={`${styles.icon} ${warna}`}>
                  <Icon aria-hidden="true" />
                </span>
                <span className={styles.text}>
                  <span className={styles.role}>{peran}</span>
                  <strong>{judul}</strong>
                  <span className={styles.desc}>{desc}</span>
                </span>
                <PiCaretRightBold className={styles.chev} aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.section} aria-labelledby="cara">
        <h2 id="cara" className={styles.label}>
          Cara kerjanya
        </h2>
        <ol className={styles.steps}>
          {CARA.map((t, i) => (
            <li key={t}>
              <span className={styles.num}>{i + 1}</span>
              {t}
            </li>
          ))}
        </ol>
      </section>

      <p className={styles.foot}>
        <Link href="/panduan">Panduan lengkap</Link>
        {/* <a>, bukan <Link>: /demo memasang cookie, tidak boleh di-prefetch */}
        <a href="/demo">Coba mode demo</a>
      </p>
    </main>
  );
}
