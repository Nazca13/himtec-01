-- Migrasi satu kali untuk database yang dibuat sebelum ada peran (admin/pemantau/lansia).
-- Memindahkan data, tidak menghapusnya: tiap grup lama -> 1 keluarga + 1 lansia; log -> lansia-nya.
-- Dijalankan dalam satu transaksi: gagal di tengah = tidak ada yang berubah.
BEGIN;

-- 1. Lansia: satu keluarga bisa memantau beberapa orang tua
CREATE TABLE lansia (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE ON UPDATE CASCADE,
    nama VARCHAR(60) NOT NULL,
    kode_pairing VARCHAR(12) NOT NULL,
    device_version INTEGER NOT NULL DEFAULT 1,
    terhubung_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX lansia_kode_pairing_key ON lansia(kode_pairing);
CREATE INDEX lansia_household_id_idx ON lansia(household_id);
INSERT INTO lansia (household_id, nama, kode_pairing, device_version, terhubung_at, created_at)
    SELECT id, nama_lansia, kode_lansia, lansia_version, lansia_terhubung_at, created_at FROM households;

-- 2. Anggota keluarga dengan peran
CREATE TABLE members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE ON UPDATE CASCADE,
    nama VARCHAR(40) NOT NULL,
    role VARCHAR(10) NOT NULL DEFAULT 'PEMANTAU' CHECK (role IN ('ADMIN', 'PEMANTAU')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX members_household_id_idx ON members(household_id);

-- 3. Log menunjuk ke lansia (bukan lagi ke keluarga)
ALTER TABLE daily_records ADD COLUMN lansia_id UUID REFERENCES lansia(id) ON DELETE CASCADE ON UPDATE CASCADE;
UPDATE daily_records r SET lansia_id = l.id FROM lansia l WHERE l.household_id = r.household_id;
ALTER TABLE daily_records DROP COLUMN household_id;
DROP INDEX IF EXISTS idx_daily_records_created_at;
CREATE INDEX daily_records_lansia_id_created_at_idx ON daily_records(lansia_id, created_at DESC);
ALTER TABLE daily_records
    ADD CONSTRAINT daily_records_tipe_input_check CHECK (tipe_input IN ('TOMBOL_AMAN', 'TOMBOL_DARURAT', 'VOICE_NOTE')),
    ADD CONSTRAINT daily_records_status_bahaya_check CHECK (status_bahaya IN ('HIJAU', 'KUNING', 'MERAH'));

-- 4. Keluarga: nama + kode undangan; kolom lansia pindah ke tabel lansia
ALTER TABLE households ADD COLUMN nama VARCHAR(60);
UPDATE households SET nama = 'Keluarga ' || nama_lansia;
ALTER TABLE households ALTER COLUMN nama SET NOT NULL;
ALTER TABLE households RENAME COLUMN kode_keluarga TO kode_undangan;
ALTER INDEX households_kode_keluarga_key RENAME TO households_kode_undangan_key;
ALTER TABLE households DROP COLUMN nama_lansia, DROP COLUMN kode_lansia, DROP COLUMN lansia_version, DROP COLUMN lansia_terhubung_at;

-- 5. RLS untuk tabel baru (akses hanya lewat server/Prisma)
ALTER TABLE lansia ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE lansia, members FROM anon, authenticated;

COMMIT;
