# 🏛️ Arsitektur Teknis — SAPA (Sistem Asisten Pantau Aktif)

Dokumen ini menjelaskan rancangan sistem, model data, alur pemrosesan AI, dan strategi keamanan pada aplikasi **SAPA**.

---

## 1. Diagram Alur Sistem (System Flowchart)

```mermaid
flowchart TD
    subgraph Klien_Lansia ["📱 Aplikasi PWA Lansia (HP Senior)"]
        L1["Tombol Saya Aman (Hijau)"]
        L2["Perekam Suara WAV + useRecorder"]
        L3["Pilihan 9 Gambar Keluhan"]
        L4["Tombol Darurat Kejang & Sensor Getar"]
        L5["Absensi Laporan Harian & Obat"]
    end

    subgraph API_Gateway ["⚡ Next.js 16 API Routes (bom1 Mumbai)"]
        A1["/api/ai (Multimodal Voice Triage)"]
        A2["/api/record (Pencatatan Status Harian)"]
        A3["/api/audio/[id] (Audio Streaming Provider)"]
        A4["/api/dashboard (Polling Data Realtime)"]
        A5["/api/assistant (Konsultasi Chat AI)"]
    end

    subgraph Layanan_AI ["🧠 OrcaRouter (Gemini 2.5 Flash)"]
        AI1["Audio Speech-to-Text & Clinical Triage"]
        AI2["Analisis Bahaya (HIJAU/KUNING/MERAH)"]
        AI3["Ekstraksi Gejala Medis & Ringkasan"]
    end

    subgraph Penyimpanan ["🗄️ Database PostgreSQL (Supabase ap-south-1)"]
        DB1["Households (Keluarga)"]
        DB2["Members (Admin & Pemantau)"]
        DB3["Lansia (Perangkat Terhubung)"]
        DB4["DailyRecords (Log Status & Audio Base64)"]
    end

    subgraph Dashboard_Pengawas ["🖥️ Dashboard Keluarga / Petugas"]
        D1["Kartu Status Real-Time + Sirine Alarm"]
        D2["Pemutar Suara Nenek (AudioPlayer)"]
        D3["Panduan Pertolongan Pertama (119/112)"]
        D4["Peta Lokasi GPS Terakhir"]
        D5["Ekspor Laporan CSV & Pengaturan"]
    end

    L1 & L3 & L4 & L5 -->|Kirim Status| A2
    L2 -->|Kirim Audio WAV + Geo| A1
    A1 -->|Audio Prompt| Layanan_AI
    Layanan_AI -->|Hasil JSON Triage| A1
    A1 -->|Simpan Record + Raw Audio| DB4
    A2 -->|Simpan Status| DB4
    D4 & D1 & D3 & D5 <-->|Polling 3-5s| A4
    A4 <--> DB4 & DB3 & DB2 & DB1
    D2 -->|Stream Audio WAV| A3
    A3 <--> DB4
```

---

## 2. Struktur Model Database (Entity Relationship)

Aplikasi menggunakan **Prisma 6** dengan target **PostgreSQL (Supabase)**. Seluruh relasi menerapkan `onDelete: Cascade` agar penghapusan data bersih tanpa *orphaned records*.

```mermaid
erDiagram
    Household ||--o{ Member : "memiliki anggota"
    Household ||--o{ Lansia : "memantau orang tua"
    Lansia ||--o{ DailyRecord : "mencatat aktivitas"

    Household {
        uuid id PK
        varchar nama "Nama keluarga mis. Keluarga Budi"
        varchar kodeUndangan UK "Kode 8 huruf untuk pemantau"
        timestamptz createdAt
    }

    Member {
        uuid id PK
        uuid householdId FK
        varchar nama "Nama anggota"
        varchar role "ADMIN atau PEMANTAU"
        timestamptz createdAt
    }

    Lansia {
        uuid id PK
        uuid householdId FK
        varchar nama "Nama orang tua"
        varchar kodePairing UK "Kode 6 huruf untuk HP lansia"
        int deviceVersion "Versi sesi (naik saat diputus)"
        timestamptz terhubungAt
        timestamptz createdAt
    }

    DailyRecord {
        uuid id PK
        uuid lansiaId FK
        varchar tipeInput "TOMBOL_AMAN | VOICE_NOTE | KELUHAN | DETEKSI_OTOMATIS"
        varchar statusBahaya "HIJAU | KUNING | MERAH"
        text rawData "Audio WAV rekaman suara (Base64)"
        jsonb aiAnalysis "transkrip, gejala, ringkasan, dll"
        float latitude "Koordinat GPS"
        float longitude "Koordinat GPS"
        real akurasiMeter
        timestamptz createdAt
    }
```

---

## 3. Alur Pemrosesan Suara & Voice Triage (`/api/ai`)

1. **Perekaman di Klien (`useRecorder.js`)**:
   - Merekam suara melalui `MediaRecorder` API.
   - Menggunakan `OfflineAudioContext` untuk mengonversi format browser (WebM/MP4) menjadi **WAV Mono 16 kHz** standar (~32 KB/detik).
2. **Pengiriman & Penyimpanan**:
   - Audio dikirim ke server dalam bentuk Base64 string via `POST /api/ai`.
   - String Base64 audio disimpan di kolom `DailyRecord.rawData` sehingga keluarga dapat memutar ulang suara asli nenek kapan saja.
3. **Analisis AI Multimodal (`triage.service.js`)**:
   - Dikirim ke model `gemini-2.5-flash` lewat OrcaRouter.
   - Prompt sistem bertindak sebagai perawat triase geriatri:
     - **MERAH**: Gejala serangan jantung, sesak, jatuh, pingsan, bicara pelo, kejang.
     - **KUNING**: Nyeri, demam, mual, obat habis, susah tidur, kesepian.
     - **HIJAU**: Konfirmasi kondisi sehat/aman.
   - Menghasilkan respon JSON: `transkrip`, `gejala`, `statusBahaya`, `ringkasan`.
4. **Fallback Resilience**:
   - Jika OrcaRouter tidak merespons atau terjadi batas kuota/timeout, sistem secara otomatis mengembalikan status aman cadangan (**KUNING**) dengan pesan agar keluarga segera menelepon langsung. Tidak ada pesan lansia yang hilang.

---

## 4. Keamanan & Autentikasi Tanpa Kata Sandi

- Menggunakan **Signed Session Cookies** (`sapa-pengawas` dan `sapa-lansia`) berbasis **HMAC-SHA256 (Web Crypto API)**.
- `httpOnly: true`, `sameSite: 'lax'`, `secure: true` pada HTTPS.
- Masa berlaku sesi 1 tahun untuk memastikan HP orang tua tetap terhubung tanpa perlu berulang kali login.
- **In-flight Device Versioning**: Jika admin menekan "Putuskan HP", kolom `deviceVersion` pada baris Lansia dinaikkan (+1). Sesi cookie lama pada HP yang hilang/diganti otomatis ditolak seketika pada request berikutnya.
- **Row-Level Security (RLS)** diaktifkan pada semua tabel database Supabase untuk memblokir akses langsung di luar Prisma ORM server.
