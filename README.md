# SAPA - Sistem Asisten Pantau Aktif

PWA dua tampilan untuk memantau lansia jarak jauh. Lansia menekan satu dari tiga tombol (atau merekam suara); keluarga melihat status, riwayat, dan bertanya ke asisten AI. Spesifikasi lengkap: `docs/PRD.txt`.

- `/lansia`: kiosk tiga tombol (Saya Aman, Bicara, Darurat)
- `/pengawas`: Beranda, Riwayat, Asisten AI
- `/`: pemilih peran (diingat per perangkat; buka `/?ganti` untuk memilih ulang)

## Menjalankan

```bash
npm install                  # wajib setelah clone atau pull: paket baru (mis. motion) harus terpasang
cp .env.example .env         # isi DATABASE_URL, DIRECT_URL, ORCA_API_KEY
npm run db:push             # buat tabel di Supabase (prisma generate jalan otomatis saat npm install)
npm run dev                  # http://localhost:3000
```

Setelah `db push`, aktifkan RLS: jalankan bagian RLS di `prisma/setup.sql` lewat Supabase SQL Editor. Data demo: `npm run db:seed` (menghapus semua baris dulu).

Jika muncul `Module not found`, hentikan server, jalankan `npm install`, lalu `rm -rf .next && npm run dev`.

## Perintah

| Perintah | Fungsi |
| --- | --- |
| `npm run dev` | server pengembangan |
| `npm run build` / `npm start` | build dan jalankan produksi (PWA dan service worker aktif hanya di sini) |
| `npm run lint` | ESLint |
| `npm run db:push` | sinkronkan skema Prisma ke database |
| `npm run db:seed` | isi data demo (MENGHAPUS semua baris dulu) |
| `npm run db:studio` | lihat data di browser |

## Variabel lingkungan

| Nama | Isi |
| --- | --- |
| `DATABASE_URL` | Supabase Transaction pooler (port 6543, `?pgbouncer=true`) |
| `DIRECT_URL` | Supabase Session pooler (port 5432), untuk migrasi |
| `ORCA_API_KEY` | OrcaRouter: triase suara dan asisten AI |

Key anon/service_role Supabase tidak dipakai: akses database lewat Prisma dari server. Jangan commit `.env`.

## Struktur

```
docs/               PRD dan dokumentasi Supabase
design/             logo dan palet warna (sumber aset, tidak dipakai kode)
prisma/             schema.prisma, setup.sql (DDL + RLS), seed.js
src/app/            rute dan route handler tipis (/api/record, /api/ai, /api/assistant)
src/features/       UI per fitur (lansia, pengawas, role)
src/components/     komponen bersama
src/services/       logika bisnis (record, triase, asisten)
src/hooks/          useRecorder (rekam dan ubah ke WAV)
src/lib/            db, orca, konstanta, format
public/sw.js        service worker (cache aplikasi, offline)
```

Dokumentasi: `docs/` (PRD, Supabase). Aset desain (logo, palet): `design/`. Catatan untuk asisten kode: `CLAUDE.md`.
