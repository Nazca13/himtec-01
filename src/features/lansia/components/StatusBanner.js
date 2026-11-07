import { PiCheckCircleFill, PiClockCountdownFill, PiPillFill } from 'react-icons/pi';
import styles from '../LansiaApp.module.css';

// Sudah memberi kabar hari ini? + tombol cepat "Sudah Obat".
export default function StatusBanner({ info, onSudahObat }) {
  return (
    <section className={`${styles.statusBanner} ${info.sudahHariIni ? styles.bannerSudah : styles.bannerBelum}`} aria-label="Status kabar hari ini">
      <span className={styles.bannerIcon}>{info.sudahHariIni ? <PiCheckCircleFill aria-hidden="true" /> : <PiClockCountdownFill aria-hidden="true" />}</span>
      <div className={styles.bannerContent}>
        <strong>{info.sudahHariIni ? 'Laporan aman hari ini tercatat' : 'Belum memberi kabar hari ini'}</strong>
        <small>
          {info.sudahHariIni
            ? `${info.streak > 1 ? `Rutin ${info.streak} hari berturut-turut. ` : ''}Keluarga sudah tahu kondisi Anda.`
            : 'Tekan tombol hijau di bawah untuk lapor aman.'}
        </small>
      </div>
      <button type="button" className={styles.pillQuickBtn} onClick={onSudahObat} title="Konfirmasi sudah minum obat">
        <PiPillFill aria-hidden="true" />
        <span>Sudah Obat</span>
      </button>
    </section>
  );
}
