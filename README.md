# SAPA - Sistem Asisten Pantau Aktif

Aplikasi untuk memantau orang tua (lansia) dari jauh. Tampilan mengikuti Apple Human Interface Guidelines (latar grouped, daftar inset, Large Title, font sistem). Orang tua cukup menekan satu dari tiga tombol besar di HP-nya; keluarga langsung melihat kabarnya di dashboard, lengkap dengan ringkasan AI, riwayat, dan lokasi terakhir. Spesifikasi awal: `docs/PRD.txt`.

## Tiga peran

| Peran | Siapa | Perangkat | Bisa apa | Cara masuk |
| --- | --- | --- | --- | --- |
| **Admin** | Anak/pengurus yang mendaftarkan keluarga | Web (laptop/HP): dashboard | Semua yang bisa pemantau, ditambah: tambah/hapus orang tua, bagikan kode HP dan kode undangan, putuskan HP yang hilang, jadikan anggota admin, keluarkan anggota | Halaman depan, lalu **Daftarkan keluarga** (`/daftar`) |
| **Lansia** | Orang tua yang dipantau | Aplikasi di HP-nya (PWA, bisa di-install) | Tekan **Saya Aman**, **Keluhan** (bicara, atau ketuk gambar bagi yang sulit bicara), atau **Darurat**. Deteksi jatuh/kejang opsional. Lokasi HP ikut terkirim jika diizinkan | Buka link kode HP dari admin, lalu **Hubungkan HP ini** (`/hubungkan?kode=...`), cukup sekali |
| **Pemantau** | Anggota keluarga lain | Web (laptop/HP): dashboard | Lihat status, Ringkasan AI, lokasi terakhir, grafik, riwayat; tanya Asisten AI. Tidak bisa mengubah pengaturan | Halaman depan, lalu **Masuk dengan kode undangan** (`/gabung`) |

Penjelasan yang sama untuk pengguna ada di app: `/panduan`.

## Alur dari awal

1. **Admin mendaftar** di `/daftar`: isi nama sendiri dan nama orang tua. Dibuat keluarga, akun admin, dan orang tua pertama. Admin mendapat dua kode:
   - **Kode HP** (6 karakter) untuk HP orang tua.
   - **Kode undangan** (8 karakter) untuk anggota keluarga lain.
2. **Hubungkan HP orang tua**: admin menekan *Kirim lewat WhatsApp*. Di HP orang tua, link dibuka lalu *Hubungkan HP ini*. HP meminta izin lokasi sekali, lalu menampilkan tiga tombol setiap kali dibuka. Pilih *Tambahkan ke layar utama* agar menjadi aplikasi.
3. **Orang tua memberi kabar**: Saya Aman (hijau), Keluhan (oranye), Darurat (merah). Maskot burung hantu menyapa (pesan ditulis AI) dan menghitung hari berturut-turut.
   - **Keluhan tanpa suara**: selain merekam suara (AI merangkum dan menilai tingkat bahaya), orang tua bisa mengetuk gambar keluhan: Pusing, Nyeri dada, Sesak napas, Jatuh, Baru kejang, Mual, Lemas, Demam, Badan sakit, Obat habis, Susah tidur, Ingin ditelepon. Nyeri dada, sesak, jatuh, dan kejang otomatis berstatus merah.
   - **Deteksi jatuh dan kejang** (saklar di HP orang tua): sensor gerak mendeteksi guncangan berirama ≥10 detik (kemungkinan kejang) atau jatuh bebas lalu benturan (kemungkinan jatuh). Layar menghitung mundur 30 detik dengan tombol "Saya baik-baik saja", berbunyi dan bergetar, serta menampilkan petunjuk pertolongan untuk orang di sekitar dan tombol telepon 119. Tidak dibatalkan = Darurat terkirim otomatis beserta lokasi. Hanya bekerja selama aplikasi terbuka (layar dijaga tetap menyala); deteksi di latar belakang butuh aplikasi native atau jam pintar.
4. **Keluarga memantau** di `/pengawas`: status terbaru, Ringkasan AI live, lokasi terakhir (peta), grafik 7 hari, riwayat, dan Asisten AI. Kabar baru muncul dalam ±5 detik tanpa reload. Saat status merah, muncul kartu **pertolongan pertama** (kejang, jatuh, atau darurat umum) dengan tombol telepon 119/112 dan lokasi.
5. **Admin mengundang keluarga lain** dari tab *Keluarga*: kirim kode undangan. Penerima masuk sebagai pemantau; admin bisa menjadikannya admin.

Lainnya (semua dari tab *Keluarga*, khusus admin):
- **Memantau lebih dari satu orang tua**: form *Tambah orang tua*. Setiap orang tua punya kode HP sendiri; pilih namanya di atas dashboard.
- **HP orang tua hilang/diganti**: *Putuskan HP*. HP lama langsung ditolak, kode baru dibuat.
- **Membuka dashboard di perangkat lain**: masuk dengan kode undangan (sebagai pemantau), lalu admin menekan *Jadikan admin*.
- **Mengeluarkan anggota**: *Keluarkan*. Perangkatnya langsung tidak bisa membuka dashboard. Keluarga selalu menyisakan minimal satu admin.

**Juri / uji cepat**: buka `/demo`. Satu browser masuk sebagai admin "Keluarga Demo" sekaligus sebagai HP Oma Siti, ditampilkan berdampingan. Tombol *Simulasikan kejang/jatuh* memicu peringatan otomatis tanpa mengguncang HP. `/demo?reset=1` mengembalikan data demo.

## Menjalankan

```bash
npm install                  # wajib setelah clone atau pull
cp .env.example .env         # isi semua variabel (lihat tabel di bawah)
npm run db:push              # buat/sinkronkan tabel di Supabase
npm run dev                  # http://localhost:3000
```

Setelah `db:push` pada database baru, jalankan `prisma/setup.sql` di Supabase SQL Editor (indeks, CHECK, dan RLS). Database lama: jalankan file di `prisma/sql/` berurutan menurut nama (memindahkan data, tidak menghapus).

Mencoba dari HP di jaringan yang sama: buka `http://<IP-laptop>:3000`. Mikrofon, lokasi, dan *Install* butuh HTTPS di HP, jadi uji penuh di HP memakai hasil deploy (mis. Vercel). Jika muncul `Module not found`: hentikan server, `npm install`, lalu `rm -rf .next && npm run dev`.

| Perintah | Fungsi |
| --- | --- |
| `npm run dev` | server pengembangan |
| `npm run build` / `npm start` | build dan jalankan produksi (service worker aktif hanya di sini) |
| `npm run lint` | ESLint |
| `npm run db:push` | sinkronkan `prisma/schema.prisma` ke database |
| `npm run db:seed` | isi ulang Keluarga Demo (hanya data keluarga demo yang direset) |
| `npm run db:studio` | lihat data di browser |
| `npm run test:deteksi` | uji detektor kejang/jatuh dengan data sensor buatan |

## Deploy (Vercel)

`vercel.json` menaruh server di Mumbai (`bom1`), sama dengan region database Supabase (`ap-south-1`), supaya setiap query tidak menyeberang benua.

```bash
npx vercel login                      # sekali, lewat browser
npx vercel link                       # hubungkan folder ini ke project Vercel
npx vercel env add DATABASE_URL production   # ulangi untuk DIRECT_URL, ORCA_API_KEY, SESSION_SECRET
npx vercel deploy --prod
```

Atau lewat dashboard: *Add New Project*, import repo GitHub ini, isi Environment Variables, lalu *Deploy*. Setiap push ke `main` akan di-deploy otomatis.

## Variabel lingkungan

| Nama | Isi |
| --- | --- |
| `DATABASE_URL` | Supabase Transaction pooler (port 6543, akhiri dengan `?pgbouncer=true`) |
| `DIRECT_URL` | Supabase Session pooler (port 5432), untuk migrasi |
| `ORCA_API_KEY` | OrcaRouter: triase suara, pesan maskot, ringkasan, asisten |
| `SESSION_SECRET` | Penanda tangan cookie sesi, minimal 32 karakter (`openssl rand -base64 48`) |
| `ENABLE_DEMO` | Opsional. `false` mematikan `/demo` |

Key anon/service_role Supabase tidak dipakai: semua akses database lewat Prisma di server. Jangan commit `.env`.

## Database

```
households (keluarga)
 ├─ 1:n members        id, household_id, nama, role (ADMIN | PEMANTAU)
 └─ 1:n lansia         id, household_id, nama, kode_pairing (unik), device_version, terhubung_at
          └─ 1:n daily_records   id, lansia_id, tipe_input (TOMBOL_AMAN | TOMBOL_DARURAT | VOICE_NOTE | KELUHAN | DETEKSI_OTOMATIS),
                                 status_bahaya, ai_analysis (jsonb),
                                 latitude, longitude, akurasi_meter, created_at
households: id, nama, kode_undangan (unik), created_at
```

- Semua foreign key `ON DELETE CASCADE`: menghapus keluarga menghapus anggota, lansia, dan kabarnya; menghapus lansia menghapus kabarnya.
- `CHECK` di database: `role`, `tipe_input`, `status_bahaya`, rentang koordinat.
- RLS aktif di keempat tabel tanpa policy: Data API Supabase (anon/authenticated) tidak bisa membaca atau menulis.
- Skema: `prisma/schema.prisma`. DDL lengkap: `prisma/setup.sql`. Detail: `docs/supabase.md`.

## Keamanan dan akses

- Tanpa kata sandi. Dua cookie httpOnly bertanda tangan HMAC (`sapa-pengawas` berisi id anggota, `sapa-lansia` berisi id lansia + versi perangkat).
- Peran dibaca dari database pada setiap request, jadi perubahan peran dan pengeluaran anggota langsung berlaku.
- Setiap API memeriksa sesi dan membatasi data ke keluarga/lansia milik sesi itu; id dari klien tidak pernah dipercaya. Kode HP dan kode undangan hanya dikirim ke admin.
- Kode dibuat acak (tanpa huruf mirip seperti 0/O, 1/I), percobaan kode dibatasi per IP.
- Lokasi hanya diambil saat tombol ditekan, hanya jika diizinkan di HP orang tua, dan hanya terlihat oleh keluarganya.

## API

| Method | Path | Peran | Fungsi |
| --- | --- | --- | --- |
| POST | `/api/auth/daftar` | publik | daftarkan keluarga, jadi admin |
| POST | `/api/auth/gabung` | publik | masuk dengan kode undangan, jadi pemantau |
| POST | `/api/auth/hubungkan` | publik | hubungkan HP orang tua dengan kode HP |
| POST | `/api/auth/keluar` | anggota | keluar dari perangkat ini |
| GET | `/api/dashboard?lansia=` | anggota | data dashboard (peran, keluarga, lansia, anggota, kabar, lokasi terakhir) |
| GET | `/api/ringkasan?lansia=` | anggota | Ringkasan AI |
| POST | `/api/assistant` | anggota | tanya Asisten AI tentang satu lansia |
| POST | `/api/lansia` | admin | tambah orang tua |
| DELETE | `/api/lansia/:id` | admin | hapus orang tua |
| POST | `/api/lansia/:id/putus` | admin | putuskan HP, buat kode baru |
| PATCH | `/api/anggota/:id` | admin | ubah peran (ADMIN/PEMANTAU) |
| DELETE | `/api/anggota/:id` | admin, atau diri sendiri | keluarkan anggota |
| POST | `/api/record` | lansia | kirim Saya Aman, Darurat, keluhan pilihan (`keluhan: [..]`), atau deteksi otomatis (`sebab: KEJANG/JATUH`); status ditentukan server (+ lokasi) |
| POST | `/api/ai` | lansia | kirim pesan suara (WAV) untuk triase AI (+ lokasi) |
| GET | `/api/saya`, `/api/saya/sapa` | lansia | keadaan HP lansia dan pesan maskot |

## Struktur

```
docs/               PRD dan dokumentasi Supabase
design/             logo dan palet warna (sumber aset)
prisma/             schema.prisma, setup.sql, sql/ (migrasi manual), seed.js
src/app/            halaman dan route handler tipis
src/features/       UI per fitur: lansia (app HP), pengawas (dashboard), masuk (daftar/gabung/hubungkan)
src/components/     komponen bersama (Mascot, ShareCode, StatusBadge, Wordmark)
src/services/       logika bisnis (household, record, triage, mascot, assistant, demo)
src/hooks/          useRecorder (rekam dan ubah ke WAV)
src/lib/            db, orca, session, auth, codes, geo, lokasi, format, dll.
src/proxy.js        aturan akses halaman berdasarkan sesi
public/sw.js        service worker (cache aplikasi, offline)
```

Catatan untuk asisten kode: `CLAUDE.md`.
