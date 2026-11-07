import Image from 'next/image';
import Link from 'next/link';
import { PiArrowRightBold, PiHandHeartFill, PiPlusCircleFill, PiUsersThreeFill } from 'react-icons/pi';
import styles from './Gateway.module.css';

const step = (i) => ({ '--i': i });

const PILIHAN = [
  {
    grup: 'Saya keluarga yang memantau',
    items: [
      { href: '/buat', Icon: PiPlusCircleFill, tone: styles.sky, judul: 'Buat grup pantau', desc: 'Langkah pertama. Anda akan mendapat kode untuk HP nenek atau kakek.' },
      { href: '/gabung', Icon: PiUsersThreeFill, tone: styles.sky, judul: 'Gabung dengan kode keluarga', desc: 'Sudah ada anggota keluarga yang membuat grup.' },
    ],
  },
  {
    grup: 'Ini HP nenek atau kakek',
    items: [
      { href: '/hubungkan', Icon: PiHandHeartFill, tone: styles.teal, judul: 'Hubungkan HP ini', desc: 'Masukkan kode dari keluarga, atau buka link yang dikirim lewat WhatsApp.' },
    ],
  },
];

const CARA = [
  'Keluarga membuat grup dan mendapat kode.',
  'Kode dimasukkan di HP nenek atau kakek, cukup sekali.',
  'Nenek atau kakek menekan tombol, keluarga langsung melihatnya.',
];

// Halaman pertama untuk perangkat tanpa sesi. Perangkat yang sudah masuk dialihkan oleh src/proxy.js.
export default function Gateway() {
  return (
    <main className={styles.page}>
      <div className={`${styles.rise} ${styles.logoWrap}`} style={step(0)}>
        <Image src="/logo.png" width={720} height={720} alt="SAPA, Sistem Asisten Pantau Aktif" className={styles.logo} priority />
      </div>

      <h1 className={`${styles.rise} ${styles.headline}`} style={step(1)}>
        Pantau orang tua dari jauh, tanpa membuat mereka repot.
      </h1>
      <p className={`${styles.rise} ${styles.sub}`} style={step(2)}>
        Nenek atau kakek cukup menekan satu tombol. Keluarga langsung tahu kondisinya.
      </p>

      {PILIHAN.map(({ grup, items }, g) => (
        <section key={grup} className={`${styles.rise} ${styles.group}`} style={step(3 + g)} aria-label={grup}>
          <h2>{grup}</h2>
          <ul>
            {items.map(({ href, Icon, tone, judul, desc }) => (
              <li key={href}>
                <Link href={href} className={`${styles.card} ${tone}`}>
                  <span className={styles.icon}>
                    <Icon aria-hidden="true" />
                  </span>
                  <span className={styles.text}>
                    <strong>{judul}</strong>
                    <span>{desc}</span>
                  </span>
                  <PiArrowRightBold className={styles.go} aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}

      <section className={`${styles.rise} ${styles.cara}`} style={step(5)} aria-labelledby="cara">
        <h2 id="cara">Cara kerjanya</h2>
        <ol>
          {CARA.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ol>
      </section>

      <p className={`${styles.rise} ${styles.demo}`} style={step(6)}>
        Juri atau ingin mencoba cepat? <Link href="/demo">Buka mode demo</Link>
      </p>
    </main>
  );
}
