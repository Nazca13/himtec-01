'use client';

import { useEffect, useRef } from 'react';
import { buatDetektor } from '@/lib/deteksi';

// iOS meminta izin sensor gerak lewat ketukan pengguna; Android/desktop tidak.
export async function mintaIzinGerak() {
  const DM = typeof DeviceMotionEvent === 'undefined' ? null : DeviceMotionEvent;
  if (!DM) return false;
  if (typeof DM.requestPermission !== 'function') return true;
  try {
    return (await DM.requestPermission()) === 'granted';
  } catch {
    return false;
  }
}

// Mendengarkan akselerometer selama `aktif`, memanggil onDeteksi('KEJANG' | 'JATUH').
// shortcut: hanya bekerja saat app terbuka di layar (batas web). Deteksi di latar belakang butuh app native/jam pintar.
export function useDeteksiGerak(aktif, onDeteksi) {
  const cb = useRef(onDeteksi);
  useEffect(() => {
    cb.current = onDeteksi;
  });

  useEffect(() => {
    if (!aktif) return;
    const proses = buatDetektor((sebab) => cb.current(sebab));
    const onMotion = (e) => {
      const a = e.accelerationIncludingGravity;
      if (a) proses({ t: e.timeStamp || performance.now(), mag: Math.hypot(a.x ?? 0, a.y ?? 0, a.z ?? 0) });
    };
    window.addEventListener('devicemotion', onMotion);

    // Layar tetap menyala selama deteksi aktif (jika didukung), karena sensor berhenti saat layar mati.
    let kunci = null;
    navigator.wakeLock?.request('screen').then((l) => (kunci = l)).catch(() => {});

    return () => {
      window.removeEventListener('devicemotion', onMotion);
      kunci?.release().catch(() => {});
    };
  }, [aktif]);
}
