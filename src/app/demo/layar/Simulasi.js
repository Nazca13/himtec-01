'use client';

// Tombol presentasi: memicu peringatan kejang/jatuh di HP lansia (iframe kiri) tanpa harus mengguncang HP.
export default function Simulasi({ className }) {
  const kirim = (sebab) => {
    const hp = document.querySelector('iframe[data-hp-lansia]');
    hp?.contentWindow?.postMessage({ sapa: 'simulasi', sebab }, window.location.origin);
  };
  return (
    <span className={className}>
      <button onClick={() => kirim('KEJANG')}>Simulasikan kejang</button>
      <button onClick={() => kirim('JATUH')}>Simulasikan jatuh</button>
    </span>
  );
}
