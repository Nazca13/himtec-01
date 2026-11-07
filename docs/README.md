# Dokumentasi SAPA

SAPA (Sistem Asisten Pantau Aktif) adalah aplikasi pemantauan orang tua jarak jauh: orang tua cukup menekan satu dari tiga tombol besar, keluarga langsung melihat kabarnya di dashboard.

Folder ini adalah dokumentasi lengkap proyek. Mulai dari bagian yang sesuai peran Anda.

## Peta dokumen

| Dokumen | Untuk siapa | Isi |
|---|---|---|
| [PRODUK.md](PRODUK.md) | Semua | Masalah yang diselesaikan, tiga peran, katalog fitur, alur pengguna |
| [ARSITEKTUR.md](ARSITEKTUR.md) | Developer | Lapisan sistem, struktur folder, alur request, pemrosesan AI, keputusan desain |
| [API.md](API.md) | Developer | Referensi seluruh endpoint: autentikasi, isi request/response, kode galat, batas laju |
| [DATABASE.md](DATABASE.md) | Developer, DBA | Model data, relasi, constraint, RLS, cara menjalankan migrasi |
| [KEAMANAN.md](KEAMANAN.md) | Developer, reviewer | Model ancaman, kontrol yang ada, batasan yang diterima, pelaporan celah |
| [PENGEMBANGAN.md](PENGEMBANGAN.md) | Kontributor baru | Menjalankan lokal, konvensi kode, tes, cara menambah fitur |
| [PRODUKSI.md](PRODUKSI.md) | Operator | Variabel lingkungan, deploy ke Vercel, daftar periksa rilis, pemantauan, rollback |
| [PANDUAN_JURI.md](PANDUAN_JURI.md) | Juri, penilai | Cara membuka demo satu klik dan skenario pengujian |
| [PRD.txt](PRD.txt) | Tim produk | Product Requirement Document asli |
| [supabase.md](supabase.md) | Developer | Catatan integrasi Supabase |
| [supabase-setup.txt](supabase-setup.txt) | Pemula | Langkah demi langkah membuat project Supabase |
| [schema.sql](schema.sql) | Developer | Skema SQL siap tempel di SQL Editor Supabase |
| [screenshots/](screenshots/) | Semua | Tangkapan layar antarmuka |

Laporan akademik (latar belakang, use case, diagram) ada di [`../readthis.md`](../readthis.md). Instalasi singkat ada di [`../README.md`](../README.md).

## Istilah

| Istilah | Arti |
|---|---|
| Lansia | Orang tua yang dipantau. Memakai aplikasi di HP-nya. |
| Keluarga (household) | Satu kelompok: anggota yang memantau dan orang tua yang dipantau. |
| Admin | Anggota keluarga yang mengelola: tambah orang tua, kode, peran. |
| Pemantau | Anggota keluarga yang hanya melihat. |
| Kode pairing | 6 karakter untuk menghubungkan HP orang tua ke akunnya. |
| Kode undangan | 8 karakter untuk mengajak anggota keluarga bergabung sebagai pemantau. |
| Kabar (record) | Satu laporan dari HP orang tua: aman, keluhan, suara, atau darurat. |
| Status | HIJAU (aman), KUNING (perlu perhatian), MERAH (darurat). Selalu ditentukan server. |

## Menjaga dokumentasi tetap benar

- Ubah kode yang memengaruhi kontrak (endpoint, skema, variabel lingkungan) dalam pull request yang sama dengan dokumennya.
- `tests/docs.test.mjs` menjaga `schema.sql` tetap identik dengan `prisma/setup.sql`.
- Jangan menulis nilai rahasia nyata di dokumen mana pun. Pakai penanda seperti `[PASSWORD]`.
