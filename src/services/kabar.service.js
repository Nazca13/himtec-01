import { STATUS, TIPE_INPUT } from '@/lib/constants';
import { KELUHAN_BY_ID, SEBAB_OTOMATIS } from '@/lib/keluhan';
import { ValidationError } from './record.service';

// Menafsirkan kabar non-suara dari HP lansia (tombol atau keluhan pilihan gambar) menjadi status + ringkasan.
// Status selalu ditentukan server.
export function tafsirkanKabar({ tipeInput, keluhan, sebab, nama }) {
  switch (tipeInput) {
    case TIPE_INPUT.AMAN:
      return { statusBahaya: STATUS.HIJAU };

    case TIPE_INPUT.DARURAT:
      return { statusBahaya: STATUS.MERAH, aiAnalysis: { ringkasan: `${nama} menekan tombol DARURAT.` } };

    case TIPE_INPUT.KELUHAN: {
      const dipilih = [...new Set(Array.isArray(keluhan) ? keluhan : [])].map((id) => KELUHAN_BY_ID[id]).filter(Boolean);
      if (!dipilih.length || dipilih.length > 6) throw new ValidationError('Pilih 1 sampai 6 keluhan.');
      const gawat = dipilih.filter((k) => k.bahaya === STATUS.MERAH);
      const daftar = dipilih.map((k) => k.label.toLowerCase()).join(', ');
      return {
        statusBahaya: gawat.length ? STATUS.MERAH : STATUS.KUNING,
        aiAnalysis: {
          sumber: 'pilihan',
          gejala: dipilih.map((k) => k.label),
          ringkasan: gawat.length
            ? `${nama} melaporkan ${daftar}. Ini tanda gawat: segera hubungi ${nama}.`
            : `${nama} melaporkan ${daftar} lewat pilihan gambar.`,
        },
      };
    }

    case TIPE_INPUT.OTOMATIS: {
      if (!SEBAB_OTOMATIS[sebab]) throw new ValidationError('sebab harus KEJANG atau JATUH.');
      return {
        statusBahaya: STATUS.MERAH,
        aiAnalysis: {
          otomatis: true,
          sebab,
          gejala: [sebab === 'KEJANG' ? 'Kemungkinan kejang' : 'Kemungkinan jatuh'],
          ringkasan: `Sensor HP mendeteksi ${SEBAB_OTOMATIS[sebab]}, dan ${nama} tidak menekan "Saya baik-baik saja" dalam 30 detik. Segera hubungi atau datangi ${nama}.`,
        },
      };
    }

    default:
      throw new ValidationError('tipeInput tidak dikenal.');
  }
}
