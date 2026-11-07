# Produk

## Masalah

Anak yang tinggal jauh dari orang tua tidak tahu apakah orang tuanya baik-baik saja hari ini. Aplikasi pemantauan yang ada menuntut orang tua belajar teknologi baru: login, menu bertingkat, huruf kecil. Akibatnya tidak dipakai, dan keluarga kembali menelepon berulang kali.

## Pendekatan

Beban teknologi dipindahkan dari orang tua ke sistem.

- Orang tua hanya menghadapi tiga tombol besar. Tanpa kata sandi, tanpa menu.
- Keluarga mendapat dashboard yang merangkum kondisi, bukan daftar mentah.
- AI menerjemahkan pesan suara dan keluhan menjadi status yang bisa langsung dipahami.
- Bila orang tua tidak bisa bicara atau mengetik, ada pilihan gambar dan tombol darurat kejang.

## Tiga peran

| Peran | Perangkat | Cara masuk | Bisa | Tidak bisa |
|---|---|---|---|---|
| Admin | Web (dashboard "Pemantauan") | Mendaftarkan keluarga di `/daftar` | Semua yang dilihat pemantau, ditambah: tambah/hapus orang tua, lihat kode pairing dan undangan, ubah peran, putuskan HP | - |
| Pemantau | Web (dashboard "Pemantauan") | Kode undangan di `/gabung` | Melihat kabar, lokasi terakhir, riwayat, ringkasan AI, bertanya ke asisten, unduh CSV/PDF | Mengelola orang tua, melihat kode, mengubah peran |
| Lansia | HP (aplikasi PWA di `/lansia`) | Kode pairing di `/hubungkan` | Tiga tombol, keluhan gambar atau suara, tombol darurat kejang, pengaturan ukuran tulisan | Melihat data keluarga lain, atau dashboard |

Pemisahan ini ditegakkan di server pada setiap request (lihat [KEAMANAN.md](KEAMANAN.md)), bukan hanya dengan menyembunyikan tombol.

## Katalog fitur

### Aplikasi orang tua

| Fitur | Perilaku |
|---|---|
| Saya Aman | Satu ketukan; status HIJAU. |
| Keluhan | Sembilan gambar (pusing, nyeri dada, sesak, jatuh, kejang, mual, demam, obat habis, ingin ditelepon) atau tombol Bicara. Nyeri dada, sesak, jatuh, dan kejang otomatis MERAH. |
| Darurat | Satu ketukan; status MERAH, keluarga diberi tahu. |
| Pesan suara | Rekam sampai 30 detik. AI mentranskripsi dan menentukan status; keluarga bisa memutar suara aslinya. |
| Sudah Obat | Pintasan konfirmasi minum obat (status HIJAU). |
| Tombol Darurat Kejang | Memulai hitung mundur 30 detik dengan sirine dan getar, plus petunjuk pertolongan pertama untuk orang di sekitar. Tidak dibatalkan berarti darurat terkirim otomatis. |
| Deteksi guncangan (opsional) | Saklar yang memakai sensor gerak HP untuk memulai hitung mundur yang sama. Hanya bekerja saat aplikasi terbuka; lihat batasan di [KEAMANAN.md](KEAMANAN.md). |
| Maskot burung hantu | Pesan sapaan harian yang ditulis AI, menyebut nama dan kondisi hari ini; ada teks cadangan bila AI tidak tersedia. |
| Pengaturan | Ukuran tulisan (standar, besar, sangat besar), ganti kode tanpa instal ulang, keluar dari perangkat. |
| Lokasi | Dikirim bersama kabar bila izin diberikan; tidak wajib. |
| PWA | Dapat dipasang ke layar utama, halaman offline, berjalan layar penuh. |

### Dashboard keluarga

| Fitur | Perilaku |
|---|---|
| Beranda | Status terkini, statistik hari ini, grafik seminggu, linimasa, kartu pertolongan pertama, ringkasan AI. |
| Lokasi terakhir | Peta, koordinat, tombol salin, perbarui, buka di Google Maps. |
| Riwayat | Seluruh kabar dengan pemutar suara; filter menurut orang tua. |
| Asisten AI | Tanya jawab tentang kondisi orang tua berdasarkan riwayat. |
| Keluarga (admin) | Kode pairing dan undangan, tambah orang tua, putuskan HP, ubah peran, keluarkan anggota. |
| Pengaturan | Ekspor CSV, cetak PDF, nomor darurat satu ketukan (119, 112, 110, 113). |
| Beberapa orang tua | Pemilih orang tua; data tiap orang tua terpisah. |
| Pembaruan otomatis | Dashboard menyegarkan diri berkala, berhenti saat tab tersembunyi. |

### Mode demo

`/demo` memasang dua sesi sekaligus (admin keluarga contoh dan HP "Oma Siti") lalu membuka layar berdampingan, dengan tombol simulasi kejang/jatuh. Dimatikan secara default di produksi; lihat [PRODUKSI.md](PRODUKSI.md).

## Alur utama

### Pendaftaran keluarga

1. Admin membuka `/daftar`, mengisi nama sendiri dan nama orang tua.
2. Sistem membuat keluarga, admin, dan orang tua pertama, lalu menampilkan kode pairing (6 karakter) dan kode undangan (8 karakter).
3. Admin memasukkan kode pairing di HP orang tua pada `/hubungkan`. HP itu tersambung selama setahun atau sampai diputus.
4. Admin membagikan kode undangan ke anggota lain, yang bergabung lewat `/gabung` sebagai pemantau.

### Satu kabar

1. Orang tua mengetuk tombol. HP mengirim jenis kabar dan lokasi (bila ada).
2. Server memverifikasi sesi, menentukan status dari aturan baku (atau dari AI untuk suara), dan menyimpan.
3. HP menampilkan balasan hangat yang menyebut nama. Maskot memperbarui sapaan.
4. Dashboard menampilkan kabar pada penyegaran berikutnya; status MERAH memuat kartu tindakan.

### Kehilangan atau ganti HP

Admin menekan "Putuskan HP". Sesi lama langsung tidak berlaku, dan kode pairing baru diterbitkan untuk HP pengganti.

## Di luar cakupan versi ini

- Notifikasi push ke HP anggota keluarga (dashboard memakai penyegaran berkala).
- Deteksi jatuh/kejang saat aplikasi tertutup (batasan platform web).
- Integrasi perangkat wearable.
- Pembatas laju terdistribusi (saat ini dalam memori; lihat [KEAMANAN.md](KEAMANAN.md)).
