-- Tipe kabar baru: KELUHAN (dipilih lewat gambar) dan DETEKSI_OTOMATIS (sensor HP mendeteksi kejang/jatuh).
BEGIN;
ALTER TABLE daily_records DROP CONSTRAINT IF EXISTS daily_records_tipe_input_check;
ALTER TABLE daily_records ADD CONSTRAINT daily_records_tipe_input_check
    CHECK (tipe_input IN ('TOMBOL_AMAN', 'TOMBOL_DARURAT', 'VOICE_NOTE', 'KELUHAN', 'DETEKSI_OTOMATIS'));
COMMIT;
