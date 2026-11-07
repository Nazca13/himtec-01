'use client';

import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence } from 'motion/react';
import * as m from 'motion/react-m';
import { PiGearFill, PiSignOutBold } from 'react-icons/pi';
import Mascot from '@/components/ui/Mascot';
import { TIPE_INPUT } from '@/lib/constants';
import { lokasiUntukKirim } from '@/lib/geo';
import { kirimKabar } from './api';
import DaruratKejang from './components/DaruratKejang';
import KeluhanSheet from './components/KeluhanSheet';
import LayarDeteksi from './components/LayarDeteksi';
import LayarRekam from './components/LayarRekam';
import { LayarGalat, LayarMengirim, LayarTerkirim } from './components/LayarStatus';
import PengaturanSheet from './components/PengaturanSheet';
import StatusBanner from './components/StatusBanner';
import TigaTombol from './components/TigaTombol';
import { useDeteksiDarurat } from './hooks/useDeteksiDarurat';
import { useLansiaInfo } from './hooks/useLansiaInfo';
import { usePengaturanLansia } from './hooks/usePengaturanLansia';
import { usePesanSuara } from './hooks/usePesanSuara';
import { balasan, pesanGalat, TAMPIL_TERKIRIM_MS } from './teks';
import styles from './LansiaApp.module.css';

const KELAS_UKURAN = { besar: styles.fontBesar, ekstra: styles.fontEkstra };

// Layar orang tua. File ini hanya merangkai: tiap tanggung jawab ada di hooks/ dan components/.
//   fase: idle | keluhan | recording | sending | sent | error | deteksi
export default function LansiaApp() {
  const [phase, setPhase] = useState('idle');
  const [galat, setGalat] = useState({ teks: '', putus: false }); // putus = HP diputus keluarga
  const [balas, setBalas] = useState('');

  const { info, tanggal, pesan, hapusPesan, muat } = useLansiaInfo();
  const pengaturan = usePengaturanLansia({ onTerhubung: muat });

  const fail = useCallback((teks, err) => {
    const putus = err?.message === 'putus';
    setGalat({ teks: putus ? pesanGalat.putus : teks, putus });
    setPhase('error');
  }, []);

  const terkirim = useCallback(
    (kabar, record) => {
      setBalas(balasan(kabar, info.nama, record));
      hapusPesan();
      setPhase('sent');
    },
    [info.nama, hapusPesan]
  );

  const kirim = useCallback(
    async (kabar) => {
      setPhase('sending');
      try {
        const { record } = await kirimKabar(kabar, await lokasiUntukKirim());
        terkirim(kabar, record);
      } catch (err) {
        fail(pesanGalat.kirim, err);
      }
    },
    [terkirim, fail]
  );

  const suara = usePesanSuara({ phase, setPhase, fail, terkirim });
  const deteksi = useDeteksiDarurat({ phase, setPhase, kirim, fail });

  // Setelah terkirim: kembali ke tombol dan ambil pesan maskot terbaru.
  useEffect(() => {
    if (phase !== 'sent') return;
    const t = setTimeout(() => {
      setPhase('idle');
      muat();
    }, TAMPIL_TERKIRIM_MS);
    return () => clearTimeout(t);
  }, [phase, muat]);

  return (
    <main className={`${styles.app} ${KELAS_UKURAN[pengaturan.ukuran] ?? ''}`}>
      <header className={styles.top}>
        <div className={styles.topRow}>
          <div>
            <h1 className={styles.hello}>Halo, {info.nama}</h1>
            <p className={styles.date}>{tanggal}</p>
          </div>
          <button type="button" className={styles.settingsBtn} onClick={pengaturan.buka} aria-label="Pengaturan" title="Buka pengaturan & ganti kode">
            <PiGearFill aria-hidden="true" />
          </button>
        </div>
      </header>

      <section className={styles.talk} role="status" aria-live="polite">
        <Mascot size={68} mood={phase === 'sent' ? 'senang' : 'idle'} priority />
        <p key={pesan}>{pesan}</p>
      </section>

      <StatusBanner info={info} onSudahObat={() => kirim({ tipeInput: TIPE_INPUT.KELUHAN, keluhan: ['SUDAH_OBAT'] })} />
      <TigaTombol onAman={() => kirim({ tipeInput: TIPE_INPUT.AMAN })} onKeluhan={() => setPhase('keluhan')} onDarurat={() => kirim({ tipeInput: TIPE_INPUT.DARURAT })} />
      <DaruratKejang deteksiAktif={deteksi.aktif} onKejang={() => deteksi.mulai('KEJANG')} onUbahDeteksi={deteksi.ubah} />

      <footer className={styles.foot}>
        <button type="button" className={styles.logoutBtn} onClick={pengaturan.keluar}>
          <PiSignOutBold aria-hidden="true" />
          Keluar / Ganti Kode
        </button>
      </footer>

      <AnimatePresence>
        {phase !== 'idle' && (
          <m.div key="overlay" className={`${styles.overlay} ${styles[phase]}`} role="status" aria-live="assertive" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
            {phase === 'keluhan' && <KeluhanSheet onBatal={() => setPhase('idle')} onBicara={suara.mulai} onPilih={(id) => kirim({ tipeInput: TIPE_INPUT.KELUHAN, keluhan: [id] })} />}
            {phase === 'recording' && <LayarRekam detik={suara.detik} onSelesai={suara.selesai} />}
            {phase === 'deteksi' && <LayarDeteksi sebab={deteksi.sebab} sisa={deteksi.sisa} onBatal={deteksi.batal} onSekarang={deteksi.kirimSekarang} />}
            {phase === 'sending' && <LayarMengirim />}
            {phase === 'sent' && <LayarTerkirim balas={balas} />}
            {phase === 'error' && <LayarGalat teks={galat.teks} putus={galat.putus} onKembali={() => setPhase('idle')} />}
          </m.div>
        )}
      </AnimatePresence>

      <AnimatePresence>{pengaturan.terbuka && <PengaturanSheet p={pengaturan} />}</AnimatePresence>
    </main>
  );
}
