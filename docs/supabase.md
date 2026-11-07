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

Empat tabel (`prisma/schema.prisma`, DDL + CHECK + RLS di `prisma/setup.sql`):

```
households 1 --- n members        (ADMIN mengelola, PEMANTAU hanya melihat)
households 1 --- n lansia         (orang tua yang dipantau)
lansia     1 --- n daily_records  (kabar dari HP lansia)
```

| Tabel | Kolom penting |
| --- | --- |
| `households` | `nama`, `kode_undangan` (unik, untuk bergabung sebagai pemantau) |
| `members` | `household_id` (FK), `nama`, `role` (`ADMIN` / `PEMANTAU`, CHECK) |
| `lansia` | `household_id` (FK), `nama`, `kode_pairing` (unik, untuk HP lansia), `device_version` (naik saat HP diputus), `terhubung_at` |
| `daily_records` | `lansia_id` (FK; nullable hanya untuk baris lama), `tipe_input` (CHECK: TOMBOL_AMAN, TOMBOL_DARURAT, VOICE_NOTE, KELUHAN, DETEKSI_OTOMATIS), `status_bahaya` (CHECK), `ai_analysis` (jsonb), `latitude`, `longitude`, `akurasi_meter` (CHECK rentang), `created_at` |

Semua FK `ON DELETE CASCADE`. Indeks utama: `daily_records(lansia_id, created_at desc)`. Semua query wajib memfilter keluarga/lansia dari sesi, bukan dari input klien.

Migrasi manual untuk database lama (dijalankan berurutan, masing-masing satu transaksi):
1. `prisma/sql/2026-11-07-peran-dan-relasi.sql`: grup lama menjadi keluarga + lansia, log dipindah ke lansia.
2. `prisma/sql/2026-11-07-lokasi.sql`: kolom lokasi.
3. `prisma/sql/2026-11-08-keluhan-deteksi.sql`: tipe kabar KELUHAN dan DETEKSI_OTOMATIS.

Data demo: `npm run db:seed` (hanya mereset Keluarga Demo).

## Keamanan

- RLS aktif di keempat tabel (`households`, `members`, `lansia`, `daily_records`) tanpa policy. Data API Supabase (REST) tidak bisa membaca atau menulis tabel ini.
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
