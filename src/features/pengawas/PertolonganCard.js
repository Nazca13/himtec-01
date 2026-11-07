import { PiFirstAidKitFill, PiMapPinFill, PiPhoneFill, PiSpeakerSimpleSlashFill } from 'react-icons/pi';
import { useRecords } from './RecordsProvider';
import styles from './PertolonganCard.module.css';

// Langkah pertolongan pertama umum untuk keluarga saat kabar terakhir berstatus MERAH.
// Isi mengikuti sebab: kejang/jatuh (deteksi otomatis atau dipilih) atau darurat umum.
const LANGKAH = {
  KEJANG: [
    'Telepon orang yang paling dekat dengan lokasi agar segera datang.',
    'Minta mereka memiringkan tubuhnya dan tidak memasukkan apa pun ke mulutnya.',
    'Catat jam mulai kejang. Lebih dari 5 menit, atau kejang berulang: telepon 119.',
    'Setelah kejang berhenti, biarkan beristirahat dengan posisi miring sampai sadar penuh.',
  ],
  JATUH: [
    'Telepon untuk memastikan ia sadar dan bisa bicara.',
    'Minta orang terdekat datang; jangan memaksanya bangun bila nyeri di pinggul, punggung, atau kepala.',
    'Tidak sadar, berdarah, atau tidak bisa bergerak: telepon 119.',
  ],
  UMUM: [
    'Telepon sekarang. Jika tidak diangkat, hubungi tetangga atau keluarga terdekat untuk datang.',
    'Nyeri dada, sesak napas, wajah atau lengan lemah sebelah, bicara pelo: telepon 119 segera.',
    'Gunakan lokasi terakhir di bawah untuk mengarahkan bantuan.',
  ],
};

function sebabDari(record) {
  const a = record?.aiAnalysis ?? {};
  if (a.sebab === 'KEJANG' || a.gejala?.includes('Kejang') || a.gejala?.includes('Baru kejang')) return 'KEJANG';
  if (a.sebab === 'JATUH' || a.gejala?.includes('Jatuh')) return 'JATUH';
  return 'UMUM';
}

const JUDUL = { KEJANG: 'Kemungkinan kejang', JATUH: 'Kemungkinan jatuh', UMUM: 'Butuh bantuan' };

export default function PertolonganCard({ record, nama, lokasi }) {
  const sebab = sebabDari(record);
  const { alarmActive, stopAlarm } = useRecords();
  return (
    <section className={styles.card} aria-labelledby="pertolongan">
      <h2 id="pertolongan">
        <PiFirstAidKitFill aria-hidden="true" />
        {JUDUL[sebab]}: pertolongan pertama
      </h2>
      <ol>
        {LANGKAH[sebab].map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ol>
      <div className={styles.actions}>
        {alarmActive && (
          <button type="button" className={styles.stopAlarmBtn} onClick={stopAlarm}>
            <PiSpeakerSimpleSlashFill aria-hidden="true" />
            Hentikan Sirine
          </button>
        )}
        <a href="tel:119" className={styles.primary}>
          <PiPhoneFill aria-hidden="true" />
          Ambulans 119
        </a>
        <a href="tel:112" className={styles.secondary}>
          <PiPhoneFill aria-hidden="true" />
          Darurat 112
        </a>
        {lokasi && (
          <a className={styles.secondary} href={`https://www.google.com/maps/search/?api=1&query=${lokasi.latitude},${lokasi.longitude}`} target="_blank" rel="noopener noreferrer">
            <PiMapPinFill aria-hidden="true" />
            Lokasi {nama}
          </a>
        )}
      </div>
      <p className={styles.note}>Panduan umum, bukan pengganti tenaga medis.</p>
    </section>
  );
}
