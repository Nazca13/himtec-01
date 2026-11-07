# 🦉 SAPA — Sistem Asisten Pantau Aktif

> **Platform Pemantauan Lansia Terpadu Berbasis AI Multimodal, PWA, dan Desain Aksesibel Apple Human Interface Guidelines.**

[![Next.js](https://img.shields.io/badge/Next.js-16.4.5-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.3.0-blue?style=flat-square&logo=react)](https://react.dev/)
[![Prisma](https://img.shields.io/badge/Prisma-6.19-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=flat-square&logo=supabase)](https://supabase.com/)
[![Gemini](https://img.shields.io/badge/AI-Gemini%202.5%20Flash-8E75B2?style=flat-square&logo=google)](https://orcarouter.ai/)

---

## 🌟 Mengapa SAPA Diciptakan?

Banyak orang tua lanjut usia di Indonesia tinggal terpisah dari anak-anaknya. Saat terjadi keadaan darurat (seperti **jatuh, serangan jantung, atau kejang**), lansia sering kali tidak sempat atau kesulitan mengoperasikan aplikasi perpesanan yang rumit. 

**SAPA (Sistem Asisten Pantau Aktif)** hadir memberikan solusi dengan prinsip **Zero Cognitive Load** untuk lansia:
- **Di HP Orang Tua**: Hanya ada **tiga tombol besar** (Aman, Keluhan, Darurat), tombol cepat darurat kejang, dan pengingat minum obat 1-ketuk. Tanpa password, tanpa menu bertingkat.
- **Di Layar Keluarga / Petugas**: Dashboard *real-time* cerdas yang menyajikan ringkasan kondisi medis dari AI, pemutar rekaman suara asli lansia, peta lokasi GPS, serta panduan pertolongan pertama terarah.

---

## 🎯 6 Fitur Unggulan

### 1. 🔊 Pemutar Suara Nenek Asli (*Voice Memo Player*)
Rekaman ucapan lansia dikonversi menjadi audio WAV standar mono 16 kHz dan disimpan aman di server. Petugas/keluarga dapat:
- Memutar suara asli lansia langsung di kartu status dan timeline riwayat.
- Melihat animasi visual gelombang suara (*audio wave bars*).
- Mengatur kecepatan putar (**1x / 1.5x / 2x**).
- Membaca transkrip teks dan analisis klinis otomatis yang dihasilkan oleh AI.

### 2. ⚡ Tombol Darurat Kejang & Sensor Getar (Vibrate)
- **Tombol Cepat Kejang**: Terletak tepat di bawah tombol utama untuk respons darurat kilat saat orang tua mengalami kejang.
- **Deteksi Gerak & Akselerometer**: Membaca guncangan ritmis khas kejang atau benturan jatuh keras saat ponsel terbuka.
- **Respon Getar & Hitung Mundur**: HP lansia bergetar hebat (`navigator.vibrate`) dan membunyikan sirine lokal. Jika tidak dibatalkan dalam 30 detik, sistem otomatis mengirim status **MERAH** ke seluruh keluarga beserta kartu pertolongan pertama dan panggilan 119.

### 3. 🎨 Palet Warna Ergonomis & Kontras Tinggi (Apple HIG)
Memisahkan kategori status secara tegas agar tidak memicu ambiguitas visual:
- 🟢 **HIJAU (`#16a34a`)**: Kondisi Aman, laporan harian rutin, dan konfirmasi minum obat.
- 🟡 **KUNING (`#d97706`)**: Keluhan ringan/sedang (pusing, demam, mual, obat habis) yang memerlukan perhatian keluarga tanpa panik.
- 🔴 **MERAH (`#dc2626`)**: Keadaan gawat darurat (kejang, jatuh, nyeri dada, sesak napas) dengan denyut alarm visual berulang (*pulsing alarm*).

### 4. 💊 Pengingat Minum Obat & Absensi Laporan Harian (*Daily Streak*)
- Indikator status harian di HP orang tua: *"Hari ini sudah lapor aman"* vs *"Belum ada kabar hari ini"*.
- Perhitungan rentetan hari (*streak*) kedisiplinan orang tua dalam memberi kabar.
- Tombol 1-ketuk **`💊 Sudah Obat`** untuk mencatat kepatuhan minum obat secara instan.

### 5. ⚙️ Pengaturan Lengkap di Kedua Sisi
- **Di Sisi Lansia**:
  - Pilihan skala ukuran font layar: **Standar (100%)**, **Besar (115%)**, atau **Sangat Besar (130%)**.
  - **Ganti Kode Tanpa Instal Ulang**: Form input kode 6-digit langsung di tempat tanpa perlu uninstall PWA atau klik link tautan.
- **Di Sisi Pengawas (`/pengawas/pengaturan`)**:
  - Saklar sirine alarm otomatis saat status darurat merah masuk.
  - Pilihan interval pembaruan data (*polling rate* 3s / 5s / 15s).
  - Panggilan cepat darurat medis (**Ambulans 119, Darurat 112, Polisi 110, Damkar 113**).
  - **Ekspor Riwayat ke CSV / Excel** untuk diserahkan ke dokter spesialis geriatri.
  - Fitur **Cetak PDF Ringkasan Medis**.

### 6. 🤖 Triase Klinis & Chatbot Asisten AI
Ditenagai model **Gemini 2.5 Flash** melalui OrcaRouter. AI menganalisis rekaman suara daerah/tidak jelas, mengekstraksi gejala spesifik, menentukan derajat keparahan secara obyektif, dan melayani konsultasi tanya-jawab keluarga seputar kondisi lansia.

---

## 👥 Tiga Peran Pengguna

| Peran | Perangkat | Hak Akses & Fitur | Cara Masuk |
|---|---|---|---|
| **Admin** | Web Desktop / Ponsel | Mengelola keluarga, menambah/menghapus lansia, mengundang anggota, memutus HP hilang, melihat seluruh riwayat & analitik. | `/daftar` |
| **Lansia** | Ponsel (PWA) | 3 tombol utama (Aman, Keluhan, Darurat), tombol kejang, deteksi getar, pengingat obat, pengaturan ukuran font. | `/hubungkan?kode=...` |
| **Pemantau** | Web Desktop / Ponsel | Melihat status real-time, mendengarkan rekaman suara, peta lokasi GPS, ekspor CSV, dan konsultasi AI. | `/gabung` |

---

## 🚀 Uji Coba Cepat (Mode Demo 1-Klik)

Untuk presentasi juri atau evaluasi tanpa perlu setup dua HP:

```bash
# Jalankan aplikasi, lalu buka:
http://localhost:3000/demo
```

Layar split-screen otomatis terbuka:
- **Kiri**: Simulasi HP Nenek (Oma Siti).
- **Kanan**: Dashboard Keluarga Real-Time (Tamu Demo).
- **Atas**: Tombol simulasi instan (`⚡ Simulasikan Kejang` dan `💥 Simulasikan Jatuh`).

> Baca selengkapnya di [**docs/PANDUAN_JURI.md**](docs/PANDUAN_JURI.md) untuk panduan penilaian lengkap.

---

## 💻 Panduan Instalasi Lokal

### 1. Prasyarat
- Node.js versi `>= 20.9.0`
- Akun PostgreSQL (direkomendasikan [Supabase](https://supabase.com/))
- API Key [OrcaRouter](https://orcarouter.ai/)

### 2. Langkah Instalasi

```bash
# 1. Clone repositori
git clone https://github.com/Nazca13/himtec-01.git
cd himtec-01

# 2. Install dependensi
npm install

# 3. Konfigurasi Environment Variables
cp .env.example .env
# Edit file .env dan masukkan DATABASE_URL, DIRECT_URL, ORCA_API_KEY, dan SESSION_SECRET

# 4. Sinkronkan Skema Database
npm run db:push

# 5. Jalankan Server Pengembangan
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser Anda.

---

## 📁 Struktur Folder Proyek

```
himtec-01/
├── docs/                     # Dokumentasi komprehensif
│   ├── PANDUAN_JURI.md       # Panduan pengujian fitur untuk dewan juri
│   ├── ARSITEKTUR.md         # Diagram arsitektur teknis & database ERD
│   ├── PRD.txt               # Product Requirements Document
│   └── supabase.md           # Panduan konfigurasi Supabase & RLS
├── prisma/                   # Skema database & migrasi
│   ├── schema.prisma         # Definisi model Prisma ORM
│   └── setup.sql             # Skrip SQL indeks, constraints, dan RLS
├── public/                   # Aset PWA (icons, sw.js, manifest, offline.html)
└── src/
    ├── app/                  # Next.js 16 App Router (halaman & API routes)
    │   ├── api/              # 16 Endpoint RESTful API
    │   ├── demo/layar/       # Mode demo split-screen untuk presentasi
    │   ├── lansia/           # Tampilan aplikasi orang tua (PWA)
    │   └── pengawas/         # Dashboard monitoring keluarga (5 tab)
    ├── components/           # Komponen UI global (AudioPlayer, Mascot, Badge)
    ├── features/             # Modul fungsional per peran (lansia, pengawas, masuk)
    ├── hooks/                # Custom React hooks (useRecorder, useDeteksiGerak)
    ├── lib/                  # Server utilities (auth, session HMAC, deteksi, geo)
    ├── services/             # Lapisan logika bisnis (record, triage, household, demo)
    └── proxy.js              # Middleware kontrol akses & navigasi sesi
```

---

## 📡 Daftar Endpoint API Utama

| Method | Endpoint | Fungsi |
|---|---|---|
| `POST` | `/api/auth/daftar` | Registrasi admin dan pembentukan keluarga baru |
| `POST` | `/api/auth/gabung` | Masuk keluarga sebagai pemantau via kode undangan |
| `POST` | `/api/auth/hubungkan`| Menghubungkan HP orang tua via kode pairing |
| `POST` | `/api/auth/keluar` | Menghapus cookie sesi (spesifik lansia atau pengawas) |
| `GET` | `/api/dashboard` | Polling data kondisi keluarga, lansia, dan riwayat |
| `POST` | `/api/ai` | Penerimaan rekaman audio WAV + triase AI multimodal |
| `GET` | `/api/audio/[id]` | Streaming file audio WAV rekaman suara lansia |
| `POST` | `/api/record` | Pencatatan status tombol aman, darurat, keluhan, obat |
| `GET` | `/api/saya` | Memuat data profil lansia, streak harian, dan absensi |
| `POST` | `/api/assistant` | Chat interaktif dengan AI asisten keluarga |

---

## 📄 Lisensi & Hak Cipta
Hak Cipta © 2026 **Tim Pengembang SAPA**. Seluruh hak cipta dilindungi undang-undang.
*Mendedikasikan teknologi untuk keselamatan dan ketenangan keluarga Indonesia.* 🇮🇩
