'use client';

import Image from 'next/image';
import Link from 'next/link';
import { PiArrowRightBold, PiHandHeartFill, PiUsersThreeFill } from 'react-icons/pi';
import { ROLES, ROLE_COOKIE } from '@/lib/roles';
import styles from './role.module.css';

const ICON = { lansia: PiHandHeartFill, pengawas: PiUsersThreeFill };
const TONE = { lansia: styles.teal, pengawas: styles.sky };

const remember = (id) => {
  document.cookie = `${ROLE_COOKIE}=${id}; path=/; max-age=31536000; samesite=lax`;
};

// Urutan masuk (logo, teks, kartu) memakai animasi CSS dengan jeda --i: berjalan tanpa menunggu JS.
const step = (i) => ({ '--i': i });

// Perangkat yang sudah memilih peran dialihkan oleh src/proxy.js. Tambahkan ?ganti untuk memilih ulang.
export default function RoleGateway() {
  return (
    <main className={styles.page}>
      <div className={`${styles.rise} ${styles.logoWrap}`} style={step(0)}>
        <Image src="/logo.png" width={720} height={720} alt="SAPA, Sistem Asisten Pantau Aktif" className={styles.logo} priority />
      </div>

      <h1 className={`${styles.rise} ${styles.headline}`} style={step(1)}>
        Pantau orang tua dari jauh, tanpa membuat mereka repot.
      </h1>
      <p className={`${styles.rise} ${styles.sub}`} style={step(2)}>
        Lansia cukup menekan satu tombol. Keluarga langsung tahu kondisinya.
      </p>

      <h2 className={`${styles.rise} ${styles.pick}`} style={step(3)}>
        Siapa yang memakai perangkat ini?
      </h2>
      <ul className={styles.list}>
        {Object.values(ROLES).map((role, i) => {
          const Icon = ICON[role.id];
          return (
            <li key={role.id} className={styles.rise} style={step(4 + i)}>
              <div>
                <Link href={role.href} className={`${styles.card} ${TONE[role.id]}`} onClick={() => remember(role.id)}>
                  <span className={styles.icon}>
                    <Icon aria-hidden="true" />
                  </span>
                  <span className={styles.text}>
                    <strong>{role.label}</strong>
                    <span>{role.desc}</span>
                  </span>
                  <PiArrowRightBold className={styles.go} aria-hidden="true" />
                </Link>
              </div>
            </li>
          );
        })}
      </ul>
      <p className={`${styles.rise} ${styles.note}`} style={step(6)}>
        Pilihan diingat di perangkat ini. Untuk mengganti, buka alamat /?ganti.
      </p>
    </main>
  );
}
