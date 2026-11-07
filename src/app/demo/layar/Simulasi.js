'use client';

import { PiArrowFatLinesDownFill, PiLightningFill, PiSirenFill } from 'react-icons/pi';
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
        <PiLightningFill aria-hidden="true" /> Simulasi Kejang (30 dtk)
      </button>
      <button
        type="button"
        className={styles.simBtnDarurat}
        onClick={() => kirim('KEJANG', true)}
        title="Langsung kirim darurat MERAH & bunyikan sirine pengawas seketika"
      >
        <PiSirenFill aria-hidden="true" /> Darurat Instan
      </button>
      <button
        type="button"
        className={styles.simBtnJatuh}
        onClick={() => kirim('JATUH')}
        title="Simulasikan darurat jatuh pada lansia"
      >
        <PiArrowFatLinesDownFill aria-hidden="true" /> Simulasi Jatuh
      </button>
    </span>
  );
}
