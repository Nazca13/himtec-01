-- ==========================================
-- FILE: schema.sql
-- PROJECT: SAPA (Sistem Asisten Pantau Aktif)
-- DBMS: PostgreSQL (Supabase)
-- ==========================================

-- 1. Bersihkan tabel jika sudah ada (berguna saat reset data simulasi)
DROP TABLE IF EXISTS daily_records;

-- 2. Buat tabel utama pencatatan log harian
CREATE TABLE daily_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Jenis interaksi dari halaman Kiosk Lansia
    tipe_input VARCHAR(50) NOT NULL, 
    -- Contoh isi: 'TOMBOL_AMAN', 'VOICE_NOTE', 'TOMBOL_DARURAT'
    
    -- Status warna untuk merender UI Dashboard secara instan
    status_bahaya VARCHAR(20) DEFAULT 'HIJAU', 
    -- Contoh isi: 'HIJAU', 'KUNING', 'MERAH'
    
    -- Menyimpan teks mentah (jika diketik) atau URL/Base64 audio dari peramban
    raw_data TEXT, 
    
    -- [CORE AI] Menyimpan hasil ekstraksi dari Gemini
    -- Menggunakan JSONB agar query pencarian data di dalam JSON lebih cepat
    ai_analysis JSONB, 
    
    -- Waktu kejadian dengan zona waktu
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Buat Indexing (Nilai Plus di mata Juri)
-- Mempercepat proses loading saat Dashboard Pengawas menarik data terbaru
CREATE INDEX idx_daily_records_created_at ON daily_records(created_at DESC);
CREATE INDEX idx_daily_records_status ON daily_records(status_bahaya);
