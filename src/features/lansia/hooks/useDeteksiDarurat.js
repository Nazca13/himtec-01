'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { TIPE_INPUT } from '@/lib/constants';
import { mintaIzinGerak, useDeteksiGerak } from '@/hooks/useDeteksiGerak';
import { playSiren, stopSiren } from '@/lib/siren';
import { DETEKSI_KEY, HITUNG_MUNDUR_S, pesanGalat } from '../teks';

const bacaAktif = () => {
  try {
    return typeof window !== 'undefined' && localStorage.getItem(DETEKSI_KEY) === '1';
  } catch {
    return false;
  }
};

// Darurat kejang/jatuh: dipicu sensor gerak, tombol kejang, atau pesan simulasi dari /demo.
// Hitung mundur 30 detik dengan sirine dan getar; tidak dibatalkan = DARURAT terkirim otomatis.
export function useDeteksiDarurat({ phase, setPhase, kirim, fail }) {
  const [aktif, setAktif] = useState(bacaAktif);
  const [sebab, setSebab] = useState(null); // KEJANG | JATUH
  const [sisa, setSisa] = useState(HITUNG_MUNDUR_S);
  const sudahTerkirim = useRef(false);

  const mulai = useCallback(
    (s) => {
      setSebab(s);
      setSisa(HITUNG_MUNDUR_S);
      setPhase((p) => (p === 'recording' || p === 'sending' ? p : 'deteksi'));
    },
    [setPhase]
  );

  useDeteksiGerak(aktif, mulai);

  // Simulasi untuk presentasi: /demo/layar mengirim pesan dari situs yang sama.
  useEffect(() => {
    const onMessage = (e) => {
      if (e.origin !== window.location.origin || e.data?.sapa !== 'simulasi') return;
      const s = e.data.sebab === 'JATUH' ? 'JATUH' : 'KEJANG';
      if (e.data.instan) kirim({ tipeInput: TIPE_INPUT.OTOMATIS, sebab: s });
      else mulai(s);
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [mulai, kirim]);

  // Sirine, getar, dan hitung mundur selama fase 'deteksi'.
  useEffect(() => {
    if (phase !== 'deteksi') {
      stopSiren();
      return;
    }
    navigator.vibrate?.([400, 200, 400]);
    playSiren();
    const t = setInterval(() => {
      setSisa((s) => s - 1);
      navigator.vibrate?.([400, 200, 400]);
    }, 1000);
    return () => {
      clearInterval(t);
      stopSiren();
    };
  }, [phase]);

  useEffect(() => {
    if (phase !== 'deteksi') sudahTerkirim.current = false;
    else if (sisa <= 0 && !sudahTerkirim.current) {
      sudahTerkirim.current = true;
      kirim({ tipeInput: TIPE_INPUT.OTOMATIS, sebab });
    }
  }, [phase, sisa, sebab, kirim]);

  const ubah = useCallback(async () => {
    const nyala = !aktif && (await mintaIzinGerak());
    setAktif(nyala);
    try {
      localStorage.setItem(DETEKSI_KEY, nyala ? '1' : '0');
    } catch {
      // penyimpanan diblokir: pengaturan berlaku sampai halaman ditutup
    }
    if (!aktif && !nyala) fail(pesanGalat.sensor);
  }, [aktif, fail]);

  const kirimSekarang = useCallback(() => {
    stopSiren();
    kirim({ tipeInput: TIPE_INPUT.OTOMATIS, sebab });
  }, [kirim, sebab]);

  return { aktif, sebab, sisa, mulai, ubah, kirimSekarang, batal: () => setPhase('idle') };
}
