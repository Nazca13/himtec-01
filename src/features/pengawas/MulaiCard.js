import Link from 'next/link';
import { PiCheckCircleFill, PiCircleBold } from 'react-icons/pi';
import Mascot from '@/components/ui/Mascot';
import styles from './MulaiCard.module.css';

// Pengganti dashboard saat belum ada kabar sama sekali: satu kartu berisi langkah awal,
// bukan lima kartu kosong. Hilang sendiri begitu kabar pertama masuk.
export default function MulaiCard({ lansia, isAdmin }) {
  const terhubung = Boolean(lansia.terhubungAt);
  const langkah = [
    {
      selesai: terhubung,
      judul: `Hubungkan HP ${lansia.nama}`,
      isi: terhubung
        ? 'HP sudah terhubung.'
        : isAdmin
          ? 'Kirim kode HP lewat WhatsApp, lalu buka link itu di HP-nya dan tekan "Hubungkan HP ini".'
          : 'Minta admin keluarga mengirim kode HP ke HP-nya.',
      aksi: !terhubung && isAdmin ? { href: '/pengawas/keluarga', label: 'Kirim kode HP' } : null,
    },
    {
      selesai: false,
      judul: 'Coba tombol pertama',
      isi: `Minta ${lansia.nama} menekan "Saya Aman". Kabarnya muncul di sini dalam beberapa detik.`,
    },
  ];

  return (
    <section className={styles.card} aria-labelledby="mulai">
      <Mascot size={84} />
      <h2 id="mulai">Belum ada kabar dari {lansia.nama}</h2>
      <p className={styles.sub}>Dua langkah lagi, lalu status, ringkasan AI, lokasi, dan riwayat muncul di sini.</p>
      <ol className={styles.steps}>
        {langkah.map((l) => (
          <li key={l.judul}>
            {l.selesai ? <PiCheckCircleFill className={styles.done} aria-hidden="true" /> : <PiCircleBold className={styles.todo} aria-hidden="true" />}
            <span>
              <strong>{l.judul}</strong>
              <span>{l.isi}</span>
              {l.aksi && (
                <Link href={l.aksi.href} className={styles.action}>
                  {l.aksi.label}
                </Link>
              )}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
