// Keluhan yang bisa dipilih lewat gambar (untuk lansia yang sulit bicara). Dipakai server dan klien.
// bahaya MERAH = tanda gawat darurat umum (nyeri dada, sesak, jatuh, kejang): keluarga langsung diberi status merah.
export const KELUHAN = [
  { id: 'PUSING', label: 'Pusing', bahaya: 'KUNING' },
  { id: 'NYERI_DADA', label: 'Nyeri dada', bahaya: 'MERAH' },
  { id: 'SESAK', label: 'Sesak napas', bahaya: 'MERAH' },
  { id: 'JATUH', label: 'Jatuh', bahaya: 'MERAH' },
  { id: 'KEJANG', label: 'Baru kejang', bahaya: 'MERAH' },
  { id: 'MUAL', label: 'Mual', bahaya: 'KUNING' },
  { id: 'LEMAS', label: 'Lemas', bahaya: 'KUNING' },
  { id: 'DEMAM', label: 'Demam', bahaya: 'KUNING' },
  { id: 'SAKIT', label: 'Badan sakit', bahaya: 'KUNING' },
  { id: 'OBAT_HABIS', label: 'Obat habis', bahaya: 'KUNING' },
  { id: 'SUSAH_TIDUR', label: 'Susah tidur', bahaya: 'KUNING' },
  { id: 'TELEPON', label: 'Ingin ditelepon', bahaya: 'KUNING' },
];

export const KELUHAN_BY_ID = Object.fromEntries(KELUHAN.map((k) => [k.id, k]));

// Penyebab peringatan otomatis dari sensor gerak HP.
export const SEBAB_OTOMATIS = { KEJANG: 'kemungkinan kejang', JATUH: 'kemungkinan jatuh' };
