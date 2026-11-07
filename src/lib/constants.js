export const TIPE_INPUT = {
  AMAN: 'TOMBOL_AMAN',
  DARURAT: 'TOMBOL_DARURAT',
  VOICE: 'VOICE_NOTE',
};

export const STATUS = {
  HIJAU: 'HIJAU',
  KUNING: 'KUNING',
  MERAH: 'MERAH',
};

export const STATUS_LABEL = {
  HIJAU: 'Aman',
  KUNING: 'Perlu Perhatian',
  MERAH: 'Darurat',
};

export const TIPE_LABEL = {
  TOMBOL_AMAN: 'Tombol Aman',
  TOMBOL_DARURAT: 'Tombol Darurat',
  VOICE_NOTE: 'Pesan Suara',
};

// Batas payload audio (base64 chars). ~30 detik rekaman opus masih jauh di bawah ini.
export const MAX_AUDIO_BASE64_LENGTH = 6_000_000;
