'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { requestJson } from '@/lib/http';
import { FONT_KEY } from '../teks';

const bacaUkuran = () => {
  try {
    return (typeof window !== 'undefined' && localStorage.getItem(FONT_KEY)) || 'normal';
  } catch {
    return 'normal';
  }
};

// Pengaturan di HP lansia: ukuran tulisan, ganti kode (sambung ke orang tua lain), keluar.
export function usePengaturanLansia({ onTerhubung }) {
  const router = useRouter();
  const [terbuka, setTerbuka] = useState(false);
  const [ukuran, setUkuran] = useState(bacaUkuran);
  const [kode, setKode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [sukses, setSukses] = useState('');

  const ubahUkuran = useCallback((id) => {
    setUkuran(id);
    try {
      localStorage.setItem(FONT_KEY, id);
    } catch {
      // penyimpanan diblokir: ukuran berlaku sampai halaman ditutup
    }
  }, []);

  const hubungkan = useCallback(
    async (e) => {
      e.preventDefault();
      if (!kode.trim()) return setError('Masukkan kode dulu.');
      setBusy(true);
      setError('');
      setSukses('');
      const { ok, data } = await requestJson('/api/auth/hubungkan', { method: 'POST', body: { kode: kode.trim().toUpperCase() } });
      setBusy(false);
      if (!ok) return setError(data.error || 'Kode tidak valid.');
      setKode('');
      setSukses(`Berhasil terhubung ke ${data.namaLansia}.`);
      onTerhubung();
      setTimeout(() => {
        setTerbuka(false);
        setSukses('');
      }, 1400);
    },
    [kode, onTerhubung]
  );

  const keluar = useCallback(async () => {
    if (!window.confirm('Keluar dari HP ini? Nanti tinggal masukkan kode baru tanpa perlu install ulang aplikasi.')) return;
    await requestJson('/api/auth/keluar?role=lansia', { method: 'POST' });
    router.replace('/hubungkan');
    router.refresh();
  }, [router]);

  return { terbuka, buka: () => setTerbuka(true), tutup: () => setTerbuka(false), ukuran, ubahUkuran, kode, setKode, busy, error, sukses, hubungkan, keluar };
}
