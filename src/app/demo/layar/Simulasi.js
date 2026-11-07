'use client';

import styles from './demo.module.css';

// Tombol simulasi demo: memicu laporan kejang/jatuh di HP lansia (iframe kiri) secara instan.
export default function Simulasi({ className }) {
  const kirim = (sebab) => {
    const hp = document.querySelector('iframe[data-hp-lansia]');
    hp?.contentWindow?.postMessage({ sapa: 'simulasi', sebab }, window.location.origin);
  };

  return (
    <span className={className}>
      <button
        type="button"
        className={styles.simBtnKejang}
        onClick={() => kirim('KEJANG')}
        title="Simulasikan darurat kejang pada lansia"
      >
        ⚡ Simulasikan Kejang
      </button>
      <button
        type="button"
        className={styles.simBtnJatuh}
        onClick={() => kirim('JATUH')}
        title="Simulasikan darurat jatuh pada lansia"
      >
        💥 Simulasikan Jatuh
      </button>
    </span>
  );
}
