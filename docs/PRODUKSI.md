# Operasi produksi

## Variabel lingkungan

| Variabel | Wajib | Contoh/aturan | Fungsi |
|---|---|---|---|
| `DATABASE_URL` | Ya | `postgresql://postgres.<ref>:<kata-sandi>@aws-0-<region>.pooler.supabase.com:6543/postgres?pgbouncer=true` | Koneksi runtime (pooler transaksi) |
| `DIRECT_URL` | Untuk migrasi | Sama, port `5432` | `prisma db push` dan migrasi. Tidak dibaca saat runtime |
| `SESSION_SECRET` | Ya | Minimal 32 karakter acak: `openssl rand -base64 48` | Tanda tangan cookie sesi |
| `ORCA_API_KEY` | Disarankan | Kunci OrcaRouter | AI. Tanpa kunci: teks cadangan |
| `ENABLE_DEMO` | Tidak | `true` untuk menyalakan | Mode demo `/demo`. Default: mati di produksi, hidup di dev |

Semua dibaca di server. Tidak ada variabel `NEXT_PUBLIC_*`.

Saat start, `src/instrumentation.js` memeriksa nilai-nilai ini. Di produksi, konfigurasi yang rusak menghentikan server dengan pesan jelas di log, sehingga deploy yang salah gagal cepat alih-alih menyajikan galat samar.

## Deploy ke Vercel

Konfigurasi proyek ada di `vercel.json` (wilayah `bom1`, sama dengan wilayah database Supabase Mumbai). Bila database Anda di wilayah lain, ubah `regions` agar berdekatan.

```bash
npm i -g vercel
vercel login
vercel link
# isi variabel (jangan tempel nilai di chat atau commit)
vercel env add DATABASE_URL production
vercel env add DIRECT_URL production
vercel env add SESSION_SECRET production
vercel env add ORCA_API_KEY production
vercel env add ENABLE_DEMO production        # hanya bila memerlukan demo publik
vercel                                       # pratinjau
vercel --prod                                # produksi, setelah pratinjau diperiksa
```

Tambahkan variabel yang sama untuk lingkungan Preview. Gunakan `SESSION_SECRET` yang berbeda per lingkungan.

Karena `/` dan `/demo/layar` dibuat saat build, nilai `ENABLE_DEMO` dibaca saat build. Mengubahnya memerlukan deploy ulang.

## Daftar periksa sebelum rilis

Database

- [ ] Skema terbaru terpasang (`docs/schema.sql` atau semua migrasi `prisma/sql/` sudah dijalankan).
- [ ] RLS aktif pada keempat tabel.
- [ ] Cadangan otomatis Supabase aktif (rencana berbayar) atau ekspor terjadwal.
- [ ] Wilayah fungsi Vercel berdekatan dengan database.

Rahasia dan konfigurasi

- [ ] Kata sandi database bukan yang pernah ditempel di chat atau repositori.
- [ ] `SESSION_SECRET` baru, khusus produksi.
- [ ] `ORCA_API_KEY` baru bila kunci lama pernah terpapar; batas pengeluaran diatur di penyedia.
- [ ] `ENABLE_DEMO` tidak disetel (atau sengaja `true` untuk presentasi, lalu dimatikan).
- [ ] `.env` tidak ada di repositori.

Kualitas

- [ ] CI hijau: lint, tes, build.
- [ ] `npm audit --omit=dev` ditinjau (lihat batasan di [KEAMANAN.md](KEAMANAN.md)).
- [ ] Pratinjau diuji di HP asli: pasang ke layar utama, rekam suara, izin lokasi, tombol darurat.
- [ ] Skenario di [PANDUAN_JURI.md](PANDUAN_JURI.md) lolos di pratinjau.

Operasional

- [ ] Pemantau uptime menembak `GET /api/health` tiap 1-5 menit (UptimeRobot, Better Stack, atau Vercel).
- [ ] Peringatan untuk respons 503 dan lonjakan galat 5xx.
- [ ] Log Vercel dapat diakses oleh minimal dua orang.
- [ ] Domain khusus dan HTTPS (otomatis di Vercel) bila perlu.

## Pemeriksaan setelah deploy

```bash
curl -s https://<domain>/api/health                 # status "ok", database.ok true
curl -sI https://<domain>/ | grep -i strict-transport
curl -s -o /dev/null -w "%{http_code}\n" https://<domain>/demo   # 404 bila demo mati
```

Lalu uji alur penuh: daftar keluarga, hubungkan HP, kirim satu kabar, lihat di dashboard. Setelah deploy produksi, pantau log galat selama satu jam pertama (`vercel logs <url> --level error`).

## Pemantauan

| Sinyal | Sumber | Tindakan |
|---|---|---|
| `status: "degraded"` / HTTP 503 di `/api/health` | Pemantau uptime | Periksa status Supabase dan `DATABASE_URL`; lihat log |
| Banyak 429 | Log | Kemungkinan penyalahgunaan; periksa IP, pertimbangkan pembatas laju terdistribusi |
| Banyak `P2024` | Log | Tambah `connection_limit=1`, periksa penumpukan polling |
| AI gagal terus | Log `ai`, `assistant`, `mascot` | Periksa kuota dan kunci OrcaRouter; aplikasi tetap jalan dengan teks cadangan, dengan status suara KUNING |
| Server tak mau naik | Log start: "Konfigurasi tidak valid" | Perbaiki env, deploy ulang |

Versi yang berjalan terlihat di `GET /api/health` (`versi` = 7 karakter pertama SHA commit di Vercel).

## Rollback

- Kode: di dashboard Vercel pilih deployment sebelumnya lalu "Promote to Production" (instan, tanpa build ulang), atau `vercel rollback`.
- Skema: migrasi tidak otomatis dibalik. Karena itu, buat perubahan skema yang kompatibel mundur (tambah kolom dulu, hapus kolom di rilis berikutnya) agar rollback kode tetap aman.
- Data: pulihkan dari cadangan Supabase.

## Rotasi rahasia

| Rahasia | Langkah | Dampak |
|---|---|---|
| Kata sandi database | Ubah di Supabase (Database Settings), perbarui `DATABASE_URL` dan `DIRECT_URL` di Vercel, deploy ulang | Beberapa detik galat selama pergantian |
| `ORCA_API_KEY` | Buat kunci baru di penyedia, perbarui di Vercel, deploy ulang, cabut yang lama | Tidak ada |
| `SESSION_SECRET` | Ganti di Vercel, deploy ulang | Semua pengguna keluar. HP orang tua harus dihubungkan ulang dengan kode pairing, jadi lakukan di luar jam kritis dan beri tahu keluarga |

## Skala dan biaya

- Beban per keluarga kecil: puluhan kabar per hari dan satu dashboard yang menyegarkan berkala.
- Biaya terbesar: pemanggilan AI. Pembatas 40 pesan suara per jam per orang tua dan 60 pertanyaan asisten per jam per anggota membatasi pemborosan. Atur batas pengeluaran di OrcaRouter.
- Hambatan pertama saat tumbuh: (1) pembatas laju dalam memori, (2) audio di kolom database. Keduanya sudah dicatat di [KEAMANAN.md](KEAMANAN.md) beserta jalur peningkatannya.
