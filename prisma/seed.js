// Data demo untuk pitching: "Keluarga Demo" dengan Oma Siti (kode HP DEMO72) dan Opa Joko (DEMO73),
// kode undangan DEMOKLG7, admin "Tamu demo". Hanya data keluarga demo yang direset; keluarga lain tidak tersentuh.
// Jalankan: npm run db:seed   (sama dengan membuka /demo?reset=1 di app)
const { PrismaClient } = require('@prisma/client');

const db = new PrismaClient();
const H = 60 * 60 * 1000;
const ago = (jam) => new Date(Date.now() - jam * H);
const DEMO = { nama: 'Keluarga Demo', kodeUndangan: 'DEMOKLG7', admin: 'Tamu demo', lansia: [{ nama: 'Oma Siti', kodePairing: 'DEMO72' }, { nama: 'Opa Joko', kodePairing: 'DEMO73' }] };

async function main() {
  await db.$transaction(async (tx) => {
    const household = (await tx.household.findUnique({ where: { kodeUndangan: DEMO.kodeUndangan } })) ?? (await tx.household.create({ data: { nama: DEMO.nama, kodeUndangan: DEMO.kodeUndangan } }));
    const householdId = household.id;
    const ids = [];
    for (const l of DEMO.lansia) {
      const ada = await tx.lansia.findFirst({ where: { householdId, nama: l.nama } });
      const row = ada ? await tx.lansia.update({ where: { id: ada.id }, data: { kodePairing: l.kodePairing, terhubungAt: new Date() } }) : await tx.lansia.create({ data: { householdId, ...l, terhubungAt: new Date() } });
      ids.push(row.id);
    }
    const admin = (await tx.member.findFirst({ where: { householdId, nama: DEMO.admin } })) ?? (await tx.member.create({ data: { householdId, nama: DEMO.admin, role: 'ADMIN' } }));
    await tx.household.update({ where: { id: householdId }, data: { nama: DEMO.nama } });
    await tx.lansia.deleteMany({ where: { householdId, id: { notIn: ids } } });
    await tx.member.deleteMany({ where: { householdId, id: { not: admin.id } } });
    await tx.member.update({ where: { id: admin.id }, data: { role: 'ADMIN' } });
    await tx.dailyRecord.deleteMany({ where: { lansiaId: { in: ids } } });
    const [oma, opa] = ids;
    // Koordinat contoh: rumah Oma di Jakarta Selatan, rumah Opa di Depok.
  const RUMAH = { [oma]: [-6.2615, 106.781], [opa]: [-6.3925, 106.8227] };
  const lok = (lansiaId) => ({ latitude: RUMAH[lansiaId][0] + (Math.random() - 0.5) * 0.0004, longitude: RUMAH[lansiaId][1] + (Math.random() - 0.5) * 0.0004, akurasiMeter: 18 });
  const aman = (lansiaId, jam) => ({ lansiaId, tipeInput: 'TOMBOL_AMAN', statusBahaya: 'HIJAU', createdAt: ago(jam), ...lok(lansiaId) });
    const suara = (lansiaId, jam, transkrip, gejala, ringkasan) => ({ lansiaId, tipeInput: 'VOICE_NOTE', statusBahaya: 'KUNING', createdAt: ago(jam), aiAnalysis: { transkrip, gejala, ringkasan }, ...lok(lansiaId) });
    await tx.dailyRecord.createMany({
      data: [
        aman(oma, 80),
        suara(oma, 55, 'Lutut saya sakit kalau jalan, obatnya habis.', ['nyeri lutut', 'obat habis'], 'Nyeri lutut saat berjalan dan obat habis. Perlu dibelikan obat.'),
        aman(oma, 31),
        aman(opa, 76),
        aman(opa, 52),
        suara(opa, 27, 'Semalam susah tidur, kepala agak pusing.', ['susah tidur', 'pusing'], 'Susah tidur semalam dan sedikit pusing.'),
      ],
    });
  }, { timeout: 30_000, maxWait: 10_000 }); // database jarak jauh: batas default 5 detik terlalu ketat
  console.log(`Seed selesai: ${DEMO.nama} | kode undangan ${DEMO.kodeUndangan} | HP Oma Siti ${DEMO.lansia[0].kodePairing} | HP Opa Joko ${DEMO.lansia[1].kodePairing}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
