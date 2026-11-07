import Image from 'next/image';
import Link from 'next/link';
import { PiCaretRightBold, PiCrownFill, PiEyeFill, PiHandHeartFill } from 'react-icons/pi';
import RolePill from '@/components/ui/RolePill';
import styles from './Gateway.module.css';

// Dua pintu masuk yang berbeda, bukan satu daftar peran:
//   Pemantauan = dashboard web untuk keluarga (Admin mendaftar, Pemantau bergabung dengan kode undangan)
//   Aplikasi orang tua = tiga tombol di HP orang tua (Lansia)
const GRUP = [
  {
    id: 'pemantauan',
    judul: 'Pemantauan keluarga',
    ket: 'Dashboard di web: lihat kabar, lokasi, riwayat, dan ringkasan AI orang tua.',
    items: [
      { href: '/daftar', Icon: PiCrownFill, warna: styles.blue, role: 'ADMIN', judul: 'Daftarkan keluarga dan mulai memantau', desc: 'Untuk anak atau pengurus. Tambah orang tua, bagikan kode, atur anggota.' },
      { href: '/gabung', Icon: PiEyeFill, warna: styles.indigo, role: 'PEMANTAU', judul: 'Masuk dengan kode undangan', desc: 'Untuk anggota keluarga lain yang sudah diundang admin.' },
    ],
  },
  {
    id: 'aplikasi-ortu',
    judul: 'Aplikasi orang tua',
    ket: 'Tiga tombol besar di HP nenek atau kakek. Dipasang sekali.',
    items: [
      { href: '/hubungkan', Icon: PiHandHeartFill, warna: styles.green, role: 'LANSIA', judul: 'Hubungkan HP orang tua', desc: 'Buka di HP orang tua, masukkan kode dari admin, atau buka link WhatsApp-nya.' },
    ],
  },
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

      {GRUP.map((g) => (
        <section key={g.id} className={styles.section} aria-labelledby={g.id}>
          <h2 id={g.id} className={styles.groupTitle}>
            {g.judul}
          </h2>
          <p className={styles.groupNote}>{g.ket}</p>
          <ul className={styles.list}>
            {g.items.map(({ href, Icon, warna, role, judul, desc }) => (
              <li key={href}>
                <Link href={href} className={styles.row}>
                  <span className={`${styles.icon} ${warna}`}>
                    <Icon aria-hidden="true" />
                  </span>
                  <span className={styles.text}>
                    <span className={styles.role}>
                      <RolePill role={role} />
                    </span>
                    <strong>{judul}</strong>
                    <span className={styles.desc}>{desc}</span>
                  </span>
                  <PiCaretRightBold className={styles.chev} aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}

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
