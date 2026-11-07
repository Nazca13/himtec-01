# 🏆 Panduan Penilaian Juri — SAPA (Sistem Asisten Pantau Aktif)

Dokumen ini disusun khusus bagi dewan juri untuk menguji dan mengevaluasi seluruh inovasi, keandalan fungsional, dan pengalaman pengguna (*user experience*) pada aplikasi **SAPA**.

---

## 🚀 Cara Cepat Membuka Demo (1-Klik)

Untuk menguji seluruh ekosistem tanpa perlu mendaftar atau menghubungkan dua perangkat fisik:

1. Jalankan aplikasi (`npm run dev`) atau buka alamat produksi, lalu buka jalur `/demo`:
   ```
   http://localhost:3000/demo
   ```
   Di produksi, mode demo mati secara default. Pemilik harus menyetel `ENABLE_DEMO=true` dan men-deploy ulang (lihat [PRODUKSI.md](PRODUKSI.md)); tanpa itu `/demo` menampilkan 404.
2. Anda otomatis masuk sebagai:
   - **Kiri**: Layar HP Lansia (**Oma Siti**) dalam simulasi ponsel ramah lansia.
   - **Kanan**: Layar Dashboard Keluarga / Petugas Pengawas (**Tamu Demo**) secara *real-time*.

> **Tip Pengujian:** Untuk mengembalikan data demo ke kondisi awal kapan saja, klik tombol **"Ulangi data demo"** di pojok kanan atas layar demo (`/demo?reset=1`).

---

## 🎯 7 Skenario Pengujian Fitur Unggulan

### 1. 🔊 Pemutar Suara Nenek Asli (*Voice Memo Player*)
- **Tujuan**: Membuktikan bahwa suara ucapan lansia tersimpan dan dapat didengarkan oleh keluarga/petugas, lengkap dengan analisis AI.
- **Langkah Uji**:
  1. Pada HP Lansia di kiri, tekan tombol **Keluhan** (Kuning) ➔ Tekan **Bicara**.
  2. Ucapkan keluhan (misal: *"Dada saya agak sesak dan kepala pusing"*), lalu tekan **Selesai bicara**.
  3. Perhatikan di Dashboard kanan: dalam hitungan detik, kartu status dan riwayat teratas menampilkan entri baru **Pesan Suara**.
  4. Tekan tombol **Play (▶)** pada kartu pemutar suara.
  5. Suara asli lansia berputar dengan visual bar gelombang suara dinamis (*audio waveform*), pengatur kecepatan (**1x / 1.5x / 2x**), dan teks transkrip AI di bawahnya!

---

### 2. ⚡ Tombol Darurat Kejang & Deteksi Guncangan (Vibrate)
- **Tujuan**: Membuktikan responsivitas sistem terhadap kasus gawat darurat spesifik lansia (kejang & jatuh).
- **Langkah Uji (Simulasi Demo)**:
  1. Di bilah navigasi atas layar demo, klik tombol merah **`⚡ Simulasikan Kejang`**.
  2. Perhatikan layar HP Lansia:
     - Bergetar otomatis (`navigator.vibrate`) dan membunyikan sirine alarm lokal.
     - Menampilkan hitung mundur 30 detik: *"Terdeteksi guncangan seperti kejang"*.
     - Menyediakan tombol pembatalan *"Saya baik-baik saja"* dan panduan untuk orang sekitar beserta tombol telepon 119.
  3. Biarkan waktu habis (atau biarkan terkirim):
     - Dashboard Pengawas di kanan **berubah seketika menjadi MERAH MENYALA**!
     - Sirine darurat browser pengawas berbunyi.
     - Muncul kartu khusus **"Kemungkinan kejang: pertolongan pertama"** dengan 4 langkah medis darurat, tombol telepon Ambulans 119, dan koordinat peta lokasi.
- **Langkah Uji (Tombol Fisik di Layar Lansia)**:
  - Pada aplikasi lansia, tepat di bawah 3 tombol utama terdapat ubin khusus: **"Tombol Darurat Kejang"** yang dapat ditekan langsung tanpa membuka menu keluhan.

---

### 3. 🎨 Perbedaan Warna Tegas: Keluhan (Kuning) vs Darurat (Merah) vs Aman (Hijau)
- **Tujuan**: Evaluasi ergonomi visual sesuai Apple Human Interface Guidelines (kontras tinggi, tidak ambigu).
- **Evaluasi Visual**:
  - **Status Aman**: Warna hijau zamrud (`#16a34a`) yang tenang dan melegakan.
  - **Status Keluhan**: Warna kuning *amber gold* (`#d97706`) yang jelas dan kontras, menunjukkan kondisi perlu perhatian tanpa memicu kepanikan berlebih.
  - **Status Darurat**: Warna merah menyala (`#dc2626`) dengan denyut alarm visual berulang (*pulsing ring*) untuk memicu tindakan cepat.
  - Setiap kartu di *Timeline* dilengkapi garis aksen vertikal di sisi kiri sesuai kategori warna status.

---

### 4. 💊 Pengingat Minum Obat & Absensi Harian (*Daily Streak*)
- **Tujuan**: Memastikan lansia disiplin memberi kabar dan meminum obat harian.
- **Langkah Uji**:
  1. Lihat *banner* status di atas tombol utama aplikasi lansia:
     - Menampilkan indikator apakah hari ini sudah lapor aman atau belum.
     - Menghitung rentetan hari (*daily streak*) kedisiplinan orang tua.
  2. Tekan tombol cepat **`💊 Sudah Obat`**.
  3. Kabar langsung terkirim tanpa membingungkan lansia. Maskot burung hantu merespons bahagia, dan di dashboard keluarga tercatat: *"Oma Siti mengonfirmasi: sudah minum obat. Kondisi terpantau baik."*

---

### 5. ⚙️ Pengaturan Aksesibilitas Lansia & Sambung Kode Langsung
- **Tujuan**: Aksesibilitas bagi lansia dengan keterbatasan visual, serta kemudahan mengganti akun tanpa instalasi ulang.
- **Langkah Uji**:
  1. Ketuk ikon gir **⚙️** di pojok kanan atas samping nama lansia.
  2. **Skala Ukuran Tulisan**: Pilih *Besar* atau *Sangat Besar*. Seluruh elemen font dan teks membesar secara proporsional.
  3. **Sambung Kode Baru Langsung**: Masukkan kode pairing baru di form in-place, lalu tekan *Sambungkan*. Aplikasi langsung berpindah ke akun lansia yang dimaksud tanpa perlu menghapus PWA atau membuka tautan WhatsApp lagi.

---

### 6. 📊 Dashboard Pengawas: Ekspor Riwayat CSV & Panggilan Darurat
- **Tujuan**: Memudahkan keluarga membawa data rekam kondisi lansia ke dokter spesialis geriatri.
- **Langkah Uji**:
  1. Buka menu **Pengaturan** (tab ke-5 pada dashboard pengawas).
  2. Tekan tombol **Unduh CSV**: File `.csv` rapi langsung terunduh ke komputer/HP, siap dibuka di Microsoft Excel.
  3. Tekan tombol **Cetak PDF**: Tampilan cetak ringkasan rekam medis siap di-print atau disimpan.
  4. Uji tombol **Panggilan Cepat (119, 112, 110, 113)**: Terhubung langsung ke protokol panggilan telepon.

---

### 7. 📍 Pembaruan Lokasi GPS Live & Titik Koordinat Presisi
- **Tujuan**: Mengetahui posisi fisik lansia secara akurat dengan visualisasi peta dan tombol penyegaran instan.
- **Langkah Uji**:
  1. Pada kartu **Lokasi Lansia** di dashboard pengawas:
     - Terpampang peta OpenStreetMap dengan radar posisi berdenyut (*pulse dot*).
     - Terlihat kotak koordinat presisi format desimal (`Latitude, Longitude`) dan radius akurasi GPS (`±X m`).
  2. Tekan tombol **Salin**: Titik koordinat tersalin ke clipboard dalam satu sentuhan.
  3. Tekan tombol **Perbarui Lokasi**: Ikon berputar dan posisi peta ter-refresh tanpa perlu memuat ulang seluruh halaman web.
  4. Tekan tombol **Buka Google Maps**: Membuka rute navigasi instan menuju lokasi orang tua.

---

## 🛠️ Ringkasan Arsitektur Teknologi

| Komponen | Spesifikasi |
|---|---|
| **Framework** | Next.js 16.4.5 (Turbopack, App Router, React 19.3) |
| **Database** | PostgreSQL via Supabase + Prisma ORM 6.19 |
| **Model AI** | Gemini 2.5 Flash via OrcaRouter (Audio Multimodal & Text Triage) |
| **Autentikasi** | Signed Session Cookie (HMAC-SHA256 Web Crypto API, tanpa password) |
| **PWA** | Service Worker mandiri, Offline Fallback, App Manifest |
| **Styling** | Apple Human Interface Guidelines, CSS Modules murni, Zero Runtime Overhead |

---
*Dikembangkan dengan dedikasi penuh untuk menjaga keselamatan dan kualitas hidup orang tua lanjut usia di Indonesia.* 🦉🇮🇩
