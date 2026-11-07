'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  PiBellRingingFill,
  PiFileCsvFill,
  PiGearFill,
  PiPhoneFill,
  PiPrinterFill,
  PiShieldCheckFill,
  PiSignOutBold,
  PiSpeakerHighFill,
  PiTimerFill,
  PiUserFill,
} from 'react-icons/pi';
import { useRecords } from './RecordsProvider';
import { playSiren, stopSiren } from '@/lib/siren';
import Skeleton from './Skeleton';
import styles from './PengaturanView.module.css';

const KONTAK_DARURAT = [
  { nama: 'Ambulans Gawat Darurat', nomor: '119', label: '119' },
  { nama: 'Layanan Darurat Nasional', nomor: '112', label: '112' },
  { nama: 'Kepolisian RI', nomor: '110', label: '110' },
  { nama: 'Pemadam Kebakaran & SAR', nomor: '113', label: '113' },
];

export default function PengaturanView() {
  const router = useRouter();
  const { records, dipilih, household, me, isAdmin } = useRecords();

  const [notifSuara, setNotifSuara] = useState(() => {
    try {
      return typeof window !== 'undefined' && localStorage.getItem('sapa.notif_suara') !== '0';
    } catch {
      return true;
    }
  });

  const [pollingRate, setPollingRate] = useState(() => {
    try {
      return (typeof window !== 'undefined' && localStorage.getItem('sapa.polling_rate')) || '5000';
    } catch {
      return '5000';
    }
  });

  if (!me) return <Skeleton />;

  const toggleNotifSuara = () => {
    const next = !notifSuara;
    setNotifSuara(next);
    try {
      localStorage.setItem('sapa.notif_suara', next ? '1' : '0');
    } catch {}
  };

  const tesBunyiAlarm = () => {
    try {
      playSiren();
      setTimeout(() => {
        stopSiren();
      }, 3500);
    } catch {}
  };

  const ubahPolling = (val) => {
    setPollingRate(val);
    try {
      localStorage.setItem('sapa.polling_rate', val);
    } catch {}
  };

  const unduhCsv = () => {
    if (!records || !records.length) return alert('Belum ada riwayat aktivitas untuk diekspor.');
    const header = ['ID', 'Waktu (WIB)', 'Tipe Aktivitas', 'Status Bahaya', 'Ringkasan', 'Gejala', 'Latitude', 'Longitude'];
    const rows = records.map((r) => [
      r.id,
      new Date(r.createdAt).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }),
      r.tipeInput,
      r.statusBahaya,
      `"${(r.aiAnalysis?.ringkasan || '').replace(/"/g, '""')}"`,
      `"${(r.aiAnalysis?.gejala || []).join('; ')}"`,
      r.latitude ?? '',
      r.longitude ?? '',
    ]);
    const csvContent = [header.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `laporan-kesehatan-${dipilih?.nama || 'lansia'}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const cetakRingkasan = () => {
    window.print();
  };

  const keluar = async () => {
    if (window.confirm('Keluar dari akun pengawas? Nanti tinggal masukkan kode untuk masuk lagi.')) {
      await fetch('/api/auth/keluar?role=pengawas', { method: 'POST' });
      router.replace('/');
      router.refresh();
    }
  };

  return (
    <div className={styles.page}>
      <div>
        <h1 className={styles.heading}>Pengaturan & Layanan</h1>
        <p className={styles.sub}>Konfigurasi notifikasi darurat, ekspor data riwayat lansia, dan kontak cepat.</p>
      </div>

      {/* 1. Pengaturan Alarm & Peringatan */}
      <section className={styles.section} aria-labelledby="notif-title">
        <h2 id="notif-title" className={styles.sectionTitle}>
          <PiBellRingingFill aria-hidden="true" />
          Peringatan & Sirine Darurat
        </h2>
        <div className={styles.card}>
          <div className={styles.row}>
            <div className={styles.rowText}>
              <strong>Bunyikan Sirine Otomatis</strong>
              <small>Membunyikan nada alarm di browser saat ada laporan darurat (status MERAH) dari orang tua.</small>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={notifSuara}
              className={`${styles.switch} ${notifSuara ? styles.on : ''}`}
              onClick={toggleNotifSuara}
              aria-label="Bunyikan sirine otomatis"
            >
              <span />
            </button>
          </div>

          <div className={styles.row}>
            <div className={styles.rowText}>
              <strong>Uji Bunyi Alarm Darurat</strong>
              <small>Dengarkan sampel sirine untuk memastikan audio browser aktif.</small>
            </div>
            <button type="button" className={styles.actionBtn} onClick={tesBunyiAlarm}>
              <PiSpeakerHighFill aria-hidden="true" />
              Tes Suara
            </button>
          </div>
        </div>
      </section>

      {/* 2. Frekuensi Pembaruan Data Realtime */}
      <section className={styles.section} aria-labelledby="sync-title">
        <h2 id="sync-title" className={styles.sectionTitle}>
          <PiTimerFill aria-hidden="true" />
          Frekuensi Pembaruan Data
        </h2>
        <div className={styles.card}>
          <div className={styles.row}>
            <div className={styles.rowText}>
              <strong>Interval Cek Otomatis</strong>
              <small>Dashboard otomatis memeriksa kabar terbaru secara berkala.</small>
            </div>
            <select
              value={pollingRate}
              onChange={(e) => ubahPolling(e.target.value)}
              className={styles.actionBtn}
              aria-label="Interval cek otomatis"
            >
              <option value="3000">3 Detik (Cepat / Responsif)</option>
              <option value="5000">5 Detik (Standar Rekomendasi)</option>
              <option value="15000">15 Detik (Hemat Kuota)</option>
            </select>
          </div>
        </div>
      </section>

      {/* 3. Ekspor Data Laporan Kesehatan */}
      <section className={styles.section} aria-labelledby="export-title">
        <h2 id="export-title" className={styles.sectionTitle}>
          <PiFileCsvFill aria-hidden="true" />
          Ekspor & Rekam Medis {dipilih ? `(${dipilih.nama})` : ''}
        </h2>
        <div className={styles.card}>
          <div className={styles.row}>
            <div className={styles.rowText}>
              <strong>Unduh Riwayat Lengkap (CSV / Excel)</strong>
              <small>Format tabel siap buka di Microsoft Excel untuk diserahkan ke dokter atau perawat.</small>
            </div>
            <button type="button" className={`${styles.actionBtn} ${styles.primaryAction}`} onClick={unduhCsv}>
              <PiFileCsvFill aria-hidden="true" />
              Unduh CSV
            </button>
          </div>

          <div className={styles.row}>
            <div className={styles.rowText}>
              <strong>Cetak / Simpan PDF Ringkasan Medis</strong>
              <small>Cetak ringkasan kondisi lansia langsung dari browser.</small>
            </div>
            <button type="button" className={styles.actionBtn} onClick={cetakRingkasan}>
              <PiPrinterFill aria-hidden="true" />
              Cetak PDF
            </button>
          </div>
        </div>
      </section>

      {/* 4. Panggilan Cepat Darurat Medis */}
      <section className={styles.section} aria-labelledby="contacts-title">
        <h2 id="contacts-title" className={styles.sectionTitle}>
          <PiPhoneFill aria-hidden="true" />
          Nomor Kontak Darurat Cepat (1-Klik Dial)
        </h2>
        <div className={styles.card}>
          <div className={styles.contactsGrid}>
            {KONTAK_DARURAT.map((k) => (
              <a key={k.nomor} href={`tel:${k.nomor}`} className={styles.contactItem} title={`Telepon ${k.nama}`}>
                <div>
                  <strong>{k.nama}</strong>
                  <small>Nomor: {k.label}</small>
                </div>
                <PiPhoneFill className={styles.dialIcon} aria-hidden="true" />
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Profil Akun & Sesi */}
      <section className={styles.section} aria-labelledby="profile-title">
        <h2 id="profile-title" className={styles.sectionTitle}>
          <PiUserFill aria-hidden="true" />
          Profil & Sesi Anda
        </h2>
        <div className={styles.card}>
          <div className={styles.profileInfo}>
            <div className={styles.profileItem}>
              <span>Nama Anggota</span>
              <strong>{me.nama}</strong>
            </div>
            <div className={styles.profileItem}>
              <span>Peran</span>
              <strong>{me.role === 'ADMIN' ? '👑 Admin Keluarga' : '👁️ Pemantau'}</strong>
            </div>
            <div className={styles.profileItem}>
              <span>Nama Keluarga</span>
              <strong>{household?.nama || 'Keluarga'}</strong>
            </div>
            <div className={styles.profileItem}>
              <span>Kode Undangan</span>
              <strong>{household?.kodeUndangan || '••••••••'}</strong>
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.rowText}>
              <strong>Keluar dari Akun</strong>
              <small>Nanti Anda bisa masuk kembali cukup dengan memasukkan kode undangan keluarga.</small>
            </div>
            <button type="button" className={`${styles.actionBtn} ${styles.dangerBtn}`} onClick={keluar}>
              <PiSignOutBold aria-hidden="true" />
              Keluar Akun
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
