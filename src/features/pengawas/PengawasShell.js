'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  PiChatCircleDotsFill,
  PiClockCounterClockwiseFill,
  PiHouseFill,
  PiWifiSlashBold,
} from 'react-icons/pi';
import Wordmark from '@/components/ui/Wordmark';
import { useRecords } from './RecordsProvider';
import styles from './shell.module.css';

const NAV = [
  { href: '/pengawas', label: 'Beranda', Icon: PiHouseFill },
  { href: '/pengawas/riwayat', label: 'Riwayat', Icon: PiClockCounterClockwiseFill },
  { href: '/pengawas/asisten', label: 'Asisten AI', Icon: PiChatCircleDotsFill },
];

export default function PengawasShell({ children }) {
  const pathname = usePathname();
  const { error } = useRecords();

  return (
    <div className={styles.shell}>
      <aside className={styles.side}>
        <div className={styles.brand}>
          <Wordmark />
        </div>
        <nav className={styles.nav} aria-label="Menu utama">
          {NAV.map(({ href, label, Icon }) => {
            const active = pathname === href;
            return (
              <Link key={href} href={href} className={`${styles.item} ${active ? styles.active : ''}`} aria-current={active ? 'page' : undefined}>
                <Icon aria-hidden="true" />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>
        <Link href="/?ganti" className={styles.switch}>
          Ganti peran
        </Link>
      </aside>

      <div className={styles.main}>
        <header className={styles.top}>
          <Wordmark />
          <span className={`${styles.live} ${error ? styles.off : ''}`} role="status">
            {error ? <PiWifiSlashBold aria-hidden="true" /> : <span className={styles.pulse} aria-hidden="true" />}
            {error ? 'Terputus' : 'Langsung'}
          </span>
        </header>

        {error && (
          <p className={styles.banner} role="alert">
            Koneksi terputus. Data mungkin belum terbaru; mencoba lagi otomatis.
          </p>
        )}

        <div className={styles.content}>{children}</div>
      </div>
    </div>
  );
}
