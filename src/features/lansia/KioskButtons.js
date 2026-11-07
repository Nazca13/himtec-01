'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence } from 'motion/react';
import * as m from 'motion/react-m';
import {
  PiCheckCircleFill,
  PiMicrophoneFill,
  PiShieldCheckFill,
  PiSirenFill,
  PiStopFill,
  PiWarningCircleFill,
} from 'react-icons/pi';
import Wordmark from '@/components/ui/Wordmark';
import { TIPE_INPUT } from '@/lib/constants';
import { useRecorder } from '@/hooks/useRecorder';
import { kirimSuara, kirimTombol } from './api';
import styles from './kiosk.module.css';

const MAX_REKAM_S = 30;
const TAMPIL_TERKIRIM_MS = 3_000;

export default function KioskButtons() {
  // idle | recording | sending | sent | error
  const [phase, setPhase] = useState('idle');
  const [errorText, setErrorText] = useState('');
  const [detik, setDetik] = useState(0);
  const { start, stop } = useRecorder();

  const fail = useCallback((text) => {
    setErrorText(text);
    setPhase('error');
  }, []);

  const finishRecording = useCallback(async () => {
    setPhase('sending');
    try {
      await kirimSuara(await stop());
      setPhase('sent');
    } catch {
      fail('Pesan suara belum terkirim. Coba lagi.');
    }
  }, [stop, fail]);

  // Kembali ke 3 tombol setelah "Pesan Tersampaikan".
  useEffect(() => {
    if (phase !== 'sent') return;
    const t = setTimeout(() => setPhase('idle'), TAMPIL_TERKIRIM_MS);
    return () => clearTimeout(t);
  }, [phase]);

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
      await kirimTombol(tipe);
      setPhase('sent');
    } catch {
      fail('Pesan belum terkirim. Periksa internet, lalu coba lagi.');
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

  return (
    <main className={styles.kiosk}>
      <header className={styles.head}>
        <Wordmark />
        <p>Tekan satu tombol</p>
      </header>

      <div className={styles.buttons}>
        <m.button whileTap={{ scale: 0.96 }} transition={{ type: 'spring', stiffness: 500, damping: 30 }} className={`${styles.big} tone-HIJAU`} onClick={() => pressButton(TIPE_INPUT.AMAN)}>
          <span className={styles.disc}>
            <PiShieldCheckFill aria-hidden="true" />
          </span>
          <span className={styles.label}>
            <strong>Saya Aman</strong>
            <span>Kabari keluarga bahwa saya baik-baik saja</span>
          </span>
        </m.button>

        <m.button whileTap={{ scale: 0.96 }} transition={{ type: 'spring', stiffness: 500, damping: 30 }} className={`${styles.big} tone-KUNING`} onClick={startRecording}>
          <span className={styles.disc}>
            <PiMicrophoneFill aria-hidden="true" />
          </span>
          <span className={styles.label}>
            <strong>Bicara</strong>
            <span>Ceritakan keluhan lewat suara</span>
          </span>
        </m.button>

        <m.button whileTap={{ scale: 0.96 }} transition={{ type: 'spring', stiffness: 500, damping: 30 }} className={`${styles.big} ${styles.danger} tone-MERAH`} onClick={() => pressButton(TIPE_INPUT.DARURAT)}>
          <span className={styles.disc}>
            <PiSirenFill aria-hidden="true" />
          </span>
          <span className={styles.label}>
            <strong>DARURAT</strong>
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
          initial={{ opacity: 0, scale: 1.03 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          {phase === 'recording' && (
            <>
              <span className={styles.orb}>
                <PiMicrophoneFill aria-hidden="true" />
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
          {phase === 'sending' && <p className={styles.msg}>Mengirim</p>}
          {phase === 'sent' && (
            <>
              <m.span
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 260, damping: 14 }}
                className={styles.bigIcon}
              >
                <PiCheckCircleFill aria-hidden="true" />
              </m.span>
              <p className={styles.msg}>Pesan Tersampaikan</p>
            </>
          )}
          {phase === 'error' && (
            <>
              <PiWarningCircleFill className={`${styles.bigIcon} ${styles.warn}`} aria-hidden="true" />
              <p className={`${styles.msg} ${styles.errText}`}>{errorText}</p>
              <m.button whileTap={{ scale: 0.96 }} className={styles.action} onClick={() => setPhase('idle')}>
                Kembali
              </m.button>
            </>
          )}
        </m.div>
      )}
      </AnimatePresence>
    </main>
  );
}
