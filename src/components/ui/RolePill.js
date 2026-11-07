import { PiCrownFill, PiEyeFill, PiHandHeartFill } from 'react-icons/pi';
import styles from './RolePill.module.css';

// Lencana peran: satu bahasa visual di mana pun peran perlu terlihat (dashboard, pengaturan, demo).
//   ADMIN    : mengelola keluarga dan orang tua      (biru)
//   PEMANTAU : hanya melihat                          (ungu)
//   LANSIA   : pengguna aplikasi tiga tombol          (hijau)
const PERAN = {
  ADMIN: { label: 'Admin', Icon: PiCrownFill, kelas: 'admin' },
  PEMANTAU: { label: 'Pemantau', Icon: PiEyeFill, kelas: 'pemantau' },
  LANSIA: { label: 'Lansia', Icon: PiHandHeartFill, kelas: 'lansia' },
};

export default function RolePill({ role, label }) {
  const p = PERAN[role] ?? PERAN.PEMANTAU;
  return (
    <span className={`${styles.pill} ${styles[p.kelas]}`}>
      <p.Icon aria-hidden="true" />
      {label ?? p.label}
    </span>
  );
}
