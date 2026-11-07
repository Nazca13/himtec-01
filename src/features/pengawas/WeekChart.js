import { hariKey, namaHari } from '@/lib/format';
import styles from './WeekChart.module.css';

const HARI_MS = 24 * 60 * 60 * 1000;
const JENIS = [
  { status: 'HIJAU', label: 'aman' },
  { status: 'KUNING', label: 'perlu perhatian' },
  { status: 'MERAH', label: 'darurat' },
];

// Grafik batang 7 hari: tiap hari ditumpuk menurut status. Dihitung dari log yang sudah dimuat.
export default function WeekChart({ records, now }) {
  const hari = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now - (6 - i) * HARI_MS);
    const key = hariKey(d);
    const dalamHari = records.filter((r) => hariKey(new Date(r.createdAt)) === key);
    const hitung = Object.fromEntries(JENIS.map(({ status }) => [status, dalamHari.filter((r) => r.statusBahaya === status).length]));
    return { key, nama: namaHari(d), hitung, total: dalamHari.length };
  });
  const maks = Math.max(1, ...hari.map((h) => h.total));

  return (
    <section className={styles.card} aria-labelledby="minggu">
      <h2 id="minggu">7 hari terakhir</h2>
      <ul className={styles.bars}>
        {hari.map((h) => (
          <li key={h.key} aria-label={`${h.nama}: ${JENIS.map(({ status, label }) => `${h.hitung[status]} ${label}`).join(', ')}`}>
            <div className={styles.col}>
              {JENIS.map(({ status }) =>
                h.hitung[status] ? <span key={status} className={`tone-${status} ${styles.seg}`} style={{ height: `${(h.hitung[status] / maks) * 100}%` }} /> : null
              )}
            </div>
            <span className={styles.day}>{h.nama}</span>
          </li>
        ))}
      </ul>
      <p className={styles.legend}>
        {JENIS.map(({ status, label }) => (
          <span key={status} className={`tone-${status}`}>
            <i aria-hidden="true" />
            {label}
          </span>
        ))}
      </p>
    </section>
  );
}
