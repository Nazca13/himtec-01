'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PiArrowRightBold, PiHandHeartFill, PiUsersThreeFill } from 'react-icons/pi';
import Wordmark from '@/components/ui/Wordmark';
import { ROLES, ROLE_STORAGE_KEY } from '@/lib/roles';
import styles from './role.module.css';

const ICON = { lansia: PiHandHeartFill, pengawas: PiUsersThreeFill };
const TONE = { lansia: styles.teal, pengawas: styles.sky };

const remember = (id) => {
  try {
    localStorage.setItem(ROLE_STORAGE_KEY, id);
  } catch {}
};

// Perangkat yang sudah memilih peran langsung masuk. Tambahkan ?ganti untuk memilih ulang.
export default function RoleGateway() {
  const router = useRouter();

  useEffect(() => {
    if (new URLSearchParams(window.location.search).has('ganti')) return;
    try {
      const saved = ROLES[localStorage.getItem(ROLE_STORAGE_KEY)];
      if (saved) router.replace(saved.href);
    } catch {}
  }, [router]);

  return (
    <main className={styles.page}>
      <header className={styles.top}>
        <Wordmark tone="light" />
        <h1 className={styles.headline}>Pantau orang tua dari jauh, tanpa membuat mereka repot.</h1>
        <p className={styles.sub}>Lansia cukup menekan satu tombol. Keluarga langsung tahu kondisinya.</p>
      </header>

      <section className={styles.sheet} aria-labelledby="pilih">
        <h2 id="pilih" className={styles.pick}>
          Siapa yang memakai perangkat ini?
        </h2>
        <ul className={styles.list}>
          {Object.values(ROLES).map((role) => {
            const Icon = ICON[role.id];
            return (
              <li key={role.id}>
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
              </li>
            );
          })}
        </ul>
        <p className={styles.note}>Pilihan diingat di perangkat ini. Untuk mengganti, buka alamat /?ganti.</p>
      </section>
    </main>
  );
}
