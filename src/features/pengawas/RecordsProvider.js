'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { initAudioUnlocker, playSiren, stopSiren, subscribeSiren } from '@/lib/siren';

const POLL_MS = 5_000;
const PILIHAN_KEY = 'sapa.lansia';
const EMPTY = {
  records: null,
  household: null,
  me: null,
  lansia: [],
  members: [],
  dipilihId: null,
  lokasiTerakhir: null,
  error: false,
  now: 0,
};
const RecordsContext = createContext({
  ...EMPTY,
  refresh: () => {},
  pilih: () => {},
  alarmActive: false,
  alarmBlocked: false,
  stopAlarm: () => {},
  playAlarmAgain: () => {},
});

export const useRecords = () => useContext(RecordsContext);

const ingat = (id) => {
  try {
    localStorage.setItem(PILIHAN_KEY, id);
  } catch {}
};
const bacaIngatan = () => {
  try {
    return localStorage.getItem(PILIHAN_KEY) ?? '';
  } catch {
    return '';
  }
};

// Satu sumber data untuk semua tab keluarga: peran, keluarga, daftar lansia, anggota, dan log lansia terpilih.
export default function RecordsProvider({ children }) {
  const router = useRouter();
  const [state, setState] = useState(EMPTY); // records null = belum termuat
  const [alarmActive, setAlarmActive] = useState(false);
  const [alarmBlocked, setAlarmBlocked] = useState(false);
  const dipilihRef = useRef(null);
  const loadRef = useRef(async () => {});
  const dismissedRecordIdRef = useRef(null);

  // Inisialisasi audio unlocker dan langganan status sirine
  useEffect(() => {
    initAudioUnlocker();
    const unsub = subscribeSiren(({ active, blocked }) => {
      setAlarmActive(active);
      setAlarmBlocked(blocked);
    });
    return () => {
      unsub();
      stopSiren();
    };
  }, []);

  const stopAlarm = useCallback(() => {
    stopSiren();
    if (state.records?.[0]?.id) {
      dismissedRecordIdRef.current = state.records[0].id;
    }
  }, [state.records]);

  const playAlarmAgain = useCallback(() => {
    playSiren();
  }, []);

  useEffect(() => {
    let alive = true;
    dipilihRef.current = bacaIngatan();
    const load = async () => {
      if (document.hidden) return;
      try {
        const res = await fetch(`/api/dashboard?lansia=${encodeURIComponent(dipilihRef.current ?? '')}`, { cache: 'no-store' });
        if (res.status === 401) return void router.replace('/'); // sesi habis atau dikeluarkan admin
        if (!res.ok) throw new Error();
        const d = await res.json();
        dipilihRef.current = d.dipilihId;
        if (alive) setState({ ...d, error: false, now: Date.now() });

        // Sirine darurat jika kabar terbaru berstatus MERAH
        const latest = d.records?.[0];
        const isMerah = latest?.statusBahaya === 'MERAH';

        if (isMerah) {
          if (latest.id !== dismissedRecordIdRef.current) {
            const notifEnabled = typeof window !== 'undefined' && localStorage.getItem('sapa.notif_suara') !== '0';
            if (notifEnabled) {
              playSiren();
            }
          }
        } else {
          stopSiren();
        }
      } catch {
        if (alive) setState((s) => ({ ...s, error: true }));
      }
    };
    loadRef.current = load;
    load();
    const intervalMs = (typeof window !== 'undefined' && Number(localStorage.getItem('sapa.polling_rate'))) || POLL_MS;
    const timer = setInterval(load, intervalMs);
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, [router]);

  const refresh = useCallback(() => loadRef.current(), []);
  const pilih = useCallback((id) => {
    stopSiren();
    dipilihRef.current = id;
    ingat(id);
    setState((s) => ({ ...s, dipilihId: id, records: null })); // tampilkan kerangka sampai log lansia baru tiba
    loadRef.current();
  }, []);

  const dipilih = state.lansia.find((l) => l.id === state.dipilihId) ?? null;
  const isAdmin = state.me?.role === 'ADMIN';
  return (
    <RecordsContext.Provider
      value={{
        ...state,
        dipilih,
        isAdmin,
        refresh,
        pilih,
        alarmActive,
        alarmBlocked,
        stopAlarm,
        playAlarmAgain,
      }}
    >
      {children}
    </RecordsContext.Provider>
  );
}
