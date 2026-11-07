// Keluhan yang bisa dipilih lewat gambar (untuk lansia yang sulit bicara). Dipakai server dan klien.
// Sengaja 9 pilihan (3x3, muat satu layar tanpa gulir); keluhan lain lewat tombol Bicara.
// bahaya MERAH = tanda gawat darurat umum (nyeri dada, sesak, jatuh, kejang): keluarga langsung diberi status merah.
export const KELUHAN = [
  { id: 'PUSING', label: 'Pusing', bahaya: 'KUNING' },
  { id: 'NYERI_DADA', label: 'Nyeri dada', bahaya: 'MERAH' },
  { id: 'SESAK', label: 'Sesak napas', bahaya: 'MERAH' },
  { id: 'JATUH', label: 'Jatuh', bahaya: 'MERAH' },
  { id: 'KEJANG', label: 'Baru kejang', bahaya: 'MERAH' },
  { id: 'MUAL', label: 'Mual', bahaya: 'KUNING' },
  { id: 'DEMAM', label: 'Demam', bahaya: 'KUNING' },
  { id: 'OBAT_HABIS', label: 'Obat habis', bahaya: 'KUNING' },
  { id: 'TELEPON', label: 'Ingin ditelepon', bahaya: 'KUNING' },
];

export const KELUHAN_BY_ID = Object.fromEntries(KELUHAN.map((k) => [k.id, k]));

