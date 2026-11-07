import styles from '@/features/pengawas/enter.module.css';

// template.js dibuat ulang tiap pindah tab, jadi animasi CSS ini berjalan di setiap navigasi.
// CSS murni (bukan JS): konten tidak tersembunyi menunggu hidrasi, jadi tidak menunda tampilan pertama.
export default function PengawasTemplate({ children }) {
  return <div className={styles.enter}>{children}</div>;
}
