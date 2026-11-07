-- ==========================================
-- FILE: prisma/setup.sql
-- PROJECT: SAPA (Sistem Asisten Pantau Aktif)
-- DBMS: PostgreSQL (Supabase)
-- Cocok dengan model DailyRecord di prisma/schema.prisma (@@map("daily_records")).
-- ==========================================

-- 1. Reset tabel (HAPUS SEMUA DATA). Aktifkan hanya saat mereset data simulasi.
-- DROP TABLE IF EXISTS daily_records;

-- 2. Tabel utama pencatatan log harian
CREATE TABLE IF NOT EXISTS daily_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

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

-- 3. Indeks: mempercepat Dashboard Pengawas menarik data terbaru
CREATE INDEX IF NOT EXISTS idx_daily_records_created_at ON daily_records(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_daily_records_status ON daily_records(status_bahaya);

-- 4. RLS (jalankan SELALU). Tanpa policy, anon/authenticated tidak bisa akses lewat
-- Data API Supabase. Prisma memakai role postgres (bypass RLS), jadi app tetap jalan.
ALTER TABLE daily_records ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE daily_records FROM anon, authenticated;

-- 5. Cek: rowsecurity harus true
SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename = 'daily_records';
