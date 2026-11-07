'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { PiArrowRightBold } from 'react-icons/pi';
import Mascot from '@/components/ui/Mascot';
import { useRecords } from './RecordsProvider';
import styles from './AiLiveWidget.module.css';

// Widget AI live: ringkasan kondisi dibuat ulang otomatis setiap ada kabar baru (id log terbaru berubah).
export default function AiLiveWidget() {
  const { records, dipilih } = useRecords();
  const ready = records !== null && Boolean(dipilih);
  const lansiaId = dipilih?.id ?? '';
  // Kunci: lansia terpilih + log terbarunya. Ganti lansia atau ada kabar baru = ringkasan baru.
  const latestId = `${lansiaId}:${records?.[0]?.id ?? 'kosong'}`;
  const [hasil, setHasil] = useState({ untuk: null, teks: '', sumber: '' });

  useEffect(() => {
    if (!ready) return;
    let alive = true;
    fetch(`/api/ringkasan?lansia=${encodeURIComponent(lansiaId)}`, { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => alive && setHasil({ untuk: latestId, teks: d.ringkasan, sumber: d.sumber }))
      .catch(() => alive && setHasil({ untuk: latestId, teks: 'Ringkasan belum bisa dimuat. Coba lagi sebentar.', sumber: 'lokal' }));
    return () => {
      alive = false;
    };
    // hanya bergantung pada id log terbaru: polling 5 detik tidak memicu ringkasan baru
  }, [latestId, ready, lansiaId]);

  const memuat = hasil.untuk !== latestId;

  return (
    <section className={styles.card} aria-labelledby="ai-live">
      <header className={styles.head}>
        <Mascot size={64} mood={memuat ? 'mendengar' : 'idle'} />
        <div>
          <h2 id="ai-live">Ringkasan AI</h2>
          <p className={styles.live}>
            <span className={styles.dot} aria-hidden="true" />
            {memuat ? 'Membaca kabar terbaru' : 'Diperbarui otomatis'}
          </p>
        </div>
      </header>

      {memuat && !hasil.teks ? (
        <div className={styles.skel} role="status" aria-label="Memuat ringkasan">
          <i />
          <i />
          <i />
        </div>
      ) : (
        <p className={`${styles.text} ${memuat ? styles.stale : ''}`} aria-live="polite">
          {hasil.teks}
        </p>
      )}

      <Link href="/pengawas/asisten" className={styles.more}>
        Tanya soal {dipilih?.nama ?? 'lansia'}
        <PiArrowRightBold aria-hidden="true" />
      </Link>
    </section>
  );
}
