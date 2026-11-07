import {
  PiArrowFatLinesDownFill,
  PiBrainFill,
  PiHeartbeatFill,
  PiMicrophoneFill,
  PiPhoneCallFill,
  PiPillFill,
  PiSmileyNervousFill,
  PiSpiralBold,
  PiThermometerHotFill,
  PiWindFill,
} from 'react-icons/pi';
import { KELUHAN } from '@/lib/keluhan';
import styles from '../LansiaApp.module.css';

const IKON = {
  PUSING: PiSpiralBold,
  NYERI_DADA: PiHeartbeatFill,
  SESAK: PiWindFill,
  JATUH: PiArrowFatLinesDownFill,
  KEJANG: PiBrainFill,
  MUAL: PiSmileyNervousFill,
  DEMAM: PiThermometerHotFill,
  OBAT_HABIS: PiPillFill,
  TELEPON: PiPhoneCallFill,
};

// Lembar keluhan: bicara, atau ketuk satu gambar (langsung terkirim).
export default function KeluhanSheet({ onBatal, onBicara, onPilih }) {
  return (
    <div className={styles.sheet}>
      <div className={styles.sheetHead}>
        <h2>Apa keluhannya?</h2>
        <button className={styles.textBtn} onClick={onBatal}>
          Batal
        </button>
      </div>
      <button className={styles.speak} onClick={onBicara}>
        <PiMicrophoneFill aria-hidden="true" />
        Bicara
      </button>
      <p className={styles.or}>atau ketuk satu gambar, langsung terkirim</p>
      <ul className={styles.grid}>
        {KELUHAN.map((k) => {
          const Icon = IKON[k.id];
          return (
            <li key={k.id}>
              <button className={`${styles.tile} ${k.bahaya === 'MERAH' ? styles.tileRed : ''}`} onClick={() => onPilih(k.id)}>
                <Icon aria-hidden="true" />
                {k.label}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
