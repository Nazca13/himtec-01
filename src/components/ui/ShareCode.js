'use client';

import { useState } from 'react';
import { PiCheckBold, PiCopyBold, PiWhatsappLogoFill } from 'react-icons/pi';
import styles from './ShareCode.module.css';

// Menampilkan kode besar + tombol kirim WhatsApp dan salin link. Link berisi ?kode= supaya
// penerima cukup membuka link lalu menekan satu tombol, tanpa mengetik.
export default function ShareCode({ kode, path, pesan }) {
  const [copied, setCopied] = useState(false);
  const link = () => `${window.location.origin}${path}?kode=${kode}`;
  const grouped = kode.length === 6 ? `${kode.slice(0, 3)} ${kode.slice(3)}` : `${kode.slice(0, 4)} ${kode.slice(4)}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt('Salin link ini:', link());
    }
  };

  return (
    <div className={styles.box}>
      <p className={styles.code} aria-label={`Kode ${kode.split('').join(' ')}`}>
        {grouped}
      </p>
      <div className={styles.actions}>
        <button className={`${styles.btn} ${styles.wa}`} onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`${pesan}\n${link()}`)}`, '_blank', 'noopener')}>
          <PiWhatsappLogoFill aria-hidden="true" />
          Kirim lewat WhatsApp
        </button>
        <button className={styles.btn} onClick={copy}>
          {copied ? <PiCheckBold aria-hidden="true" /> : <PiCopyBold aria-hidden="true" />}
          {copied ? 'Link tersalin' : 'Salin link'}
        </button>
      </div>
    </div>
  );
}
