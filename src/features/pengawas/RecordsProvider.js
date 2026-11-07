'use client';

import { createContext, useContext, useEffect, useState } from 'react';

const POLL_MS = 5_000;
const RecordsContext = createContext({ records: null, error: false, now: 0 });

export const useRecords = () => useContext(RecordsContext);

// Satu sumber data untuk semua tab keluarga: pindah tab tidak memuat ulang.
export default function RecordsProvider({ children }) {
  const [state, setState] = useState({ records: null, error: false, now: 0 }); // records null = belum termuat

  useEffect(() => {
    let alive = true;
    const load = async () => {
      if (document.hidden) return;
      try {
        const res = await fetch('/api/record?limit=50', { cache: 'no-store' });
        if (!res.ok) throw new Error();
        const { records } = await res.json();
        if (alive) setState({ records, error: false, now: Date.now() });
      } catch {
        if (alive) setState((s) => ({ ...s, error: true }));
      }
    };
    load();
    const timer = setInterval(load, POLL_MS);
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, []);

  return <RecordsContext.Provider value={state}>{children}</RecordsContext.Provider>;
}
