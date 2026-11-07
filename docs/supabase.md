# Supabase di himtec-01

Dokumen ini menjelaskan cara proyek memakai Supabase. Langkah pasang ada di `docs/supabase-setup.txt`. SQL siap tempel ada di `prisma/setup.sql`.

## Arsitektur

Supabase hanya dipakai sebagai PostgreSQL terkelola. App tidak memakai `@supabase/supabase-js`, Auth, Storage, atau Realtime.

```
Browser -> Next.js (route handler / server) -> Prisma -> Supabase Postgres
```

Semua akses data lewat server. Klien browser tidak pernah bicara langsung ke database.

## Koneksi

| Variabel       | Port | Dipakai untuk                          |
| -------------- | ---- | -------------------------------------- |
| `DATABASE_URL` | 6543 | Query runtime (transaction pooler)     |
| `DIRECT_URL`   | 5432 | Migrasi Prisma (`db push`, `migrate`)  |

`DATABASE_URL` harus memakai `?pgbouncer=true`. Tanpa itu, Prisma lewat pooler transaksi memunculkan error `prepared statement ... already exists`.

Client Prisma dibuat sekali di `src/lib/db.js` (singleton). Jangan membuat `new PrismaClient()` di tempat lain.

## Model saat ini

Dua tabel (`prisma/schema.prisma`, DDL + RLS di `prisma/setup.sql`):

**`households`** (grup keluarga, satu lansia): `id`, `nama_lansia`, `kode_lansia` (unik, dipakai di HP lansia), `kode_keluarga` (unik, untuk mengundang keluarga), `lansia_version` (naik saat HP lansia diputus), `lansia_terhubung_at`, `created_at`.

**`daily_records`** (log): `id`, `household_id` (FK ke `households`, cascade; nullable hanya untuk baris lama), `tipe_input` (`TOMBOL_AMAN` / `TOMBOL_DARURAT` / `VOICE_NOTE`), `status_bahaya` (`HIJAU` / `KUNING` / `MERAH`), `raw_data`, `ai_analysis` (jsonb), `created_at`. Indeks `(household_id, created_at desc)`.

Semua query log wajib memfilter `household_id` dari sesi. Data demo: `npm run db:seed` (hanya menghapus log grup demo).

## Keamanan

- RLS aktif di `public.households` dan `public.daily_records` tanpa policy. Data API Supabase (REST) tidak bisa membaca atau menulis tabel ini.
- Prisma memakai role `postgres`, yang melewati RLS. App tetap bekerja.
- `service_role` key dan `anon` key tidak dipakai. Jangan menaruh key apa pun dengan awalan `NEXT_PUBLIC_`.
- `.env` tidak boleh masuk git.

Kalau nanti butuh akses langsung dari browser (supabase-js), tambahkan policy dengan pola kepemilikan, bukan hanya `TO authenticated`:

```sql
create policy "owner can read" on public.daily_records for select
to authenticated
using ((select auth.uid()) = user_id);
```

Ini butuh kolom `user_id` yang belum ada di model sekarang.

## Menambah tabel baru

1. Tambah model di `prisma/schema.prisma`.
2. `npx prisma db push` (prototipe) atau `npx prisma migrate dev --name <nama>` (riwayat migrasi).
3. Di SQL Editor, jalankan `ALTER TABLE public."<Tabel>" ENABLE ROW LEVEL SECURITY;`.
4. Cek di Table Editor bahwa RLS aktif.

Tabel baru dari Prisma tidak otomatis memakai RLS. Langkah 3 wajib.

## Perintah berguna

```bash
npx prisma generate     # buat ulang client setelah ubah schema
npx prisma db push      # sinkron schema ke database tanpa file migrasi
npx prisma migrate dev  # buat dan jalankan migrasi (butuh DIRECT_URL)
npx prisma studio       # GUI data lokal
```
