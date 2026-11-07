# Supabase di himtec-01

Dokumen ini menjelaskan cara proyek memakai Supabase. Langkah pasang ada di `supabase_set up.txt`. SQL siap tempel ada di `supabase_setup.sql`.

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

`prisma/schema.prisma` memiliki satu model, `DailyRecord`: satu baris per pesan dari lansia.

| Kolom          | Tipe SQL       | Catatan                                            |
| -------------- | -------------- | -------------------------------------------------- |
| `id`           | `text`         | Primary key. UUID dibuat oleh Prisma               |
| `tipeInput`    | `text`         | `TOMBOL_AMAN`, `TOMBOL_DARURAT`, atau `VOICE_NOTE` |
| `statusBahaya` | `text`         | `HIJAU` (default), `KUNING`, atau `MERAH`          |
| `aiAnalysis`   | `jsonb`        | Hasil triase Gemini: transkrip, gejala, ringkasan  |
| `createdAt`    | `timestamp(3)` | Default waktu sekarang. Ada indeks menurun         |

Nama tabel di Postgres adalah `daily_records` (snake_case, dipetakan Prisma lewat `@@map`). Kolom: `tipe_input`, `status_bahaya`, `raw_data`, `ai_analysis`, `created_at`.

Data demo untuk pitching: `node prisma/seed.js` (menghapus semua baris lalu mengisi 6 baris).

## Keamanan

- RLS aktif di `public.daily_records` tanpa policy. Data API Supabase (REST) tidak bisa membaca atau menulis tabel ini.
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
