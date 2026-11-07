'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence } from 'motion/react';
import * as m from 'motion/react-m';
import {
  PiArrowFatLinesDownFill,
  PiBrainFill,
  PiChatTeardropDotsFill,
  PiHeartbeatFill,
  PiMicrophoneFill,
  PiPhoneCallFill,
  PiPillFill,
  PiShieldCheckFill,
  PiSirenFill,
  PiSmileyNervousFill,
  PiSpiralBold,
  PiStopFill,
  PiThermometerHotFill,
  PiWarningCircleFill,
  PiWindFill,
} from 'react-icons/pi';
import Mascot from '@/components/ui/Mascot';
import { TIPE_INPUT } from '@/lib/constants';
import { lokasiUntukKirim, panaskanLokasi } from '@/lib/geo';
import { KELUHAN } from '@/lib/keluhan';
import { useRecorder } from '@/hooks/useRecorder';
import { kirimKabar, kirimSuara } from './api';
import styles from './LansiaApp.module.css';

const MAX_REKAM_S = 30;
const TAMPIL_TERKIRIM_MS = 3_200;

// "Sabtu, 8 November": membantu orientasi waktu orang tua.
const hariIni = () => new Intl.DateTimeFormat('id-ID', { timeZone: 'Asia/Jakarta', weekday: 'long', day: 'numeric', month: 'long' }).format(new Date());

const IKON_KELUHAN = {
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

// Balasan maskot setelah kabar terkirim: cepat (tanpa menunggu AI) dan menyebut nama.
function balasan(kabar, nama, record) {
  if (record?.statusBahaya === 'MERAH') return `Tenang ya, ${nama}. Keluarga sudah diberi tahu dan segera menghubungi.`;
  if (kabar.tipeInput === TIPE_INPUT.KELUHAN || kabar.tipeInput === TIPE_INPUT.VOICE) {
    const gejala = record?.aiAnalysis?.gejala?.slice(0, 2).join(' dan ').toLowerCase();
    return gejala ? `Terima kasih sudah cerita, ${nama}. Keluarga sudah tahu soal ${gejala}.` : `Pesan ${nama} sudah sampai. Keluarga akan membacanya.`;
  }
  return `Terima kasih, ${nama}. Keluarga sudah tahu ${nama} baik-baik saja.`;
}

// Layar orang tua: sapaan + tanggal, maskot, dan tiga tombol. Tidak ada pengaturan atau menu.
export default function LansiaApp() {
  // idle | keluhan | recording | sending | sent | error
  const [phase, setPhase] = useState('idle');
  const [errorText, setErrorText] = useState('');
  const [putus, setPutus] = useState(false); // HP ini diputus keluarga: perlu dihubungkan ulang
  const [detik, setDetik] = useState(0);
  const [info, setInfo] = useState({ nama: 'Nenek', sapaan: 'Halo. Tekan tombol hijau kalau baik-baik saja ya.' });
  const [tanggal, setTanggal] = useState('');
  const [pesan, setPesan] = useState(null); // pesan maskot dari AI; null = pakai sapaan lokal
  const [balas, setBalas] = useState('');
  const { start, stop } = useRecorder();

  // Keadaan terbaru: sapaan lokal langsung, pesan AI menyusul dan menggantikannya.
  const muat = useCallback(async () => {
    try {
      const d = await (await fetch('/api/saya', { cache: 'no-store' })).json();
      if (d.role === 'lansia') setInfo({ nama: d.namaLansia, sapaan: d.sapaan });
      const s = await fetch('/api/saya/sapa', { cache: 'no-store' });
      if (s.ok) setPesan((await s.json()).pesan);
    } catch {}
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      muat();
      setTanggal(hariIni());
    }, 0);
    panaskanLokasi(); // lokasi siap sebelum tombol ditekan (jika izin sudah ada)
    return () => clearTimeout(t);
  }, [muat]);

  const fail = useCallback((text, err) => {
    setPutus(err?.message === 'putus');
    setErrorText(err?.message === 'putus' ? 'HP ini diputus oleh keluarga. Minta kode baru, lalu hubungkan lagi.' : text);
    setPhase('error');
  }, []);

  const terkirim = useCallback(
    (kabar, record) => {
      setBalas(balasan(kabar, info.nama, record));
      setPesan(null);
      setPhase('sent');
    },
    [info.nama]
  );

  const kirim = useCallback(
    async (kabar) => {
      setPhase('sending');
      try {
        const { record } = await kirimKabar(kabar, await lokasiUntukKirim());
        terkirim(kabar, record);
      } catch (err) {
        fail('Pesan belum terkirim. Periksa internet, lalu coba lagi.', err);
      }
    },
    [terkirim, fail]
  );

  // Demo / pengujian: /demo/layar bisa memicu simulasi kejang/jatuh lewat postMessage
  useEffect(() => {
    const onMessage = (e) => {
      if (e.origin === window.location.origin && e.data?.sapa === 'simulasi') {
        const sebab = e.data.sebab === 'JATUH' ? 'JATUH' : 'KEJANG';
        kirim({ tipeInput: TIPE_INPUT.KELUHAN, keluhan: [sebab] });
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [kirim]);

  const finishRecording = useCallback(async () => {
    setPhase('sending');
    try {
      const [audio, lokasi] = await Promise.all([stop(), lokasiUntukKirim()]);
      const { record } = await kirimSuara(audio, lokasi);
      terkirim({ tipeInput: TIPE_INPUT.VOICE }, record);
    } catch (err) {
      fail('Pesan suara belum terkirim. Coba lagi.', err);
    }
  }, [stop, fail, terkirim]);

  // Setelah terkirim: kembali ke tombol dan ambil pesan maskot terbaru.
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

  const startRecording = async () => {
    try {
      await start();
      setDetik(0);
      setPhase('recording');
    } catch {
      fail('Izin mikrofon dibutuhkan. Ketuk gambar keluhan saja, atau minta keluarga mengaktifkan mikrofon.');
    }
  };

  const teksMaskot = pesan ?? info.sapaan;

  return (
    <main className={styles.app}>
      <header className={styles.top}>
        <h1 className={styles.hello}>Halo, {info.nama}</h1>
        <p className={styles.date}>{tanggal}</p>
      </header>

      <section className={styles.talk} role="status" aria-live="polite">
        <Mascot size={68} mood={phase === 'sent' ? 'senang' : 'idle'} priority />
        <p key={teksMaskot}>{teksMaskot}</p>
      </section>

      <div className={styles.buttons}>
        <m.button whileTap={{ scale: 0.97 }} className={`${styles.big} tone-HIJAU`} onClick={() => kirim({ tipeInput: TIPE_INPUT.AMAN })}>
          <span className={styles.disc}>
            <PiShieldCheckFill aria-hidden="true" />
          </span>
          <span className={styles.label}>
            <strong>Saya Aman</strong>
            <span>Kabari keluarga: saya baik-baik saja</span>
          </span>
        </m.button>

        <m.button whileTap={{ scale: 0.97 }} className={`${styles.big} tone-KUNING`} onClick={() => setPhase('keluhan')}>
          <span className={styles.disc}>
            <PiChatTeardropDotsFill aria-hidden="true" />
          </span>
          <span className={styles.label}>
            <strong>Keluhan</strong>
            <span>Bicara, atau pilih gambar</span>
          </span>
        </m.button>

        <m.button whileTap={{ scale: 0.97 }} className={`${styles.big} tone-MERAH`} onClick={() => kirim({ tipeInput: TIPE_INPUT.DARURAT })}>
          <span className={styles.disc}>
            <PiSirenFill aria-hidden="true" />
          </span>
          <span className={styles.label}>
            <strong>Darurat</strong>
            <span>Panggil keluarga sekarang</span>
          </span>
        </m.button>
      </div>

      <AnimatePresence>
        {phase !== 'idle' && (
          <m.div
            key="overlay"
            className={`${styles.overlay} ${styles[phase]}`}
            role="status"
            aria-live="assertive"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            {phase === 'keluhan' && (
              <div className={styles.sheet}>
                <div className={styles.sheetHead}>
                  <h2>Apa keluhannya?</h2>
                  <button className={styles.textBtn} onClick={() => setPhase('idle')}>
                    Batal
                  </button>
                </div>
                <button className={styles.speak} onClick={startRecording}>
                  <PiMicrophoneFill aria-hidden="true" />
                  Bicara
                </button>
                <p className={styles.or}>atau ketuk satu gambar, langsung terkirim</p>
                <ul className={styles.grid}>
                  {KELUHAN.map((k) => {
                    const Icon = IKON_KELUHAN[k.id];
                    return (
                      <li key={k.id}>
                        <button className={`${styles.tile} ${k.bahaya === 'MERAH' ? styles.tileRed : ''}`} onClick={() => kirim({ tipeInput: TIPE_INPUT.KELUHAN, keluhan: [k.id] })}>
                          <Icon aria-hidden="true" />
                          {k.label}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {phase === 'recording' && (
              <>
                <span className={styles.listen}>
                  <Mascot size={110} mood="mendengar" />
                </span>
                <p className={styles.msg}>Silakan bicara</p>
                <p className={styles.timer}>
                  0:{String(detik).padStart(2, '0')} / 0:{MAX_REKAM_S}
                </p>
                <m.button whileTap={{ scale: 0.97 }} className={styles.action} onClick={finishRecording}>
                  <PiStopFill aria-hidden="true" />
                  Selesai bicara
                </m.button>
              </>
            )}

            {phase === 'sending' && (
              <>
                <Mascot size={100} mood="mendengar" />
                <p className={styles.msg}>Mengirim</p>
              </>
            )}

            {phase === 'sent' && (
              <>
                <Mascot size={130} mood="senang" />
                <p className={styles.msg}>Pesan Tersampaikan</p>
                <p className={styles.reply}>{balas}</p>
              </>
            )}

            {phase === 'error' && (
              <>
                <PiWarningCircleFill className={styles.warn} aria-hidden="true" />
                <p className={`${styles.msg} ${styles.errText}`}>{errorText}</p>
                {putus ? (
                  <Link href="/hubungkan" className={styles.action}>
                    Hubungkan ulang
                  </Link>
                ) : (
                  <m.button whileTap={{ scale: 0.97 }} className={styles.action} onClick={() => setPhase('idle')}>
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
