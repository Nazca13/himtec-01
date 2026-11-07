'use client';

import styles from './demo.module.css';

// Tombol simulasi demo: memicu laporan kejang/jatuh di HP lansia (iframe kiri) secara instan atau dengan hitung mundur.
export default function Simulasi({ className }) {
  const kirim = (sebab, instan = false) => {
    const hp = document.querySelector('iframe[data-hp-lansia]');
    hp?.contentWindow?.postMessage({ sapa: 'simulasi', sebab, instan }, window.location.origin);
  };

  return (
    <span className={className}>
      <button
        type="button"
        className={styles.simBtnKejang}
        onClick={() => kirim('KEJANG')}
        title="Simulasikan darurat kejang pada lansia (Hitung mundur 30s & sirine HP)"
      >
        ⚡ Simulasi Kejang (30s)
      </button>
      <button
        type="button"
        className={styles.simBtnDarurat}
        onClick={() => kirim('KEJANG', true)}
        title="Langsung kirim darurat MERAH & bunyikan sirine pengawas seketika"
      >
        🚨 Sirine Darurat Instan
      </button>
      <button
        type="button"
        className={styles.simBtnJatuh}
        onClick={() => kirim('JATUH')}
        title="Simulasikan darurat jatuh pada lansia"
      >
        💥 Simulasi Jatuh
      </button>
    </span>
  );
}
