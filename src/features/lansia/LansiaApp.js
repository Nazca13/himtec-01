'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AnimatePresence } from 'motion/react';
import * as m from 'motion/react-m';
import {
  PiArrowFatLinesDownFill,
  PiBrainFill,
  PiChatTeardropDotsFill,
  PiCheckCircleFill,
  PiClockCountdownFill,
  PiGearFill,
  PiHeartbeatFill,
  PiMicrophoneFill,
  PiPhoneCallFill,
  PiPhoneFill,
  PiPillFill,
  PiShieldCheckFill,
  PiSignOutBold,
  PiSirenFill,
  PiSmileyNervousFill,
  PiSpiralBold,
  PiStopFill,
  PiThermometerHotFill,
  PiVibrateFill,
  PiWarningCircleFill,
  PiWindFill,
  PiXBold,
} from 'react-icons/pi';
import Mascot from '@/components/ui/Mascot';
import { TIPE_INPUT } from '@/lib/constants';
import { lokasiUntukKirim, panaskanLokasi } from '@/lib/geo';
import { KELUHAN } from '@/lib/keluhan';
import { useDeteksiGerak, mintaIzinGerak } from '@/hooks/useDeteksiGerak';
import { useRecorder } from '@/hooks/useRecorder';
import { kirimKabar, kirimSuara } from './api';
import styles from './LansiaApp.module.css';

const MAX_REKAM_S = 30;
const HITUNG_MUNDUR_S = 30;
const TAMPIL_TERKIRIM_MS = 3_200;
const DETEKSI_KEY = 'sapa.deteksi';

// Petunjuk untuk orang di sekitar saat peringatan otomatis (pertolongan pertama umum).
const PETUNJUK = {
  KEJANG: ['Miringkan tubuhnya ke samping.', 'Jangan masukkan apa pun ke mulutnya.', 'Jauhkan benda keras atau tajam.', 'Jangan menahan gerakannya.', 'Kejang lebih dari 5 menit: telepon 119.'],
  JATUH: ['Jangan langsung mengangkat tubuhnya.', 'Tanyakan apa yang sakit; periksa kepala dan pinggul.', 'Tidak sadar atau tidak bisa bergerak: telepon 119.'],
};

// Bunyi peringatan singkat untuk menarik perhatian orang di sekitar (bisa gagal jika browser memblokir audio).
function bunyi() {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = 880;
    gain.gain.value = 0.25;
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.35);
    osc.onended = () => ctx.close();
  } catch {}
}

// "Sabtu, 8 November": membantu orientasi waktu orang tua.
const hariIni = () => new Intl.DateTimeFormat('id-ID', { timeZone: 'Asia/Jakarta', weekday: 'long', day: 'numeric', month: 'long' }).format(new Date());

const IKON_KELUHAN = {
  PUSING: PiSpiralBold,
  NYERI_DADA: PiHeartbeatFill,
  SESAK: PiWindFill,
  JATUH: PiArrowFatLinesDownFill,
  KEJANG: PiBrainFill,
  MUAL: PiSmileyNervousFill,
  DEMAM: PiThermometerHotFill,
  OBAT_HABIS: PiPillFill,
  TELEPON: PiPhoneCallFill,
};

// Balasan maskot setelah kabar terkirim: cepat (tanpa menunggu AI) dan menyebut nama.
function balasan(kabar, nama, record) {
  if (record?.statusBahaya === 'MERAH') return `Tenang ya, ${nama}. Keluarga sudah diberi tahu dan segera menghubungi.`;
  if (kabar.tipeInput === TIPE_INPUT.KELUHAN || kabar.tipeInput === TIPE_INPUT.VOICE) {
    const gejala = record?.aiAnalysis?.gejala?.slice(0, 2).join(' dan ').toLowerCase();
    return gejala ? `Terima kasih sudah cerita, ${nama}. Keluarga sudah tahu soal ${gejala}.` : `Pesan ${nama} sudah sampai. Keluarga akan membacanya.`;
  }
  return `Terima kasih, ${nama}. Keluarga sudah tahu ${nama} baik-baik saja.`;
}

// Layar orang tua: sapaan + tanggal, maskot, dan tiga tombol. Tidak ada pengaturan atau menu.
export default function LansiaApp() {
  const router = useRouter();
  // idle | keluhan | recording | sending | sent | error | deteksi
  const [phase, setPhase] = useState('idle');
  const [errorText, setErrorText] = useState('');
  const [putus, setPutus] = useState(false); // HP ini diputus keluarga: perlu dihubungkan ulang
  const [detik, setDetik] = useState(0);
  const [info, setInfo] = useState({ nama: 'Nenek', sapaan: 'Halo. Tekan tombol hijau kalau baik-baik saja ya.', sudahHariIni: false, streak: 0 });
  const [tanggal, setTanggal] = useState('');
  const [pesan, setPesan] = useState(null); // pesan maskot dari AI; null = pakai sapaan lokal
  const [balas, setBalas] = useState('');
  const [bukaSetting, setBukaSetting] = useState(false);
  const [fontSize, setFontSize] = useState(() => {
    try {
      return (typeof window !== 'undefined' && localStorage.getItem('sapa.font_size')) || 'normal';
    } catch {
      return 'normal';
    }
  });
  const [kodeBaru, setKodeBaru] = useState('');
  const [settingBusy, setSettingBusy] = useState(false);
  const [settingError, setSettingError] = useState('');
  const [deteksiAktif, setDeteksiAktif] = useState(() => {
    try {
      return typeof window !== 'undefined' && localStorage.getItem(DETEKSI_KEY) === '1';
    } catch {
      return false;
    }
  });
  const [sebab, setSebab] = useState(null); // KEJANG | JATUH
  const [sisa, setSisa] = useState(HITUNG_MUNDUR_S);
  const { start, stop } = useRecorder();

  // Keadaan terbaru: sapaan lokal langsung, pesan AI menyusul dan menggantikannya.
  const muat = useCallback(async () => {
    try {
      const d = await (await fetch('/api/saya', { cache: 'no-store' })).json();
      if (d.role === 'lansia') {
        setInfo({
          nama: d.namaLansia,
          sapaan: d.sapaan,
          sudahHariIni: Boolean(d.sudahHariIni),
          streak: d.streak ?? 0,
        });
      }
      const s = await fetch('/api/saya/sapa', { cache: 'no-store' });
      if (s.ok) setPesan((await s.json()).pesan);
    } catch {}
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      muat();
      setTanggal(hariIni());
    }, 0);
    panaskanLokasi(); // lokasi siap sebelum tombol ditekan (jika izin sudah ada)
    return () => clearTimeout(t);
  }, [muat]);

  const fail = useCallback((text, err) => {
    setPutus(err?.message === 'putus');
    setErrorText(err?.message === 'putus' ? 'HP ini diputus oleh keluarga. Minta kode baru, lalu hubungkan lagi.' : text);
    setPhase('error');
  }, []);

  const terkirim = useCallback(
    (kabar, record) => {
      setBalas(balasan(kabar, info.nama, record));
      setPesan(null);
      setPhase('sent');
    },
    [info.nama]
  );

  const kirim = useCallback(
    async (kabar) => {
      setPhase('sending');
      try {
        const { record } = await kirimKabar(kabar, await lokasiUntukKirim());
        terkirim(kabar, record);
      } catch (err) {
        fail('Pesan belum terkirim. Periksa internet, lalu coba lagi.', err);
      }
    },
    [terkirim, fail]
  );

  // Memicu hitung mundur darurat kejang/jatuh
  const mulaiPeringatan = useCallback((s) => {
    setSebab(s);
    setSisa(HITUNG_MUNDUR_S);
    setPhase((p) => (p === 'recording' || p === 'sending' ? p : 'deteksi'));
  }, []);

  useDeteksiGerak(deteksiAktif, mulaiPeringatan);

  // Demo / pengujian: /demo/layar bisa memicu simulasi kejang/jatuh lewat postMessage
  useEffect(() => {
    const onMessage = (e) => {
      if (e.origin === window.location.origin && e.data?.sapa === 'simulasi') {
        const s = e.data.sebab === 'JATUH' ? 'JATUH' : 'KEJANG';
        mulaiPeringatan(s);
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [mulaiPeringatan]);

  const ubahDeteksi = async () => {
    const nyala = !deteksiAktif && (await mintaIzinGerak());
    setDeteksiAktif(nyala);
    try {
      localStorage.setItem(DETEKSI_KEY, nyala ? '1' : '0');
    } catch {}
    if (!deteksiAktif && !nyala) fail('Sensor gerak tidak bisa dipakai di HP atau browser ini.');
  };

  // Getaran HP & hitung mundur 30 detik saat kejang/jatuh terdeteksi
  useEffect(() => {
    if (phase !== 'deteksi') return;
    navigator.vibrate?.([400, 200, 400]);
    bunyi();
    const t = setInterval(() => {
      setSisa((s) => s - 1);
      navigator.vibrate?.([400, 200, 400]);
      bunyi();
    }, 1000);
    return () => clearInterval(t);
  }, [phase]);

  const otomatisTerkirim = useRef(false);
  useEffect(() => {
    if (phase !== 'deteksi') otomatisTerkirim.current = false;
    else if (sisa <= 0 && !otomatisTerkirim.current) {
      otomatisTerkirim.current = true;
      kirim({ tipeInput: TIPE_INPUT.OTOMATIS, sebab });
    }
  }, [phase, sisa, sebab, kirim]);

  const finishRecording = useCallback(async () => {
    setPhase('sending');
    try {
      const [audio, lokasi] = await Promise.all([stop(), lokasiUntukKirim()]);
      const { record } = await kirimSuara(audio, lokasi);
      terkirim({ tipeInput: TIPE_INPUT.VOICE }, record);
    } catch (err) {
      fail('Pesan suara belum terkirim. Coba lagi.', err);
    }
  }, [stop, fail, terkirim]);

  // Setelah terkirim: kembali ke tombol dan ambil pesan maskot terbaru.
  useEffect(() => {
    if (phase !== 'sent') return;
    const t = setTimeout(() => {
      setPhase('idle');
      muat();
    }, TAMPIL_TERKIRIM_MS);
    return () => clearTimeout(t);
  }, [phase, muat]);

  // Penghitung rekaman; berhenti otomatis di batas maksimum.
  useEffect(() => {
    if (phase !== 'recording') return;
    const t = setInterval(() => setDetik((d) => d + 1), 1000);
    return () => clearInterval(t);
  }, [phase]);

  const autoFinished = useRef(false);
  useEffect(() => {
    if (phase !== 'recording') autoFinished.current = false;
    else if (detik >= MAX_REKAM_S && !autoFinished.current) {
      autoFinished.current = true;
      finishRecording();
    }
  }, [phase, detik, finishRecording]);

  const startRecording = async () => {
    try {
      await start();
      setDetik(0);
      setPhase('recording');
    } catch {
      fail('Izin mikrofon dibutuhkan. Ketuk gambar keluhan saja, atau minta keluarga mengaktifkan mikrofon.');
    }
  };

  const keluarLansia = async () => {
    if (window.confirm('Keluar dari HP ini? Nanti tinggal masukkan kode baru tanpa perlu install ulang aplikasi.')) {
      await fetch('/api/auth/keluar?role=lansia', { method: 'POST' });
      router.replace('/hubungkan');
      router.refresh();
    }
  };

  const ubahUkuran = (ukuran) => {
    setFontSize(ukuran);
    try {
      localStorage.setItem('sapa.font_size', ukuran);
    } catch {}
  };

  const hubungkanKodeBaru = async (e) => {
    e.preventDefault();
    if (!kodeBaru.trim()) return setSettingError('Masukkan kode dulu.');
    setSettingBusy(true);
    setSettingError('');
    try {
      const res = await fetch('/api/auth/hubungkan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kode: kodeBaru.trim().toUpperCase() }),
      });
      const data = await res.json();
      setSettingBusy(false);
      if (res.ok) {
        setBukaSetting(false);
        setKodeBaru('');
        muat();
        alert(`Berhasil terhubung ke ${data.namaLansia}!`);
      } else {
        setSettingError(data.error || 'Kode tidak valid.');
      }
    } catch {
      setSettingBusy(false);
      setSettingError('Gagal menghubungkan. Periksa internet.');
    }
  };

  const teksMaskot = pesan ?? info.sapaan;

  return (
    <main className={`${styles.app} ${fontSize === 'besar' ? styles.fontBesar : fontSize === 'ekstra' ? styles.fontEkstra : ''}`}>
      <header className={styles.top}>
        <div className={styles.topRow}>
          <div>
            <h1 className={styles.hello}>Halo, {info.nama}</h1>
            <p className={styles.date}>{tanggal}</p>
          </div>
          <button
            type="button"
            className={styles.settingsBtn}
            onClick={() => setBukaSetting(true)}
            aria-label="Pengaturan"
            title="Buka pengaturan & ganti kode"
          >
            <PiGearFill aria-hidden="true" />
          </button>
        </div>
      </header>

      <section className={styles.talk} role="status" aria-live="polite">
        <Mascot size={68} mood={phase === 'sent' ? 'senang' : 'idle'} priority />
        <p key={teksMaskot}>{teksMaskot}</p>
      </section>

      {/* Baris Laporan Absensi Harian & Tombol Cepat Minum Obat */}
      <section className={`${styles.statusBanner} ${info.sudahHariIni ? styles.bannerSudah : styles.bannerBelum}`} aria-label="Status kabar hari ini">
        <span className={styles.bannerIcon}>
          {info.sudahHariIni ? <PiCheckCircleFill aria-hidden="true" /> : <PiClockCountdownFill aria-hidden="true" />}
        </span>
        <div className={styles.bannerContent}>
          <strong>{info.sudahHariIni ? 'Laporan aman hari ini tercatat' : 'Belum memberi kabar hari ini'}</strong>
          <small>
            {info.sudahHariIni
              ? `${info.streak > 1 ? `🔥 Rutin ${info.streak} hari! ` : ''}Keluarga sudah tahu kondisi Anda.`
              : 'Tekan tombol hijau di bawah untuk lapor aman.'}
          </small>
        </div>
        <button
          type="button"
          className={styles.pillQuickBtn}
          onClick={() => kirim({ tipeInput: TIPE_INPUT.KELUHAN, keluhan: ['SUDAH_OBAT'] })}
          title="Konfirmasi sudah minum obat"
        >
          <PiPillFill aria-hidden="true" />
          <span>Sudah Obat</span>
        </button>
      </section>

      <div className={styles.buttons}>
        <m.button whileTap={{ scale: 0.97 }} className={`${styles.big} tone-HIJAU`} onClick={() => kirim({ tipeInput: TIPE_INPUT.AMAN })}>
          <span className={styles.disc}>
            <PiShieldCheckFill aria-hidden="true" />
          </span>
          <span className={styles.label}>
            <strong>Saya Aman</strong>
            <span>Kabari keluarga: saya baik-baik saja</span>
          </span>
        </m.button>

        <m.button whileTap={{ scale: 0.97 }} className={`${styles.big} tone-KUNING`} onClick={() => setPhase('keluhan')}>
          <span className={styles.disc}>
            <PiChatTeardropDotsFill aria-hidden="true" />
          </span>
          <span className={styles.label}>
            <strong>Keluhan</strong>
            <span>Bicara, atau pilih gambar</span>
          </span>
        </m.button>

        <m.button whileTap={{ scale: 0.97 }} className={`${styles.big} tone-MERAH`} onClick={() => kirim({ tipeInput: TIPE_INPUT.DARURAT })}>
          <span className={styles.disc}>
            <PiSirenFill aria-hidden="true" />
          </span>
          <span className={styles.label}>
            <strong>Darurat</strong>
            <span>Panggil keluarga sekarang</span>
          </span>
        </m.button>
      </div>

      {/* Tombol kejang di bawah & sensor deteksi getar */}
      <div className={styles.extraSection}>
        <m.button
          whileTap={{ scale: 0.98 }}
          type="button"
          className={styles.quickKejangBtn}
          onClick={() => mulaiPeringatan('KEJANG')}
        >
          <span className={styles.quickKejangIcon}>
            <PiBrainFill aria-hidden="true" />
          </span>
          <span className={styles.quickKejangText}>
            <strong>Tombol Darurat Kejang</strong>
            <small>Ketuk jika orang tua mengalami kejang</small>
          </span>
          <span className={styles.quickKejangBadge}>⚡ Darurat</span>
        </m.button>

        <div className={styles.cell}>
          <PiVibrateFill className={styles.cellIcon} aria-hidden="true" />
          <span className={styles.cellText}>
            <strong>Deteksi getar & kejang otomatis</strong>
            <small>{deteksiAktif ? 'Aktif: HP bergetar & kirim darurat otomatis' : 'Kirim darurat otomatis jika HP mendeteksi guncangan'}</small>
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={deteksiAktif}
            aria-label="Deteksi getar dan kejang"
            className={`${styles.switch} ${deteksiAktif ? styles.on : ''}`}
            onClick={ubahDeteksi}
          >
            <span />
          </button>
        </div>
      </div>

      <footer className={styles.foot}>
        <button
          type="button"
          className={styles.logoutBtn}
          onClick={keluarLansia}
        >
          <PiSignOutBold aria-hidden="true" />
          Keluar / Ganti Kode
        </button>
      </footer>

      <AnimatePresence>
        {phase !== 'idle' && (
          <m.div
            key="overlay"
            className={`${styles.overlay} ${styles[phase]}`}
            role="status"
            aria-live="assertive"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            {phase === 'keluhan' && (
              <div className={styles.sheet}>
                <div className={styles.sheetHead}>
                  <h2>Apa keluhannya?</h2>
                  <button className={styles.textBtn} onClick={() => setPhase('idle')}>
                    Batal
                  </button>
                </div>
                <button className={styles.speak} onClick={startRecording}>
                  <PiMicrophoneFill aria-hidden="true" />
                  Bicara
                </button>
                <p className={styles.or}>atau ketuk satu gambar, langsung terkirim</p>
                <ul className={styles.grid}>
                  {KELUHAN.map((k) => {
                    const Icon = IKON_KELUHAN[k.id];
                    return (
                      <li key={k.id}>
                        <button className={`${styles.tile} ${k.bahaya === 'MERAH' ? styles.tileRed : ''}`} onClick={() => kirim({ tipeInput: TIPE_INPUT.KELUHAN, keluhan: [k.id] })}>
                          <Icon aria-hidden="true" />
                          {k.label}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {phase === 'recording' && (
              <>
                <span className={styles.listen}>
                  <Mascot size={110} mood="mendengar" />
                </span>
                <p className={styles.msg}>Silakan bicara</p>
                <p className={styles.timer}>
                  0:{String(detik).padStart(2, '0')} / 0:{MAX_REKAM_S}
                </p>
                <m.button whileTap={{ scale: 0.97 }} className={styles.action} onClick={finishRecording}>
                  <PiStopFill aria-hidden="true" />
                  Selesai bicara
                </m.button>
              </>
            )}

            {phase === 'deteksi' && (
              <>
                <p className={styles.alertTitle}>{sebab === 'JATUH' ? 'Sepertinya Anda jatuh' : 'Terdeteksi guncangan seperti kejang'}</p>
                <p className={styles.count} aria-label={`${sisa} detik`}>
                  {Math.max(sisa, 0)}
                </p>
                <p className={styles.alertSub}>Keluarga dihubungi otomatis jika tidak dibatalkan.</p>
                <m.button whileTap={{ scale: 0.97 }} className={styles.okBtn} onClick={() => setPhase('idle')}>
                  Saya baik-baik saja
                </m.button>
                <div className={styles.bystander}>
                  <strong>Untuk orang di sekitar</strong>
                  <ul>
                    {(PETUNJUK[sebab] ?? PETUNJUK.KEJANG).map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                  <a href="tel:119" className={styles.call}>
                    <PiPhoneFill aria-hidden="true" />
                    Telepon 119
                  </a>
                </div>
              </>
            )}

            {phase === 'sending' && (
              <>
                <Mascot size={100} mood="mendengar" />
                <p className={styles.msg}>Mengirim</p>
              </>
            )}

            {phase === 'sent' && (
              <>
                <Mascot size={130} mood="senang" />
                <p className={styles.msg}>Pesan Tersampaikan</p>
                <p className={styles.reply}>{balas}</p>
              </>
            )}

            {phase === 'error' && (
              <>
                <PiWarningCircleFill className={styles.warn} aria-hidden="true" />
                <p className={`${styles.msg} ${styles.errText}`}>{errorText}</p>
                {putus ? (
                  <Link href="/hubungkan" className={styles.action}>
                    Hubungkan ulang
                  </Link>
                ) : (
                  <m.button whileTap={{ scale: 0.97 }} className={styles.action} onClick={() => setPhase('idle')}>
                    Kembali
                  </m.button>
                )}
              </>
            )}
          </m.div>
        )}
      </AnimatePresence>

      {/* Sheet Pengaturan Lansia & Ganti Kode Langsung */}
      <AnimatePresence>
        {bukaSetting && (
          <m.div
            key="settingsModal"
            className={styles.settingsOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setBukaSetting(false)}
          >
            <m.div
              className={styles.settingsSheet}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 280 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={styles.sheetHead}>
                <h2>Pengaturan Lansia</h2>
                <button type="button" className={styles.closeBtn} onClick={() => setBukaSetting(false)} aria-label="Tutup">
                  <PiXBold aria-hidden="true" />
                </button>
              </div>

              <div className={styles.settingGroup}>
                <label className={styles.settingLabel}>🔤 Ukuran Tulisan</label>
                <div className={styles.sizePicker}>
                  {[
                    { id: 'normal', label: 'Standar' },
                    { id: 'besar', label: 'Besar' },
                    { id: 'ekstra', label: 'Sangat Besar' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      className={`${styles.sizeBtn} ${fontSize === s.id ? styles.sizeActive : ''}`}
                      onClick={() => ubahUkuran(s.id)}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.settingGroup}>
                <label className={styles.settingLabel}>🔑 Ganti Kode / Sambungkan HP Baru</label>
                <p className={styles.settingHint}>Masukkan kode 6 huruf dari keluarga untuk berganti lansia tanpa instal ulang.</p>
                <form onSubmit={hubungkanKodeBaru} className={styles.codeForm}>
                  <input
                    type="text"
                    maxLength={12}
                    value={kodeBaru}
                    onChange={(e) => setKodeBaru(e.target.value.toUpperCase())}
                    placeholder="Contoh: DEMO72"
                    className={styles.codeInput}
                    autoCapitalize="characters"
                    autoComplete="off"
                    spellCheck={false}
                  />
                  <button type="submit" disabled={settingBusy || !kodeBaru.trim()} className={styles.codeSubmitBtn}>
                    {settingBusy ? 'Menyambungkan...' : 'Sambungkan'}
                  </button>
                </form>
                {settingError && <p className={styles.settingErr}>{settingError}</p>}
              </div>

              <div className={styles.settingGroup}>
                <button type="button" className={styles.fullLogoutBtn} onClick={keluarLansia}>
                  <PiSignOutBold aria-hidden="true" />
                  Keluar dari Perangkat Ini
                </button>
              </div>
            </m.div>
          </m.div>
        )}
      </AnimatePresence>
    </main>
  );
}
