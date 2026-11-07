-- supabase_setup.sql
-- Cocok dengan model DailyRecord di prisma/schema.prisma.
-- Aman dijalankan ulang (idempotent).

-- ============================================================
-- TABEL (lewati bagian ini jika memakai `npx prisma db push`)
-- ============================================================
CREATE TABLE IF NOT EXISTS public."DailyRecord" (
  "id"           TEXT          NOT NULL DEFAULT gen_random_uuid()::text,
  "tipeInput"    TEXT          NOT NULL,
  "statusBahaya" TEXT          NOT NULL DEFAULT 'HIJAU',
  "aiAnalysis"   JSONB,
  "createdAt"    TIMESTAMP(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "DailyRecord_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "DailyRecord_createdAt_idx"
  ON public."DailyRecord" ("createdAt" DESC);

-- ============================================================
-- RLS (jalankan SELALU, apa pun jalur yang dipilih)
-- ============================================================
-- Tabel di schema public terbuka lewat Data API (REST). RLS aktif tanpa policy
-- = anon dan authenticated tidak bisa baca/tulis apa pun.
-- Prisma memakai role postgres (bypass RLS), jadi app tetap jalan.
ALTER TABLE public."DailyRecord" ENABLE ROW LEVEL SECURITY;

-- Lapisan kedua: cabut hak akses langsung.
REVOKE ALL ON TABLE public."DailyRecord" FROM anon, authenticated;

-- ============================================================
-- CEK
-- ============================================================
-- Harus mengembalikan rowsecurity = true:
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public' AND tablename = 'DailyRecord';
