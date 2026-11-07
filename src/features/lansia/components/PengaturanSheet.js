import * as m from 'motion/react-m';
import { PiKeyFill, PiSignOutBold, PiTextAaBold, PiXBold } from 'react-icons/pi';
import { UKURAN_TULISAN } from '../teks';
import styles from '../LansiaApp.module.css';

// Lembar pengaturan HP lansia: ukuran tulisan, ganti kode, keluar. Semua pengaturan datang dari usePengaturanLansia.
export default function PengaturanSheet({ p }) {
  return (
    <m.div key="settingsModal" className={styles.settingsOverlay} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={p.tutup}>
      <m.div className={styles.settingsSheet} initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 26, stiffness: 280 }} onClick={(e) => e.stopPropagation()}>
        <div className={styles.sheetHead}>
          <h2>Pengaturan Lansia</h2>
          <button type="button" className={styles.closeBtn} onClick={p.tutup} aria-label="Tutup">
            <PiXBold aria-hidden="true" />
          </button>
        </div>

        <div className={styles.settingGroup}>
          <label className={styles.settingLabel}>
            <PiTextAaBold aria-hidden="true" /> Ukuran Tulisan
          </label>
          <div className={styles.sizePicker}>
            {UKURAN_TULISAN.map((s) => (
              <button key={s.id} type="button" className={`${styles.sizeBtn} ${p.ukuran === s.id ? styles.sizeActive : ''}`} onClick={() => p.ubahUkuran(s.id)}>
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.settingGroup}>
          <label className={styles.settingLabel}>
            <PiKeyFill aria-hidden="true" /> Ganti Kode / Sambungkan HP Baru
          </label>
          <p className={styles.settingHint}>Masukkan kode 6 huruf dari keluarga untuk berganti lansia tanpa instal ulang.</p>
          <form onSubmit={p.hubungkan} className={styles.codeForm}>
            <input type="text" maxLength={12} value={p.kode} onChange={(e) => p.setKode(e.target.value.toUpperCase())} placeholder="Contoh: DEMO72" className={styles.codeInput} autoCapitalize="characters" autoComplete="off" spellCheck={false} />
            <button type="submit" disabled={p.busy || !p.kode.trim()} className={styles.codeSubmitBtn}>
              {p.busy ? 'Menyambungkan...' : 'Sambungkan'}
            </button>
          </form>
          {p.error && <p className={styles.settingErr}>{p.error}</p>}
          {p.sukses && <p className={styles.settingOk}>{p.sukses}</p>}
        </div>

        <div className={styles.settingGroup}>
          <button type="button" className={styles.fullLogoutBtn} onClick={p.keluar}>
            <PiSignOutBold aria-hidden="true" />
            Keluar dari Perangkat Ini
          </button>
        </div>
      </m.div>
    </m.div>
  );
}
