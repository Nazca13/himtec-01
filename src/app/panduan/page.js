import Link from 'next/link';
import AuthLayout from '@/features/masuk/AuthLayout';
import styles from './panduan.module.css';

export const metadata = { title: 'Panduan' };

const PERAN = [
  {
    nama: 'Admin',
    siapa: 'Anak atau pengurus yang mendaftarkan keluarga.',
    perangkat: 'Web (laptop/HP), dashboard.',
    bisa: 'Semua yang bisa dilakukan pemantau, ditambah: menambah dan menghapus orang tua, membagikan kode HP dan kode undangan, memutus HP yang hilang, menjadikan anggota admin, mengeluarkan anggota.',
    masuk: 'Halaman depan, lalu "Daftarkan keluarga".',
  },
  {
    nama: 'Lansia',
    siapa: 'Orang tua yang dipantau (nenek atau kakek).',
    perangkat: 'Aplikasi di HP-nya sendiri (bisa di-install ke layar utama).',
    bisa: 'Menekan Saya Aman, Keluhan (bicara, atau ketuk gambar keluhan bagi yang sulit bicara), atau Darurat. Maskot menyapa dan menghitung hari berturut-turut.',
    masuk: 'Membuka link kode HP dari admin, lalu tekan "Peduli hari ini, untuk mereka nanti". Cukup sekali.',
  },
  {
    nama: 'Pemantau',
    siapa: 'Anggota keluarga lain (cucu, saudara).',
    perangkat: 'Web (laptop/HP), dashboard.',
    bisa: 'Melihat status, Ringkasan AI, grafik, dan riwayat setiap orang tua; bertanya ke Asisten AI. Tidak bisa mengubah pengaturan.',
    masuk: 'Halaman depan, lalu "Masuk dengan kode undangan" dari admin.',
  },
];

const ALUR = [
  ['Admin mendaftar', 'Buka halaman depan, pilih "Daftarkan keluarga", isi nama Anda dan nama orang tua. Anda langsung menjadi admin dan mendapat dua kode: kode HP (untuk orang tua) dan kode undangan (untuk keluarga lain).'],
  ['Hubungkan HP orang tua ("Peduli hari ini, untuk mereka nanti")', 'Tekan "Kirim lewat WhatsApp" pada kode HP. Di HP orang tua, buka link itu lalu tekan "Hubungkan HP ini". Setelah itu HP menampilkan tombol pantauan setiap kali dibuka. Agar seperti aplikasi, pilih "Tambahkan ke layar utama" di menu browser.'],
  ['Orang tua memberi kabar', 'Saya Aman (hijau), Keluhan (oranye: bicara dan AI merangkum, atau ketuk gambar seperti Pusing, Sesak napas, Jatuh), atau Darurat (merah). Keluhan berbahaya otomatis berstatus merah.'],
  ['Keluarga memantau', 'Dashboard menampilkan status terbaru, Ringkasan AI yang diperbarui otomatis, grafik 7 hari, riwayat, dan Asisten AI untuk bertanya. Kabar baru muncul dalam hitungan detik.'],
  ['Admin mengundang keluarga lain', 'Di menu Keluarga, kirim kode undangan. Penerima memilih "Masuk dengan kode undangan" dan menjadi pemantau. Admin bisa menjadikannya admin kapan saja.'],
];

const TANYA = [
  ['Bagaimana membuka dashboard di perangkat lain?', 'Pilih "Masuk dengan kode undangan" di perangkat baru. Anda masuk sebagai pemantau; minta admin (atau Anda sendiri dari perangkat lama) menekan "Jadikan admin" di menu Keluarga.'],
  ['Bagaimana memantau lebih dari satu orang tua?', 'Admin membuka menu Keluarga, lalu "Tambah orang tua". Setiap orang tua punya kode HP sendiri. Pilih namanya di bagian atas dashboard untuk berpindah.'],
  ['HP orang tua hilang atau diganti?', 'Admin membuka menu Keluarga, tekan "Putuskan HP". HP lama langsung tidak bisa mengirim kabar, dan kode baru dibuat untuk HP baru.'],
  ['Bagaimana mengeluarkan anggota keluarga?', 'Admin membuka menu Keluarga, lalu "Keluarkan" pada nama anggota. Perangkatnya langsung tidak bisa membuka dashboard. Keluarga selalu menyisakan minimal satu admin.'],
  ['Bagaimana jika orang tua tidak bisa bicara?', 'Tekan Keluhan, lalu ketuk gambar keluhannya (boleh lebih dari satu) dan tekan Kirim. Tidak perlu suara atau mengetik.'],
  ['Bagaimana jika orang tua kejang atau jatuh?', 'Orang tua atau orang di dekatnya menekan Darurat, atau Keluhan lalu ketuk "Baru kejang" atau "Jatuh". Keduanya langsung berstatus merah. Keluarga melihat langkah pertolongan pertama di dashboard beserta lokasi terakhir dan tombol telepon 119.'],
  ['Apakah data keluarga saya terlihat orang lain?', 'Tidak. Setiap keluarga hanya melihat datanya sendiri, dan semua akses diperiksa di server. Bagikan kode hanya ke keluarga.'],
  ['Ingin mencoba tanpa mendaftar?', 'Buka mode demo: satu layar berisi HP orang tua dan dashboard admin berdampingan, dengan data contoh.'],
];

export default function PanduanPage() {
  return (
    <AuthLayout title="Panduan SAPA" lead="Siapa melakukan apa, dan urutan memakainya dari awal.">
      <section className={styles.block} aria-labelledby="peran">
        <h2 id="peran">Tiga peran</h2>
        <div className={styles.roles}>
          {PERAN.map((p) => (
            <article key={p.nama} className={styles.role}>
              <h3>{p.nama}</h3>
              <dl>
                <dt>Siapa</dt>
                <dd>{p.siapa}</dd>
                <dt>Perangkat</dt>
                <dd>{p.perangkat}</dd>
                <dt>Bisa apa</dt>
                <dd>{p.bisa}</dd>
                <dt>Cara masuk</dt>
                <dd>{p.masuk}</dd>
              </dl>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.block} aria-labelledby="alur">
        <h2 id="alur">Alur dari awal</h2>
        <ol className={styles.steps}>
          {ALUR.map(([judul, isi]) => (
            <li key={judul}>
              <strong>{judul}</strong>
              <p>{isi}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className={styles.block} aria-labelledby="tanya">
        <h2 id="tanya">Pertanyaan umum</h2>
        {TANYA.map(([q, a]) => (
          <details key={q} className={styles.qa}>
            <summary>{q}</summary>
            <p>{a}</p>
          </details>
        ))}
      </section>

      <div className={styles.ctas}>
        <Link href="/daftar" className={styles.primary}>
          Daftarkan keluarga
        </Link>
        {/* <a>, bukan <Link>: /demo memasang cookie, tidak boleh di-prefetch */}
        <a href="/demo" className={styles.secondary}>
          Coba mode demo
        </a>
      </div>
    </AuthLayout>
  );
}
