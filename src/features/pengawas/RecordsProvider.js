'use client';

import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

const POLL_MS = 5_000;
const EMPTY = { records: null, household: null, me: null, error: false, now: 0 };
const RecordsContext = createContext({ ...EMPTY, refresh: () => {} });

export const useRecords = () => useContext(RecordsContext);

// Satu sumber data untuk semua tab keluarga: pindah tab tidak memuat ulang.
export default function RecordsProvider({ children }) {
  const router = useRouter();
  const [state, setState] = useState(EMPTY); // records null = belum termuat
  const loadRef = useRef(async () => {});

  useEffect(() => {
    let alive = true;
    const load = async () => {
      if (document.hidden) return;
      try {
        const res = await fetch('/api/record?limit=200', { cache: 'no-store' });
        if (res.status === 401) return void router.replace('/'); // sesi habis atau grup dihapus
        if (!res.ok) throw new Error();
        const { records, household, me } = await res.json();
        if (alive) setState({ records, household, me, error: false, now: Date.now() });
      } catch {
        if (alive) setState((s) => ({ ...s, error: true }));
      }
    };
    loadRef.current = load;
    load();
    const timer = setInterval(load, POLL_MS);
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, [router]);

  return <RecordsContext.Provider value={{ ...state, refresh: () => loadRef.current() }}>{children}</RecordsContext.Provider>;
}
