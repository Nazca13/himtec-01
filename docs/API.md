# Referensi API

Semua endpoint ada di `src/app/api/*/route.js`, memakai JSON, dan mengembalikan `{ "error": "pesan" }` saat gagal. Pesan galat ditulis dalam bahasa Indonesia untuk ditampilkan langsung ke pengguna.

## Autentikasi

Dua cookie `httpOnly`, `SameSite=Lax`, `Secure` di HTTPS, berlaku 1 tahun, bertanda tangan HMAC-SHA256:

| Cookie | Pemilik | Isi |
|---|---|---|
| `sapa-pengawas` | Admin dan pemantau | id anggota |
| `sapa-lansia` | HP orang tua | id orang tua + versi perangkat |

Kolom "Akses" di bawah:

- **Publik**: tanpa cookie.
- **Anggota**: cookie `sapa-pengawas` (admin atau pemantau).
- **Admin**: cookie `sapa-pengawas` dengan peran ADMIN.
- **Lansia**: cookie `sapa-lansia` yang masih berlaku (versi perangkat cocok).

## Kode status umum

| Kode | Arti |
|---|---|
| 400 | Input tidak valid atau melanggar aturan (mis. mencabut admin terakhir) |
| 401 | Tidak ada sesi, atau sesi tidak berlaku (HP diputus) |
| 403 | Peran tidak cukup |
| 404 | Tidak ditemukan, atau milik keluarga lain (tidak dibedakan) |
| 429 | Batas laju terlampaui |
| 500 | Galat server; pesan umum, detail hanya di log |
| 503 | `/api/health`: database tidak terjangkau |

## Endpoint

### Masuk dan keluar

| Metode dan jalur | Akses | Batas laju | Fungsi |
|---|---|---|---|
| `POST /api/auth/daftar` | Publik | 10/jam/IP | Buat keluarga, admin, dan orang tua pertama |
| `POST /api/auth/gabung` | Publik | 10/menit/IP | Gabung sebagai pemantau dengan kode undangan |
| `POST /api/auth/hubungkan` | Publik | 10/menit/IP | Hubungkan HP orang tua dengan kode pairing |
| `POST /api/auth/keluar?role=lansia\|pengawas` | Publik | - | Hapus cookie; tanpa `role` menghapus keduanya |

`POST /api/auth/daftar`

```json
// request
{ "nama": "Budi", "hubungan": "Anak", "namaLansia": "Oma Siti", "kondisiLansia": "Diabetes", "namaKeluarga": "Keluarga Budi" }
// 201
{ "household": { "nama": "Keluarga Budi", "kodeUndangan": "K7M2Q9XA" }, "lansia": { "nama": "Oma Siti (Diabetes)", "kodePairing": "R4T8WN" } }
```

`nama` dan `namaLansia` wajib. `hubungan`, `kondisiLansia`, `namaKeluarga` opsional. Respons memasang cookie `sapa-pengawas`.

`POST /api/auth/gabung`: `{ "nama": "Rina", "kode": "K7M2Q9XA" }` menghasilkan `{ "keluarga": "Keluarga Budi" }` dan cookie `sapa-pengawas`. Kode dinormalkan (huruf besar, tanda hubung dan spasi dibuang). Kode salah: 404.

`POST /api/auth/hubungkan`: `{ "kode": "R4T8WN" }` menghasilkan `{ "namaLansia": "Oma Siti" }` dan cookie `sapa-lansia`.

### Aplikasi orang tua

| Metode dan jalur | Akses | Fungsi |
|---|---|---|
| `GET /api/saya` | Lansia | Nama, sudah memberi kabar hari ini, rangkaian hari, sapaan lokal. Tanpa sesi: `{ "role": null }` |
| `GET /api/saya/sapa` | Lansia | Pesan maskot dari AI (cadangan lokal bila AI gagal) |
| `POST /api/record` | Lansia | Kirim kabar non-suara |
| `POST /api/ai` | Lansia, 40/jam | Kirim pesan suara untuk triase AI |

`POST /api/record`

```json
{ "tipeInput": "TOMBOL_AMAN" }
{ "tipeInput": "TOMBOL_DARURAT" }
{ "tipeInput": "KELUHAN", "keluhan": ["PUSING", "MUAL"] }
{ "tipeInput": "DETEKSI_OTOMATIS", "sebab": "KEJANG" }
// semua boleh menyertakan lokasi (opsional, divalidasi server)
{ "lokasi": { "latitude": -6.26, "longitude": 106.78, "akurasi": 18 } }
// 201
{ "record": { "id": "uuid", "statusBahaya": "HIJAU", "tipeInput": "TOMBOL_AMAN", "aiAnalysis": null, "createdAt": "..." } }
```

Aturan status: `TOMBOL_AMAN` HIJAU; `TOMBOL_DARURAT` dan `DETEKSI_OTOMATIS` MERAH; `KELUHAN` MERAH bila ada yang gawat (nyeri dada, sesak, jatuh, kejang), HIJAU bila semuanya "sudah minum obat", selain itu KUNING. Keluhan harus 1 sampai 6 id dari daftar di `lib/keluhan.js`. Lokasi di luar rentang diabaikan; kabar tetap tersimpan.

`POST /api/ai`: `{ "audioBase64": "...", "mimeType": "audio/wav", "lokasi": {...} }` menghasilkan `{ "record": {...} }` berisi transkrip, gejala, dan status dari AI. Ukuran dibatasi.

### Dashboard keluarga

| Metode dan jalur | Akses | Fungsi |
|---|---|---|
| `GET /api/dashboard?lansia=<id>` | Anggota | Keluarga, daftar orang tua, anggota, 200 kabar terakhir, lokasi terakhir. Kode pairing dan undangan hanya untuk admin. Tanpa `lansia`, memakai orang tua pertama |
| `GET /api/ringkasan?lansia=<id>` | Anggota | Ringkasan AI dari 30 kabar terakhir |
| `POST /api/assistant` | Anggota, 60/jam | Tanya asisten AI: `{ "question": "...", "lansiaId": "..." }` |
| `GET /api/audio/[id]` | Anggota | Audio pesan suara (`audio/wav`, mendukung Range/206). 404 bila bukan milik keluarga ini |

### Pengelolaan keluarga (admin)

| Metode dan jalur | Akses | Fungsi |
|---|---|---|
| `POST /api/lansia` | Admin | Tambah orang tua: `{ "nama": "Opa Joko" }`, menghasilkan kode pairing |
| `DELETE /api/lansia/[id]` | Admin | Hapus orang tua beserta seluruh kabarnya (cascade) |
| `POST /api/lansia/[id]/putus` | Admin | Putuskan HP: naikkan versi perangkat dan terbitkan kode baru. Mengembalikan `{ "kodePairing" }` |
| `PATCH /api/anggota/[id]` | Admin | Ubah peran: `{ "role": "ADMIN" \| "PEMANTAU" }` |
| `DELETE /api/anggota/[id]` | Admin, atau diri sendiri | Keluarkan anggota, atau keluar sendiri |

Aturan: keluarga tidak boleh kehilangan admin terakhir (400). Pemantau boleh menghapus dirinya sendiri, tidak boleh menghapus orang lain (403).

### Operasional

| Metode dan jalur | Akses | Fungsi |
|---|---|---|
| `GET /api/health` | Publik | Pemeriksaan kesehatan untuk pemantau uptime |
| `GET /demo` | Publik, 30/menit/IP, hanya bila `demoAktif()` | Memasang sesi demo (admin dan HP Oma Siti), lalu mengalihkan ke `/demo/layar`. `?reset=1` mengembalikan data demo. 404 bila demo dimatikan |

`GET /api/health`

```json
{ "status": "ok", "database": { "ok": true, "ms": 42 }, "versi": "295ff74", "waktu": "2026-11-07T11:46:37.881Z" }
```

HTTP 200 bila sehat, 503 dengan `"status": "degraded"` bila database tidak menjawab dalam 3 detik. Tanpa data pengguna.

## Batas laju

Dihitung dalam memori per proses (lihat batasan di [KEAMANAN.md](KEAMANAN.md)).

| Kunci | Batas |
|---|---|
| `daftar:<ip>` | 10 per jam |
| `gabung:<ip>` | 10 per menit |
| `hubungkan:<ip>` | 10 per menit |
| `demo:<ip>` | 30 per menit |
| `ai:<lansiaId>` | 40 per jam |
| `asisten:<anggotaId>` | 60 per jam |
