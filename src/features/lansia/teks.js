// Bagian murni (tanpa React/DOM) dari app lansia: teks dan konstanta. Mudah diuji unit.
import { TIPE_INPUT } from '@/lib/constants';

export const MAX_REKAM_S = 30;
export const HITUNG_MUNDUR_S = 30;
export const TAMPIL_TERKIRIM_MS = 3_200;

// Kunci penyimpanan lokal di HP lansia (preferensi, bukan data pribadi).
export const DETEKSI_KEY = 'sapa.deteksi';
export const FONT_KEY = 'sapa.font_size';

export const UKURAN_TULISAN = [
  { id: 'normal', label: 'Standar' },
  { id: 'besar', label: 'Besar' },
  { id: 'ekstra', label: 'Sangat Besar' },
];

// Petunjuk untuk orang di sekitar saat peringatan otomatis (pertolongan pertama umum).
export const PETUNJUK = {
  KEJANG: ['Miringkan tubuhnya ke samping.', 'Jangan masukkan apa pun ke mulutnya.', 'Jauhkan benda keras atau tajam.', 'Jangan menahan gerakannya.', 'Kejang lebih dari 5 menit: telepon 119.'],
  JATUH: ['Jangan langsung mengangkat tubuhnya.', 'Tanyakan apa yang sakit; periksa kepala dan pinggul.', 'Tidak sadar atau tidak bisa bergerak: telepon 119.'],
};

// "Sabtu, 8 November": membantu orientasi waktu orang tua.
export const hariIni = (date = new Date()) =>
  new Intl.DateTimeFormat('id-ID', { timeZone: 'Asia/Jakarta', weekday: 'long', day: 'numeric', month: 'long' }).format(date);

// Balasan maskot setelah kabar terkirim: cepat (tanpa menunggu AI) dan menyebut nama.
export function balasan(kabar, nama, record) {
  if (record?.statusBahaya === 'MERAH') return `Tenang ya, ${nama}. Keluarga sudah diberi tahu dan segera menghubungi.`;
  if (kabar.tipeInput === TIPE_INPUT.KELUHAN || kabar.tipeInput === TIPE_INPUT.VOICE) {
    const gejala = record?.aiAnalysis?.gejala?.slice(0, 2).join(' dan ').toLowerCase();
    return gejala ? `Terima kasih sudah cerita, ${nama}. Keluarga sudah tahu soal ${gejala}.` : `Pesan ${nama} sudah sampai. Keluarga akan membacanya.`;
  }
  return `Terima kasih, ${nama}. Keluarga sudah tahu ${nama} baik-baik saja.`;
}

export const pesanGalat = {
  putus: 'HP ini diputus oleh keluarga. Minta kode baru, lalu hubungkan lagi.',
  kirim: 'Pesan belum terkirim. Periksa internet, lalu coba lagi.',
  suara: 'Pesan suara belum terkirim. Coba lagi.',
  mikrofon: 'Izin mikrofon dibutuhkan. Ketuk gambar keluhan saja, atau minta keluarga mengaktifkan mikrofon.',
  sensor: 'Sensor gerak tidak bisa dipakai di HP atau browser ini.',
};
