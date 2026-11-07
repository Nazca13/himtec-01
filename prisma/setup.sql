-- ==========================================
-- FILE: prisma/setup.sql
-- PROJECT: SAPA (Sistem Asisten Pantau Aktif)
-- DBMS: PostgreSQL (Supabase)
-- Cocok dengan model Household dan DailyRecord di prisma/schema.prisma.
-- ==========================================

-- 1. Reset tabel (HAPUS SEMUA DATA). Aktifkan hanya saat mereset data simulasi.
-- DROP TABLE IF EXISTS daily_records;

-- 2a. Grup keluarga: satu lansia, banyak anggota keluarga. Dihubungkan lewat dua kode.
CREATE TABLE IF NOT EXISTS households (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nama_lansia VARCHAR(60) NOT NULL,
    kode_lansia VARCHAR(12) NOT NULL UNIQUE,    -- dipakai di HP lansia
    kode_keluarga VARCHAR(12) NOT NULL UNIQUE,  -- dipakai untuk mengundang keluarga
    lansia_version INTEGER NOT NULL DEFAULT 1,  -- dinaikkan saat HP lansia diputus
    lansia_terhubung_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2b. Tabel utama pencatatan log harian
CREATE TABLE IF NOT EXISTS daily_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Grup pemilik log. Nullable hanya untuk baris lama; semua query memfilternya.
    household_id UUID REFERENCES households(id) ON DELETE CASCADE,

    -- Jenis interaksi dari halaman Kiosk Lansia
    -- Contoh isi: 'TOMBOL_AMAN', 'VOICE_NOTE', 'TOMBOL_DARURAT'
    tipe_input VARCHAR(50) NOT NULL,

    -- Status warna untuk merender UI Dashboard secara instan
    -- Contoh isi: 'HIJAU', 'KUNING', 'MERAH'
    status_bahaya VARCHAR(20) DEFAULT 'HIJAU',

    -- Teks mentah (jika diketik) atau URL/Base64 audio dari peramban
    raw_data TEXT,

    -- [CORE AI] Hasil ekstraksi dari Gemini (JSONB agar query di dalam JSON cepat)
    ai_analysis JSONB,

    -- Waktu kejadian dengan zona waktu
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Untuk database yang tabel daily_records-nya sudah ada sebelum grup dibuat:
ALTER TABLE daily_records ADD COLUMN IF NOT EXISTS household_id UUID REFERENCES households(id) ON DELETE CASCADE;

-- 3. Indeks: mempercepat Dashboard Pengawas menarik data terbaru
CREATE INDEX IF NOT EXISTS idx_daily_records_household_created ON daily_records(household_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_daily_records_status ON daily_records(status_bahaya);

-- 4. RLS (jalankan SELALU). Tanpa policy, anon/authenticated tidak bisa akses lewat
-- Data API Supabase. Prisma memakai role postgres (bypass RLS), jadi app tetap jalan.
ALTER TABLE households ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_records ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE households, daily_records FROM anon, authenticated;

-- 5. Cek: rowsecurity harus true
SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename IN ('households', 'daily_records');
