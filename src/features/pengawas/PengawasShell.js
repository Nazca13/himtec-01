'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  PiChatCircleDotsFill,
  PiClockCounterClockwiseFill,
  PiGearFill,
  PiHeartbeatFill,
  PiSignOutBold,
  PiSirenFill,
  PiSpeakerSimpleHighFill,
  PiSpeakerSimpleSlashFill,
  PiUsersThreeFill,
  PiWifiSlashBold,
} from 'react-icons/pi';
import Wordmark from '@/components/ui/Wordmark';
import RolePill from '@/components/ui/RolePill';
import { useRecords } from './RecordsProvider';
import styles from './PengawasShell.module.css';

const NAV = [
  { href: '/pengawas', label: 'Pemantauan', Icon: PiHeartbeatFill },
  { href: '/pengawas/riwayat', label: 'Riwayat', Icon: PiClockCounterClockwiseFill },
  { href: '/pengawas/asisten', label: 'Asisten AI', Icon: PiChatCircleDotsFill },
  { href: '/pengawas/keluarga', label: 'Keluarga', Icon: PiUsersThreeFill },
  { href: '/pengawas/pengaturan', label: 'Pengaturan', Icon: PiGearFill },
];

export default function PengawasShell({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { error, household, me, dipilih, alarmActive, alarmBlocked, stopAlarm, playAlarmAgain } = useRecords();

  const keluarPengawas = async () => {
    if (window.confirm('Keluar dari akun pengawas? Nanti tinggal masukkan kode untuk masuk lagi.')) {
      await fetch('/api/auth/keluar?role=pengawas', { method: 'POST' });
      router.replace('/');
      router.refresh();
    }
  };

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
                {active && <span className={styles.pill} aria-hidden="true" />}
                <Icon aria-hidden="true" />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>
        {household && (
          <div className={styles.who}>
            <strong>{me?.nama}</strong>
            <div className={styles.whoRole}>
              <RolePill role={me?.role} />
            </div>
            <span className={styles.whoMeta}>{household.nama}</span>
            {dipilih && <span className={styles.whoMeta}>Melihat {dipilih.nama}</span>}
            <button
              type="button"
              className={styles.sideLogoutBtn}
              onClick={keluarPengawas}
            >
              <PiSignOutBold aria-hidden="true" />
              Keluar
            </button>
          </div>
        )}
      </aside>

      <div className={styles.main}>
        <header className={styles.top}>
          <Wordmark />
          <div className={styles.topRight}>
            {me && <RolePill role={me.role} />}
            <span className={`${styles.live} ${error ? styles.off : ''}`} role="status">
              {error ? <PiWifiSlashBold aria-hidden="true" /> : <span className={styles.pulse} aria-hidden="true" />}
              {error ? 'Terputus' : 'Langsung'}
            </span>
            <button
              type="button"
              className={styles.topLogoutBtn}
              onClick={keluarPengawas}
              title="Keluar dari akun pengawas"
            >
              <PiSignOutBold aria-hidden="true" />
              <span>Keluar</span>
            </button>
          </div>
        </header>

        {alarmActive && (
          <div
            className={styles.alarmBanner}
            role="alert"
            onClick={() => {
              if (alarmBlocked) playAlarmAgain();
            }}
          >
            <div className={styles.alarmBannerLeft}>
              <PiSirenFill className={styles.alarmIcon} aria-hidden="true" />
              <span>
                <strong>Sinyal Darurat:</strong> {dipilih ? `Kondisi ${dipilih.nama} berstatus MERAH!` : 'Ada kondisi lansia berstatus MERAH!'}
              </span>
            </div>
            <div className={styles.alarmBannerActions}>
              {alarmBlocked && (
                <button type="button" className={styles.playAlarmBtn} onClick={playAlarmAgain} title="Nyalakan suara sirine">
                  <PiSpeakerSimpleHighFill aria-hidden="true" />
                  <span>Bunyikan Sirine</span>
                </button>
              )}
              <button type="button" className={styles.stopAlarmBtn} onClick={stopAlarm}>
                <PiSpeakerSimpleSlashFill aria-hidden="true" />
                <span>Hentikan Sirine</span>
              </button>
            </div>
          </div>
        )}

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
