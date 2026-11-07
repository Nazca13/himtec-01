'use client';

import { useEffect } from 'react';

// Hanya di produksi: SW di dev menyimpan cache dan menyulitkan debugging.
export default function RegisterSW() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production' || !('serviceWorker' in navigator)) return;
    navigator.serviceWorker.register('/sw.js', { scope: '/', updateViaCache: 'none' }).catch(() => {});
  }, []);
  return null;
}
