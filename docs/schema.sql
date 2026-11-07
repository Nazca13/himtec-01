-- ==========================================
-- FILE: prisma/setup.sql
-- PROJECT: SAPA (Sistem Asisten Pantau Aktif)
-- DBMS: PostgreSQL (Supabase). Cocok dengan prisma/schema.prisma.
-- Untuk database BARU. Database lama (sebelum ada peran): jalankan prisma/sql/2026-11-07-peran-dan-relasi.sql.
--
-- Relasi:
--   households 1 --- n members       (ADMIN mengelola, PEMANTAU hanya melihat)
--   households 1 --- n lansia        (orang tua yang dipantau)
--   lansia     1 --- n daily_records (kabar dari HP lansia)
-- ==========================================

CREATE TABLE IF NOT EXISTS households (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nama VARCHAR(60) NOT NULL,                    -- mis. "Keluarga Budi"
    kode_undangan VARCHAR(12) NOT NULL,           -- untuk bergabung sebagai pemantau
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS households_kode_undangan_key ON households(kode_undangan);

CREATE TABLE IF NOT EXISTS members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE ON UPDATE CASCADE,
    nama VARCHAR(40) NOT NULL,
    role VARCHAR(10) NOT NULL DEFAULT 'PEMANTAU' CHECK (role IN ('ADMIN', 'PEMANTAU')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS members_household_id_idx ON members(household_id);

CREATE TABLE IF NOT EXISTS lansia (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE ON UPDATE CASCADE,
    nama VARCHAR(60) NOT NULL,
    kode_pairing VARCHAR(12) NOT NULL,            -- dimasukkan di HP lansia
    device_version INTEGER NOT NULL DEFAULT 1,    -- naik saat HP diputus: sesi HP lama tidak berlaku
    terhubung_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS lansia_kode_pairing_key ON lansia(kode_pairing);
CREATE INDEX IF NOT EXISTS lansia_household_id_idx ON lansia(household_id);

CREATE TABLE IF NOT EXISTS daily_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lansia_id UUID REFERENCES lansia(id) ON DELETE CASCADE ON UPDATE CASCADE,
    tipe_input VARCHAR(50) NOT NULL CHECK (tipe_input IN ('TOMBOL_AMAN', 'TOMBOL_DARURAT', 'VOICE_NOTE', 'KELUHAN', 'DETEKSI_OTOMATIS')),
    status_bahaya VARCHAR(20) NOT NULL DEFAULT 'HIJAU' CHECK (status_bahaya IN ('HIJAU', 'KUNING', 'MERAH')),
    raw_data TEXT,
    ai_analysis JSONB,                            -- hasil triase AI: transkrip, gejala, ringkasan
    latitude DOUBLE PRECISION CHECK (latitude BETWEEN -90 AND 90),     -- lokasi HP saat tombol ditekan
    longitude DOUBLE PRECISION CHECK (longitude BETWEEN -180 AND 180), -- (null jika izin lokasi ditolak)
    akurasi_meter REAL CHECK (akurasi_meter >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS daily_records_lansia_id_created_at_idx ON daily_records(lansia_id, created_at DESC);
CREATE INDEX IF NOT EXISTS daily_records_status_bahaya_idx ON daily_records(status_bahaya);

-- RLS: semua tabel tertutup untuk Data API Supabase (anon/authenticated).
-- App mengakses database hanya lewat Prisma di server (role postgres, melewati RLS).
ALTER TABLE households ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE lansia ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_records ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE households, members, lansia, daily_records FROM anon, authenticated;

-- Cek: rowsecurity harus true untuk keempat tabel
SELECT tablename, rowsecurity FROM pg_tables
WHERE schemaname = 'public' AND tablename IN ('households', 'members', 'lansia', 'daily_records');
