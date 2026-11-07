# Panduan pengembangan

## Prasyarat

- Node.js 22 (`.nvmrc`; minimum 20.9)
- Project Supabase (PostgreSQL) dan kunci OrcaRouter untuk fitur AI. Tanpa kunci AI aplikasi tetap jalan dengan teks cadangan.

## Menjalankan lokal

```bash
git clone https://github.com/Nazca13/himtec-01.git
cd himtec-01
npm install                 # juga menjalankan prisma generate
cp .env.example .env        # isi DATABASE_URL, DIRECT_URL, ORCA_API_KEY, SESSION_SECRET
npx prisma db push          # atau tempel docs/schema.sql di SQL Editor Supabase
npm run db:seed             # opsional: keluarga demo
npm run dev                 # http://localhost:3000
```

Buat `SESSION_SECRET` dengan `openssl rand -base64 48`. Server menolak mulai di produksi bila variabel penting salah; di mode dev ia hanya mencetak peringatan.

Mencoba dari HP di jaringan yang sama: buka `http://<IP-laptop>:3000`. `allowedDevOrigins` di `next.config.mjs` sudah mengizinkan alamat jaringan lokal. Izin mikrofon dan lokasi di HP biasanya butuh HTTPS; gunakan pratinjau Vercel atau terowongan HTTPS.

## Perintah

| Perintah | Fungsi |
|---|---|
| `npm run dev` | Server pengembangan |
| `npm run build` | Build produksi |
| `npm run start` | Menyajikan hasil build |
| `npm run lint` | ESLint |
| `npm test` | Tes unit (`node:test`, tanpa database) |
| `npm run db:push` | Sinkronkan skema Prisma ke database |
| `npm run db:seed` | Isi keluarga demo |
| `npm run db:studio` | Penjelajah data Prisma |

CI menjalankan `lint`, `test`, dan `build` pada setiap push dan pull request.

## Konvensi

### Kode

- JavaScript biasa (tanpa TypeScript), ES modules, alias `@/*` untuk `src/*`.
- Format: `.prettierrc.json` (tanda kutip tunggal, lebar 160) dan `.editorconfig`.
- Nama berkas: komponen `PascalCase.js`, hook `useCamelCase.js`, selainnya `kebab-case.js` atau `camelCase.js` sesuai tetangganya.
- Teks untuk pengguna dan komentar memakai bahasa Indonesia. Nama teknis (fungsi, variabel) mengikuti domain yang sudah ada (`kabar`, `lansia`, `pengawas`).
- Komentar hanya untuk alasan yang tidak terlihat dari kode. Jalan pintas yang disengaja ditandai `shortcut: <batas>, <kapan ditingkatkan>`.
- Gaya: CSS Modules per fitur, token warna dan ukuran di `globals.css`. Tidak ada emoji di antarmuka; ikon dari `react-icons/pi` (Phosphor). Animasi masuk memakai CSS, bukan keadaan awal JavaScript.

### Aturan arsitektur

Dari [ARSITEKTUR.md](ARSITEKTUR.md), yang paling sering terlanggar:

1. Route handler tipis. Aturan bisnis masuk `services/`.
2. `features/` tidak mengimpor `services/` atau `db`. Ia memanggil API lewat `fetch`.
3. Status bahaya hanya dihitung server.
4. Satu `PrismaClient`, dari `lib/db.js`.
5. Setiap query data keluarga dimulai dari `household.id` milik sesi.
6. Komponen besar dipecah: logika ke `hooks/`, tampilan ke `components/`, bagian murni ke `teks.js`/`lib/`. Contoh acuan: `features/lansia/`.

### Next.js 16

Versi ini berbeda dari yang banyak ditulis di internet. Baca panduan di `node_modules/next/dist/docs/` sebelum menulis kode Next.js. Yang sering menggigit:

- `proxy.js` menggantikan `middleware.js`.
- `cacheComponents`: data dinamis wajib di dalam `Suspense` atau `use cache`; route handler yang membaca cookie memanggil `await connection()`.
- CSS Modules tidak boleh memakai selektor elemen telanjang.
- `<Link>` memprefetch; jangan arahkan ke URL yang mengubah state.

## Tes

`npm test` menjalankan `tests/*.test.mjs` dengan `node:test`. Hook `tests/register.mjs` memetakan alias `@/` agar service murni dapat diimpor.

Yang diuji: pembuat kode, lokasi, pembatas laju, validasi env, daftar keluhan, aturan status kabar, dan kesamaan `schema.sql` dengan `prisma/setup.sql`. Tes tidak membutuhkan database atau jaringan, sehingga cepat dan aman dijalankan di CI.

Menambah tes: buat `tests/<nama>.test.mjs`. Tulis tes untuk setiap logika baru yang bercabang, mengurai, atau menyangkut keamanan.

Pengujian alur lengkap (browser dan API terhadap database nyata) dilakukan manual atau dengan Playwright terhadap server lokal; skenarionya ada di [PANDUAN_JURI.md](PANDUAN_JURI.md).

## Menambah fitur: contoh jenis kabar baru

1. Tambahkan nilai pada `lib/constants.js` (`TIPE_INPUT`, label) dan `CHECK` pada skema (`schema.prisma`, `setup.sql`, `docs/schema.sql`, migrasi baru di `prisma/sql/`).
2. Tambahkan aturan status di `services/kabar.service.js` beserta tesnya.
3. Tangani nilai baru di `app/api/record/route.js` (biasanya otomatis lewat service).
4. Tambahkan tampilan di aplikasi orang tua (`features/lansia/components/`) dan di linimasa dashboard.
5. Perbarui [API.md](API.md), [DATABASE.md](DATABASE.md), dan [PRODUK.md](PRODUK.md).

## Pemecahan masalah

| Gejala | Penyebab umum | Solusi |
|---|---|---|
| `P1013`/`P1001` saat `db push` | `.env` masih placeholder, atau kata sandi salah | Isi nilai asli; kata sandi dengan karakter khusus harus di-URL-encode |
| `P2024` pool habis | Terlalu banyak koneksi dari serverless | Tambahkan `&connection_limit=1` pada `DATABASE_URL` |
| Server tidak mau mulai di produksi: "Konfigurasi tidak valid" | Env salah | Baca daftar galat yang dicetak; perbaiki variabel yang disebut |
| Form di HP tidak merespons | Mengakses lewat IP LAN tanpa `allowedDevOrigins` | Alamat privat sudah diizinkan; restart `npm run dev` |
| Mikrofon/lokasi tidak muncul di HP | Bukan HTTPS | Uji lewat URL HTTPS |
| Dashboard lambat sekali dari lokal | Latensi ke wilayah database (sekitar 2 detik per query) | Normal dari jauh; di Vercel `bom1` hanya puluhan milidetik |
| `/demo` 404 di produksi | Mode demo mati secara default | Setel `ENABLE_DEMO=true` dan build ulang |
