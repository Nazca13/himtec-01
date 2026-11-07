// Data demo untuk pitching. Jalankan: node prisma/seed.js
// Menghapus semua DailyRecord lalu mengisi ulang 3 hari terakhir.
const { PrismaClient } = require('@prisma/client');

const db = new PrismaClient();
const H = 60 * 60 * 1000;
const ago = (hours) => new Date(Date.now() - hours * H);

const DATA = [
  { tipeInput: 'TOMBOL_AMAN', statusBahaya: 'HIJAU', createdAt: ago(60) },
  {
    tipeInput: 'VOICE_NOTE',
    statusBahaya: 'KUNING',
    createdAt: ago(50),
    aiAnalysis: {
      transkrip: 'Kepala saya agak pusing dari pagi, belum sarapan.',
      gejala: ['pusing', 'belum sarapan'],
      ringkasan: 'Lansia mengeluh pusing sejak pagi dan belum sarapan.',
    },
  },
  { tipeInput: 'TOMBOL_AMAN', statusBahaya: 'HIJAU', createdAt: ago(36) },
  {
    tipeInput: 'VOICE_NOTE',
    statusBahaya: 'KUNING',
    createdAt: ago(24),
    aiAnalysis: {
      transkrip: 'Lutut saya sakit kalau jalan, obatnya habis.',
      gejala: ['nyeri lutut', 'obat habis'],
      ringkasan: 'Nyeri lutut saat berjalan dan obat habis. Perlu dibelikan obat.',
    },
  },
  { tipeInput: 'TOMBOL_AMAN', statusBahaya: 'HIJAU', createdAt: ago(8) },
  { tipeInput: 'TOMBOL_AMAN', statusBahaya: 'HIJAU', createdAt: ago(1) },
];

async function main() {
  await db.dailyRecord.deleteMany();
  await db.dailyRecord.createMany({ data: DATA });
  console.log(`Seed selesai: ${DATA.length} record.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
