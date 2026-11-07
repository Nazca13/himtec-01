# SAPA - Sistem Asisten Pantau Aktif

PWA dua tampilan untuk memantau lansia jarak jauh. Lansia menekan satu dari tiga tombol (atau merekam suara); keluarga melihat status, riwayat, dan bertanya ke asisten AI. Spesifikasi lengkap: `docs/PRD.txt`.

## Alur pengguna

| Siapa | Perangkat | Cara masuk |
| --- | --- | --- |
| Keluarga (anak) | Web biasa (laptop/HP), dashboard | `/` lalu **Buat grup pantau**: isi nama Anda dan nama nenek, dapat dua kode |
| HP nenek/kakek | **Aplikasi** (bisa di-install ke layar utama) | Buka link WhatsApp dari keluarga (`/hubungkan?kode=...`), tekan **Hubungkan HP ini** sekali |
| Keluarga lain | Web | `/` lalu **Gabung dengan kode keluarga** |
| Juri / uji cepat | Satu browser | `/demo`: HP lansia dan dashboard berdampingan, data demo (`/demo?reset=1` untuk mengulang) |

- `/lansia`: app lansia. Maskot burung hantu menyapa (pesan ditulis AI), ada hitungan hari berturut-turut, tiga tombol (Saya Aman, Bicara, Darurat). Hanya halaman ini dan `/hubungkan` yang menautkan manifest PWA, jadi hanya ini yang ditawari "Install".
- `/pengawas`: dashboard web keluarga: Beranda (status, Ringkasan AI live, tren 7 hari), Riwayat, Asisten AI, Keluarga (kode, status HP lansia, putuskan HP, keluar).
- Data dipisah per grup. Sesi = cookie bertanda tangan (`SESSION_SECRET`), dua cookie terpisah untuk lansia dan keluarga.
- Kode lansia bisa diganti: **Putuskan HP ini** di tab Keluarga membuat kode baru dan langsung mencabut HP lama.

## Menjalankan

```bash
npm install                  # wajib setelah clone atau pull: paket baru (mis. motion) harus terpasang
cp .env.example .env         # isi DATABASE_URL, DIRECT_URL, ORCA_API_KEY, SESSION_SECRET
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
| `ORCA_API_KEY` | OrcaRouter: triase suara, pesan maskot, ringkasan, asisten |
| `SESSION_SECRET` | Penanda tangan cookie sesi, minimal 32 karakter (`openssl rand -base64 48`) |
| `ENABLE_DEMO` | Opsional. `false` mematikan `/demo` |

Key anon/service_role Supabase tidak dipakai: akses database lewat Prisma dari server. Jangan commit `.env`.

## Struktur

```
docs/               PRD dan dokumentasi Supabase
design/             logo dan palet warna (sumber aset, tidak dipakai kode)
prisma/             schema.prisma, setup.sql (DDL + RLS), seed.js
src/app/            rute dan route handler tipis (/api/record, /api/ai, /api/assistant)
src/features/       UI per fitur (lansia, pengawas, masuk)
src/components/     komponen bersama
src/services/       logika bisnis (record, triase, asisten)
src/hooks/          useRecorder (rekam dan ubah ke WAV)
src/lib/            db, orca, konstanta, format
public/sw.js        service worker (cache aplikasi, offline)
```

Dokumentasi: `docs/` (PRD, Supabase). Aset desain (logo, palet): `design/`. Catatan untuk asisten kode: `CLAUDE.md`.
