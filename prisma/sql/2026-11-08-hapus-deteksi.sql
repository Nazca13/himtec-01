-- Fitur deteksi jatuh/kejang dihapus: kolom pengaturannya ikut dihapus.
-- Tipe DETEKSI_OTOMATIS tetap diizinkan CHECK agar riwayat lama tetap valid.
BEGIN;
ALTER TABLE lansia DROP COLUMN IF EXISTS deteksi_aktif;
COMMIT;
