# Keamanan

Aplikasi ini menyimpan data kesehatan dan lokasi orang lanjut usia, jadi keamanan dan privasi adalah syarat, bukan tambahan.

## Aset yang dilindungi

| Aset | Alasan |
|---|---|
| Rekaman suara, transkrip keluhan, status kesehatan | Data kesehatan pribadi |
| Lokasi terakhir orang tua | Dapat dipakai untuk membahayakan orang tua yang rentan |
| Kode pairing dan undangan | Membuka akses ke data di atas |
| `SESSION_SECRET`, `DATABASE_URL`, `ORCA_API_KEY` | Kompromi berarti akses penuh atau tagihan AI |

## Kontrol yang ada

### Autentikasi dan sesi

- Tanpa kata sandi. Akses diberikan oleh kode acak: 6 karakter (pairing) dan 8 karakter (undangan) dari alfabet 31 karakter tanpa `0/O/1/I/L`. Dibuat dengan `crypto.randomInt`.
- Sesi berupa cookie `httpOnly`, `SameSite=Lax`, `Secure` di HTTPS, bertanda tangan HMAC-SHA256 (Web Crypto) dengan `SESSION_SECRET`, dan memuat masa berlaku.
- Cookie hanya berisi id. Peran dan keanggotaan dibaca dari database pada setiap request (`requireMember`, `requireLansia`), jadi perubahan peran berlaku seketika.
- Pemutusan HP menaikkan `device_version`, sehingga cookie lama langsung tidak berlaku.
- Pembatasan laju pada endpoint yang menerima tebakan kode (`daftar`, `gabung`, `hubungkan`) dan pada endpoint berbiaya (AI, asisten, demo). Lihat tabel di [API.md](API.md).

### Otorisasi

- Hanya admin yang dapat: menambah/menghapus orang tua, memutus HP, mengubah peran, melihat kode pairing dan undangan. Server tidak mengirim kode ke pemantau, jadi menyembunyikannya di UI bukan satu-satunya penjaga.
- Setiap akses data dimulai dari keluarga milik sesi. Id milik keluarga lain menghasilkan 404, sama seperti id yang tidak ada.
- Keluarga tidak bisa kehilangan admin terakhir.
- Status bahaya selalu dihitung server; klien tidak dapat memalsukannya.

### Validasi input

- Nama dibersihkan dan dibatasi panjangnya (`lib/validate.js`).
- Lokasi hanya diterima bila angka dalam rentang valid (`lib/lokasi.js`); selebihnya diabaikan.
- Audio dibatasi ukurannya dan harus `audio/wav`.
- Id pada jalur audio harus UUID.
- Keluhan dicocokkan dengan daftar baku; id tak dikenal ditolak.

### Data dan database

- RLS aktif pada semua tabel tanpa policy: kunci Supabase publik tidak bisa membaca data.
- Constraint `CHECK` pada peran, jenis kabar, status, dan lokasi.
- Query memakai Prisma (terparameter); tidak ada SQL yang disusun dari input pengguna.

### Transport dan peramban

Header dari `next.config.mjs`:

| Header | Nilai | Tujuan |
|---|---|---|
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains` | Paksa HTTPS |
| `X-Content-Type-Options` | `nosniff` | Cegah salah tafsir tipe konten |
| `X-Frame-Options` | `SAMEORIGIN` | Cegah clickjacking |
| `Content-Security-Policy` | `frame-ancestors 'self'` | Sama, untuk peramban modern (halaman demo memakai iframe dari situs sendiri) |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Kurangi kebocoran URL |
| `Permissions-Policy` | mikrofon dan lokasi hanya `self`, kamera dimatikan | Batasi sensor |

### Konfigurasi dan rahasia

- `.env` tidak pernah ter-commit (`.gitignore`); hanya `.env.example` dengan penanda. Riwayat git telah diperiksa: tidak ada rahasia.
- `src/instrumentation.js` memvalidasi env saat server mulai (`lib/env.js`). Di produksi, `DATABASE_URL` kosong/placeholder atau `SESSION_SECRET` kurang dari 32 karakter menghentikan server dengan pesan jelas.
- Kunci AI hanya dipakai di server; tidak ada variabel `NEXT_PUBLIC_*`.
- Mode demo mati secara default di produksi (`ENABLE_DEMO=true` untuk menyalakan).
- Galat server dikembalikan sebagai pesan umum; detail hanya di log.

### Pemindaian otomatis

- `.github/workflows/security.yml`: pemindaian Strix pada pull request (dilewati bila secret tidak tersedia).
- `.github/workflows/ci.yml`: lint, tes, dan build pada setiap push dan PR.

## Batasan yang diterima

Dicatat terbuka agar keputusan berikutnya tepat.

| Batasan | Dampak | Kapan ditingkatkan |
|---|---|---|
| Pembatas laju dalam memori per proses | Di serverless dengan banyak instance, batas efektif lebih longgar dari angka tertulis. Tebakan kode 8 karakter tetap tidak praktis (sekitar 8,5 x 10^11 kemungkinan). | Bila dipakai publik: Upstash Redis atau pembatas bawaan Vercel |
| Cookie berlaku 1 tahun | HP orang tua harus tetap tersambung tanpa login ulang. Cookie yang dicuri berlaku sampai HP diputus atau `SESSION_SECRET` diganti. | Pertimbangkan perpanjangan bergulir |
| Kode undangan tidak kedaluwarsa | Siapa pun yang memegangnya bisa bergabung sebagai pemantau (hanya lihat). | Tambah masa berlaku dan tombol "buat kode baru" |
| Audio tersimpan di database tanpa enkripsi tingkat aplikasi | Dilindungi enkripsi saat diam milik Supabase dan RLS. | Pindah ke object storage privat dengan URL bertanda tangan |
| Deteksi guncangan hanya bekerja saat aplikasi terbuka | Peramban menghentikan sensor di latar belakang. Tombol darurat kejang manual tetap andal. | Perlu aplikasi native |
| Tidak ada notifikasi push | Keluarga melihat kabar lewat penyegaran dashboard. | Web Push atau WhatsApp/SMS gateway |
| Tiga temuan `npm audit` (tingkat tinggi) pada rantai Prisma CLI (`deepmerge-ts`) | Hanya alat pengembangan (`prisma generate/db push`), bukan kode yang berjalan di produksi. | Naik ke Prisma 7 |
| Data kesehatan dikirim ke penyedia AI pihak ketiga | Transkrip dan audio diproses OrcaRouter/Google. | Tinjau kebijakan retensi penyedia sebelum produksi nyata; sampaikan ke pengguna |

## Praktik rahasia

- Jangan menempelkan rahasia di chat, issue, atau commit. Bila terjadi, anggap bocor dan ganti.
- Ganti segera bila bocor: kata sandi database (dashboard Supabase), `ORCA_API_KEY` (dashboard penyedia), `SESSION_SECRET` (semua pengguna harus masuk ulang).
- Gunakan `SESSION_SECRET` berbeda untuk lokal, pratinjau, dan produksi.
- Bila DB pernah terpapar, ganti kata sandi database dan tinjau log akses Supabase.

## Melaporkan celah

Kirim laporan pribadi ke pemilik repositori (jangan lewat issue publik), sertakan langkah reproduksi dan dampaknya. Jangan menguji terhadap data keluarga nyata.
