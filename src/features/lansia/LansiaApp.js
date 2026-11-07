'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence } from 'motion/react';
import * as m from 'motion/react-m';
import {
  PiCheckCircleFill,
  PiFireFill,
  PiMicrophoneFill,
  PiShieldCheckFill,
  PiSirenFill,
  PiStopFill,
  PiWarningCircleFill,
} from 'react-icons/pi';
import Mascot from '@/components/ui/Mascot';
import { TIPE_INPUT } from '@/lib/constants';
import { useRecorder } from '@/hooks/useRecorder';
import { lokasiUntukKirim, panaskanLokasi } from '@/lib/geo';
import { kirimSuara, kirimTombol } from './api';
import styles from './LansiaApp.module.css';

const MAX_REKAM_S = 30;
const TAMPIL_TERKIRIM_MS = 3_200;
const KONFETI = Array.from({ length: 14 }, (_, i) => i);

// Balasan maskot setelah sebuah tombol: cepat (tanpa menunggu AI) dan menyebut nama.
function balasan(tipe, nama, record) {
  if (tipe === TIPE_INPUT.DARURAT) return `Tenang ya, ${nama}. Keluarga sudah diberi tahu dan segera menghubungi.`;
  if (tipe === TIPE_INPUT.VOICE) {
    if (record?.statusBahaya === 'MERAH') return `Tenang ya, ${nama}. Keluarga sudah diberi tahu dan segera menghubungi.`;
    const gejala = record?.aiAnalysis?.gejala?.slice(0, 2).join(' dan ');
    return gejala ? `Terima kasih sudah cerita, ${nama}. Keluarga sudah tahu soal ${gejala}.` : `Pesan ${nama} sudah sampai. Keluarga akan membacanya.`;
  }
  return `Terima kasih, ${nama}. Keluarga sudah tahu ${nama} baik-baik saja.`;
}

export default function LansiaApp() {
  // idle | recording | sending | sent | error
  const [phase, setPhase] = useState('idle');
  const [errorText, setErrorText] = useState('');
  const [putus, setPutus] = useState(false); // HP ini diputus keluarga: perlu dihubungkan ulang
  const [detik, setDetik] = useState(0);
  const [info, setInfo] = useState({ nama: 'Nenek', streak: 0, sudahHariIni: false, sapaan: 'Halo. Tekan tombol hijau kalau baik-baik saja ya.' });
  const [pesan, setPesan] = useState(null); // pesan maskot dari AI; null = pakai sapaan lokal
  const [balas, setBalas] = useState('');
  const { start, stop } = useRecorder();

  // Keadaan terbaru: sapaan lokal langsung, pesan AI menyusul dan menggantikannya.
  const muat = useCallback(async () => {
    try {
      const d = await (await fetch('/api/saya', { cache: 'no-store' })).json();
      if (d.role === 'lansia') setInfo({ nama: d.namaLansia, streak: d.streak, sudahHariIni: d.sudahHariIni, sapaan: d.sapaan });
      const s = await fetch('/api/saya/sapa', { cache: 'no-store' });
      if (s.ok) setPesan((await s.json()).pesan);
    } catch {}
  }, []);

  useEffect(() => {
    const t = setTimeout(muat, 0);
    panaskanLokasi(); // lokasi siap sebelum tombol ditekan (jika izin sudah ada)
    return () => clearTimeout(t);
  }, [muat]);

  const fail = useCallback((text, err) => {
    setPutus(err?.message === 'putus');
    setErrorText(err?.message === 'putus' ? 'HP ini diputus oleh keluarga. Minta kode baru, lalu hubungkan lagi.' : text);
    setPhase('error');
  }, []);

  const selesai = useCallback((tipe, record) => {
    setBalas(balasan(tipe, info.nama, record));
    setPesan(null);
    setPhase('sent');
  }, [info.nama]);

  const finishRecording = useCallback(async () => {
    setPhase('sending');
    try {
      const [audio, lokasi] = await Promise.all([stop(), lokasiUntukKirim()]);
      const { record } = await kirimSuara(audio, lokasi);
      selesai(TIPE_INPUT.VOICE, record);
    } catch (err) {
      fail('Pesan suara belum terkirim. Coba lagi.', err);
    }
  }, [stop, fail, selesai]);

  // Setelah perayaan: kembali ke tombol dan ambil hitungan hari serta pesan terbaru.
  useEffect(() => {
    if (phase !== 'sent') return;
    const t = setTimeout(() => {
      setPhase('idle');
      muat();
    }, TAMPIL_TERKIRIM_MS);
    return () => clearTimeout(t);
  }, [phase, muat]);

  // Penghitung rekaman; berhenti otomatis di batas maksimum.
  useEffect(() => {
    if (phase !== 'recording') return;
    const t = setInterval(() => setDetik((d) => d + 1), 1000);
    return () => clearInterval(t);
  }, [phase]);

  const autoFinished = useRef(false);
  useEffect(() => {
    if (phase !== 'recording') autoFinished.current = false;
    else if (detik >= MAX_REKAM_S && !autoFinished.current) {
      autoFinished.current = true;
      finishRecording();
    }
  }, [phase, detik, finishRecording]);

  const pressButton = async (tipe) => {
    setPhase('sending');
    try {
      await kirimTombol(tipe, await lokasiUntukKirim());
      selesai(tipe);
    } catch (err) {
      fail('Pesan belum terkirim. Periksa internet, lalu coba lagi.', err);
    }
  };

  const startRecording = async () => {
    try {
      await start();
      setDetik(0);
      setPhase('recording');
    } catch {
      fail('Izin mikrofon dibutuhkan. Minta keluarga mengaktifkannya.');
    }
  };

  const teksMaskot = pesan ?? info.sapaan;

  return (
    <main className={styles.app}>
      <section className={styles.sky}>
        <div className={styles.bar}>
          <span className={styles.hello}>Halo, {info.nama}</span>
          <span className={`${styles.streak} ${info.streak ? styles.hot : ''}`}>
            <PiFireFill aria-hidden="true" />
            {info.streak ? (
              <>
                {info.streak} hari<span className="sr-only"> berturut-turut</span>
              </>
            ) : (
              'Mulai hari ini'
            )}
          </span>
        </div>
        <div className={styles.talk}>
          <Mascot size={118} mood={phase === 'sent' ? 'senang' : 'idle'} priority />
          <div className={styles.bubble} role="status" aria-live="polite">
            <p key={teksMaskot}>{teksMaskot}</p>
          </div>
        </div>
      </section>

      <div className={styles.buttons}>
        <m.button whileTap={{ y: 5 }} className={`${styles.big} tone-HIJAU`} onClick={() => pressButton(TIPE_INPUT.AMAN)}>
          <span className={styles.disc}>
            <PiShieldCheckFill aria-hidden="true" />
          </span>
          <span className={styles.label}>
            <strong>Saya Aman</strong>
            <span>Kabari keluarga: saya baik-baik saja</span>
          </span>
        </m.button>

        <m.button whileTap={{ y: 5 }} className={`${styles.big} tone-KUNING`} onClick={startRecording}>
          <span className={styles.disc}>
            <PiMicrophoneFill aria-hidden="true" />
          </span>
          <span className={styles.label}>
            <strong>Bicara</strong>
            <span>Ceritakan keluhan lewat suara</span>
          </span>
        </m.button>

        <m.button whileTap={{ y: 5 }} className={`${styles.big} ${styles.danger} tone-MERAH`} onClick={() => pressButton(TIPE_INPUT.DARURAT)}>
          <span className={styles.disc}>
            <PiSirenFill aria-hidden="true" />
          </span>
          <span className={styles.label}>
            <strong>DARURAT</strong>
            <span>Panggil keluarga sekarang</span>
          </span>
        </m.button>
      </div>

      <p className={`${styles.today} ${info.sudahHariIni ? styles.done : ''}`}>
        {info.sudahHariIni ? <PiCheckCircleFill aria-hidden="true" /> : null}
        {info.sudahHariIni ? 'Hari ini sudah memberi kabar' : 'Belum memberi kabar hari ini'}
      </p>

      <AnimatePresence>
        {phase !== 'idle' && (
          <m.div
            key="overlay"
            className={`${styles.overlay} ${styles[phase]}`}
            role="status"
            aria-live="assertive"
            initial={{ opacity: 0, scale: 1.03 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            {phase === 'recording' && (
              <>
                <span className={styles.listen}>
                  <Mascot size={120} mood="mendengar" />
                </span>
                <p className={styles.msg}>Silakan bicara</p>
                <p className={styles.timer}>
                  0:{String(detik).padStart(2, '0')} / 0:{MAX_REKAM_S}
                </p>
                <m.button whileTap={{ scale: 0.96 }} className={styles.action} onClick={finishRecording}>
                  <PiStopFill aria-hidden="true" />
                  Selesai bicara
                </m.button>
              </>
            )}
            {phase === 'sending' && (
              <>
                <Mascot size={110} mood="mendengar" />
                <p className={styles.msg}>Mengirim</p>
              </>
            )}
            {phase === 'sent' && (
              <>
                <div className={styles.confetti} aria-hidden="true">
                  {KONFETI.map((i) => (
                    <i key={i} style={{ '--i': i }} />
                  ))}
                </div>
                <Mascot size={150} mood="senang" />
                <p className={styles.msg}>Pesan Tersampaikan</p>
                <p className={styles.reply}>{balas}</p>
              </>
            )}
            {phase === 'error' && (
              <>
                <Mascot size={110} mood="siaga" />
                <PiWarningCircleFill className={styles.warn} aria-hidden="true" />
                <p className={`${styles.msg} ${styles.errText}`}>{errorText}</p>
                {putus ? (
                  <Link href="/hubungkan" className={styles.action}>
                    Hubungkan ulang
                  </Link>
                ) : (
                  <m.button whileTap={{ scale: 0.96 }} className={styles.action} onClick={() => setPhase('idle')}>
                    Kembali
                  </m.button>
                )}
              </>
            )}
          </m.div>
        )}
      </AnimatePresence>
    </main>
  );
}
