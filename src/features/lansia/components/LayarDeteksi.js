import * as m from 'motion/react-m';
import { PiPhoneFill } from 'react-icons/pi';
import { PETUNJUK } from '../teks';
import styles from '../LansiaApp.module.css';

// Hitung mundur darurat kejang/jatuh: batalkan, atau kirim sekarang. Petunjuk untuk orang di sekitar.
export default function LayarDeteksi({ sebab, sisa, onBatal, onSekarang }) {
  return (
    <>
      <p className={styles.alertTitle}>{sebab === 'JATUH' ? 'Sepertinya Anda jatuh' : 'Terdeteksi guncangan seperti kejang'}</p>
      <p className={styles.count} aria-label={`${sisa} detik`}>
        {Math.max(sisa, 0)}
      </p>
      <p className={styles.alertSub}>Keluarga dihubungi otomatis jika tidak dibatalkan.</p>
      <m.button whileTap={{ scale: 0.97 }} className={styles.okBtn} onClick={onBatal}>
        Saya baik-baik saja
      </m.button>
      <m.button whileTap={{ scale: 0.97 }} className={styles.instantBtn} onClick={onSekarang}>
        Hubungi Keluarga Sekarang
      </m.button>
      <div className={styles.bystander}>
        <strong>Untuk orang di sekitar</strong>
        <ul>
          {(PETUNJUK[sebab] ?? PETUNJUK.KEJANG).map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
        <a href="tel:119" className={styles.call}>
          <PiPhoneFill aria-hidden="true" />
          Telepon 119
        </a>
      </div>
    </>
  );
}
