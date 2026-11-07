'use client';

import { useState } from 'react';
import {
  PiMapPinFill,
  PiArrowSquareOutBold,
  PiArrowsClockwiseBold,
  PiCheckBold,
  PiCopyBold,
} from 'react-icons/pi';
import { formatLalu, formatWaktu } from '@/lib/format';
import { TIPE_LABEL } from '@/lib/constants';
import { useRecords } from './RecordsProvider';
import styles from './LokasiCard.module.css';

const D = 0.004; // setengah lebar peta dalam derajat (±400 m)

// Lokasi terakhir lansia: dikirim HP-nya saat tombol ditekan. Peta OpenStreetMap dengan pembaruan live.
export default function LokasiCard() {
  const { lokasiTerakhir: l, dipilih, refresh } = useRecords();
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [petaKey, setPetaKey] = useState(0);

  const nama = dipilih?.nama ?? 'Orang Tua / Lansia';

  const handleRefresh = async () => {
    setLoading(true);
    try {
      if (typeof refresh === 'function') {
        await refresh();
      }
      setPetaKey((k) => k + 1);
    } finally {
      setTimeout(() => setLoading(false), 500);
    }
  };

  const copyCoordinates = async (text) => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1600);
      }
    } catch {
      // Fallback diam jika clipboard permission tidak tersedia
    }
  };

  if (!l) {
    return (
      <section className={styles.card} aria-labelledby="lokasi">
        <div className={styles.headerRow}>
          <h2 id="lokasi">
            <PiMapPinFill aria-hidden="true" /> Lokasi {nama}
          </h2>
          <button
            type="button"
            className={styles.refreshBtn}
            onClick={handleRefresh}
            disabled={loading}
            title="Perbarui lokasi"
          >
            <PiArrowsClockwiseBold className={loading ? styles.spin : ''} aria-hidden="true" />
            <span>{loading ? 'Memperbarui...' : 'Perbarui'}</span>
          </button>
        </div>
        <p className={styles.muted}>
          Belum ada data lokasi. Lokasi GPS otomatis terkirim saat {nama} menekan tombol jika izin lokasi di HP-nya diaktifkan.
        </p>
      </section>
    );
  }

  const { latitude: lat, longitude: lng } = l;
  const peta = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - D}%2C${lat - D * 0.75}%2C${lng + D}%2C${lat + D * 0.75}&layer=mapnik&marker=${lat}%2C${lng}&t=${petaKey}`;
  const gmaps = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  const coordText = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;

  return (
    <section className={styles.card} aria-labelledby="lokasi">
      <div className={styles.headerRow}>
        <h2 id="lokasi">
          <PiMapPinFill aria-hidden="true" /> Lokasi {nama}
        </h2>
        <span className={styles.liveTag}>Live GPS</span>
      </div>

      <p className={styles.meta}>
        {TIPE_LABEL[l.tipeInput] ?? 'Laporan'}, {formatWaktu(l.createdAt)} ({formatLalu(l.createdAt)})
      </p>

      {/* Tampilan Peta */}
      <div className={styles.mapWrap}>
        <iframe
          key={petaKey}
          className={styles.map}
          src={peta}
          title={`Peta lokasi terakhir ${nama}`}
          loading="lazy"
          referrerPolicy="no-referrer"
        />
        <div className={styles.pinBadge}>
          <span className={styles.pulseDot} />
          <span>Posisi {nama}</span>
        </div>
      </div>

      {/* Titik Koordinat Lengkap */}
      <div className={styles.coordBox}>
        <div className={styles.coordInfo}>
          <span className={styles.coordLabel}>Koordinat:</span>
          <code className={styles.coordValue}>{coordText}</code>
          {l.akurasiMeter != null && (
            <span className={styles.accuracy}>±{Math.round(l.akurasiMeter)} m</span>
          )}
        </div>
        <button
          type="button"
          className={styles.copyBtn}
          onClick={() => copyCoordinates(coordText)}
          title="Salin titik koordinat"
        >
          {copied ? <PiCheckBold aria-hidden="true" /> : <PiCopyBold aria-hidden="true" />}
          <span>{copied ? 'Tersalin' : 'Salin'}</span>
        </button>
      </div>

      {/* Tombol Aksi di Bawah Map */}
      <div className={styles.actionGrid}>
        <button
          type="button"
          className={styles.refreshActionBtn}
          onClick={handleRefresh}
          disabled={loading}
        >
          <PiArrowsClockwiseBold className={loading ? styles.spin : ''} aria-hidden="true" />
          <span>{loading ? 'Memperbarui...' : 'Perbarui Lokasi'}</span>
        </button>

        <a className={styles.open} href={gmaps} target="_blank" rel="noopener noreferrer">
          <span>Buka Google Maps</span>
          <PiArrowSquareOutBold aria-hidden="true" />
        </a>
      </div>
    </section>
  );
}
