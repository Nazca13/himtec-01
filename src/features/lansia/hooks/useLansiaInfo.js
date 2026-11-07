'use client';

import { useCallback, useEffect, useState } from 'react';
import { panaskanLokasi } from '@/lib/geo';
import { hariIni } from '../teks';

const AWAL = { nama: 'Nenek', sapaan: 'Halo. Tekan tombol hijau kalau baik-baik saja ya.', sudahHariIni: false, streak: 0 };

// Keadaan HP lansia dari server: nama, status hari ini, dan pesan maskot.
// Sapaan lokal tampil langsung; pesan AI menyusul dan menggantikannya.
export function useLansiaInfo() {
  const [info, setInfo] = useState(AWAL);
  const [tanggal, setTanggal] = useState('');
  const [pesan, setPesan] = useState(null); // pesan maskot dari AI; null = pakai sapaan lokal

  const muat = useCallback(async () => {
    try {
      const d = await (await fetch('/api/saya', { cache: 'no-store' })).json();
      if (d.role === 'lansia') setInfo({ nama: d.namaLansia, sapaan: d.sapaan, sudahHariIni: Boolean(d.sudahHariIni), streak: d.streak ?? 0 });
      const s = await fetch('/api/saya/sapa', { cache: 'no-store' });
      if (s.ok) setPesan((await s.json()).pesan);
    } catch {
      // jaringan putus: biarkan sapaan lokal tetap tampil
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      muat();
      setTanggal(hariIni());
    }, 0);
    panaskanLokasi(); // lokasi siap sebelum tombol ditekan (jika izin sudah ada)
    return () => clearTimeout(t);
  }, [muat]);

  return { info, tanggal, pesan: pesan ?? info.sapaan, hapusPesan: () => setPesan(null), muat };
}
