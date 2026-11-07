import { PiMicrophoneFill, PiShieldCheckFill, PiSirenFill } from 'react-icons/pi';
import { TIPE_INPUT } from '@/lib/constants';
import { isHariIni } from '@/lib/format';
import styles from './pengawas.module.css';

const TILES = [
  { tipe: TIPE_INPUT.AMAN, label: 'Kabar aman', Icon: PiShieldCheckFill, tone: 'HIJAU' },
  { tipe: TIPE_INPUT.VOICE, label: 'Pesan suara', Icon: PiMicrophoneFill, tone: 'KUNING' },
  { tipe: TIPE_INPUT.DARURAT, label: 'Darurat', Icon: PiSirenFill, tone: 'MERAH' },
];

export default function TodayStats({ records }) {
  const today = records.filter((r) => isHariIni(r.createdAt));

  return (
    <section aria-labelledby="hari-ini">
      <h2 id="hari-ini" className={styles.h2}>
        Hari ini
      </h2>
      <ul className={styles.stats}>
        {TILES.map(({ tipe, label, Icon, tone }) => (
          <li key={tipe} className={`${styles.stat} tone-${tone}`}>
            <span className={styles.statIcon}>
              <Icon aria-hidden="true" />
            </span>
            <strong>{today.filter((r) => r.tipeInput === tipe).length}</strong>
            <span>{label}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
