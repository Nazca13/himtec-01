'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { TIPE_INPUT } from '@/lib/constants';
import { lokasiUntukKirim } from '@/lib/geo';
import { useRecorder } from '@/hooks/useRecorder';
import { kirimSuara } from '../api';
import { MAX_REKAM_S, pesanGalat } from '../teks';

// Rekam suara (maks. 30 detik, berhenti otomatis) lalu kirim untuk triase AI.
export function usePesanSuara({ phase, setPhase, fail, terkirim }) {
  const { start, stop } = useRecorder();
  const [detik, setDetik] = useState(0);
  const sudahSelesai = useRef(false);

  const selesai = useCallback(async () => {
    setPhase('sending');
    try {
      const [audio, lokasi] = await Promise.all([stop(), lokasiUntukKirim()]);
      const { record } = await kirimSuara(audio, lokasi);
      terkirim({ tipeInput: TIPE_INPUT.VOICE }, record);
    } catch (err) {
      fail(pesanGalat.suara, err);
    }
  }, [stop, setPhase, fail, terkirim]);

  const mulai = useCallback(async () => {
    try {
      await start();
      setDetik(0);
      setPhase('recording');
    } catch {
      fail(pesanGalat.mikrofon);
    }
  }, [start, setPhase, fail]);

  useEffect(() => {
    if (phase !== 'recording') return;
    const t = setInterval(() => setDetik((d) => d + 1), 1000);
    return () => clearInterval(t);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'recording') sudahSelesai.current = false;
    else if (detik >= MAX_REKAM_S && !sudahSelesai.current) {
      sudahSelesai.current = true;
      selesai();
    }
  }, [phase, detik, selesai]);

  return { detik, mulai, selesai };
}
