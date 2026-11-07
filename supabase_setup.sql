-- supabase_setup.sql
-- Cocok dengan model Record di prisma/schema.prisma.
-- Aman dijalankan ulang (idempotent).

-- ============================================================
-- TABEL (lewati bagian ini jika memakai `npx prisma db push`)
-- ============================================================
CREATE TABLE IF NOT EXISTS public."Record" (
  "id"        TEXT          NOT NULL DEFAULT gen_random_uuid()::text,
  "title"     TEXT          NOT NULL,
  "content"   TEXT,
  "metadata"  JSONB,
  "imageUrl"  TEXT,
  "status"    TEXT          NOT NULL DEFAULT 'PENDING',
  "createdAt" TIMESTAMP(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Record_pkey" PRIMARY KEY ("id")
);

-- ============================================================
-- RLS (jalankan SELALU, apa pun jalur yang dipilih)
-- ============================================================
-- Tabel di schema public terbuka lewat Data API (REST). RLS aktif tanpa policy
-- = anon dan authenticated tidak bisa baca/tulis apa pun.
-- Prisma memakai role postgres (bypass RLS), jadi app tetap jalan.
ALTER TABLE public."Record" ENABLE ROW LEVEL SECURITY;

-- Lapisan kedua: cabut hak akses langsung.
REVOKE ALL ON TABLE public."Record" FROM anon, authenticated;

-- ============================================================
-- CEK
-- ============================================================
-- Harus mengembalikan rowsecurity = true:
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public' AND tablename = 'Record';
