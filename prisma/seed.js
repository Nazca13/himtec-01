// Data demo untuk pitching: membuat grup demo "Oma Siti" (kode lansia DEMO72, kode keluarga DEMOKLG7)
// dan mengisi ulang log-nya. Hanya log grup demo yang dihapus; grup lain tidak tersentuh.
// Jalankan: npm run db:seed   (atau buka /demo?reset=1 di app)
const { PrismaClient } = require('@prisma/client');

const db = new PrismaClient();
const H = 60 * 60 * 1000;
const ago = (jam) => new Date(Date.now() - jam * H);
const DEMO = { namaLansia: 'Oma Siti', kodeLansia: 'DEMO72', kodeKeluarga: 'DEMOKLG7' };

async function main() {
  const household =
    (await db.household.findUnique({ where: { kodeLansia: DEMO.kodeLansia } })) ??
    (await db.household.create({ data: { ...DEMO, lansiaTerhubungAt: new Date() } }));

  await db.dailyRecord.deleteMany({ where: { householdId: household.id } });
  const aman = (jam) => ({ householdId: household.id, tipeInput: 'TOMBOL_AMAN', statusBahaya: 'HIJAU', createdAt: ago(jam) });
  await db.dailyRecord.createMany({
    data: [
      aman(80),
      {
        householdId: household.id,
        tipeInput: 'VOICE_NOTE',
        statusBahaya: 'KUNING',
        createdAt: ago(55),
        aiAnalysis: { transkrip: 'Lutut saya sakit kalau jalan, obatnya habis.', gejala: ['nyeri lutut', 'obat habis'], ringkasan: 'Nyeri lutut saat berjalan dan obat habis. Perlu dibelikan obat.' },
      },
      aman(31),
    ],
  });
  console.log(`Seed selesai. Grup demo: ${DEMO.namaLansia} | kode lansia ${DEMO.kodeLansia} | kode keluarga ${DEMO.kodeKeluarga}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
