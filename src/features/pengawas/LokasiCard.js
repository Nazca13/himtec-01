'use client';

import { PiMapPinFill, PiArrowSquareOutBold } from 'react-icons/pi';
import { formatLalu, formatWaktu } from '@/lib/format';
import { TIPE_LABEL } from '@/lib/constants';
import { useRecords } from './RecordsProvider';
import styles from './LokasiCard.module.css';

const D = 0.004; // setengah lebar peta dalam derajat (±400 m)

// Lokasi terakhir lansia: dikirim HP-nya saat tombol ditekan. Peta OpenStreetMap (tanpa API key).
export default function LokasiCard() {
  const { lokasiTerakhir: l, dipilih } = useRecords();
  const nama = dipilih?.nama ?? 'lansia';

  if (!l) {
    return (
      <section className={styles.card} aria-labelledby="lokasi">
        <h2 id="lokasi">
          <PiMapPinFill aria-hidden="true" /> Lokasi terakhir
        </h2>
        <p className={styles.muted}>Belum ada lokasi. Lokasi dikirim saat {nama} menekan tombol, jika izin lokasi di HP-nya diberikan.</p>
      </section>
    );
  }

  const { latitude: lat, longitude: lng } = l;
  const peta = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - D}%2C${lat - D * 0.75}%2C${lng + D}%2C${lat + D * 0.75}&layer=mapnik&marker=${lat}%2C${lng}`;
  const gmaps = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

  return (
    <section className={styles.card} aria-labelledby="lokasi">
      <h2 id="lokasi">
        <PiMapPinFill aria-hidden="true" /> Lokasi terakhir {nama}
      </h2>
      <p className={styles.meta}>
        {TIPE_LABEL[l.tipeInput]}, {formatWaktu(l.createdAt)} ({formatLalu(l.createdAt)})
        {l.akurasiMeter != null && `. Akurasi ±${Math.round(l.akurasiMeter)} m`}
      </p>
      <iframe className={styles.map} src={peta} title={`Peta lokasi terakhir ${nama}`} loading="lazy" referrerPolicy="no-referrer" />
      <a className={styles.open} href={gmaps} target="_blank" rel="noopener noreferrer">
        Buka di Google Maps
        <PiArrowSquareOutBold aria-hidden="true" />
      </a>
    </section>
  );
}
