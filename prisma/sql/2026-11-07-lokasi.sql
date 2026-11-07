-- Lokasi saat lansia menekan tombol (jika izin lokasi diberikan di HP-nya). Aditif: tidak mengubah data lama.
BEGIN;
ALTER TABLE daily_records
    ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION CHECK (latitude BETWEEN -90 AND 90),
    ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION CHECK (longitude BETWEEN -180 AND 180),
    ADD COLUMN IF NOT EXISTS akurasi_meter REAL CHECK (akurasi_meter >= 0);
COMMIT;
