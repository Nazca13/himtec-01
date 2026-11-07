import { db } from '@/lib/db';

// Keluarga demo publik untuk juri/presentasi: data palsu, kode tetap. Pengunjung /demo masuk sebagai admin tamu.
// Logika yang sama ada di prisma/seed.js (skrip CommonJS tanpa alias @/).
export const DEMO = {
  nama: 'Keluarga Demo',
  kodeUndangan: 'DEMOKLG7',
  admin: 'Tamu demo',
  lansia: [
    { nama: 'Oma Siti', kodePairing: 'DEMO72' },
    { nama: 'Opa Joko', kodePairing: 'DEMO73' },
  ],
};
const H = 60 * 60 * 1000;
// Banyak query ke database jarak jauh (±300 ms/query): batas default Prisma 5 detik terlalu ketat.
const TX_LAMA = { timeout: 30_000, maxWait: 10_000 };
const ago = (jam) => new Date(Date.now() - jam * H);

// Satu kabar per hari beberapa hari terakhir, tanpa kabar hari ini: demo menunjukkan streak naik saat tombol ditekan.
function dataAwal(oma, opa) {
  // Koordinat contoh: rumah Oma di Jakarta Selatan, rumah Opa di Depok.
  const RUMAH = { [oma]: [-6.2615, 106.781], [opa]: [-6.3925, 106.8227] };
  const lok = (lansiaId) => ({ latitude: RUMAH[lansiaId][0] + (Math.random() - 0.5) * 0.0004, longitude: RUMAH[lansiaId][1] + (Math.random() - 0.5) * 0.0004, akurasiMeter: 18 });
  const aman = (lansiaId, jam) => ({ lansiaId, tipeInput: 'TOMBOL_AMAN', statusBahaya: 'HIJAU', createdAt: ago(jam), ...lok(lansiaId) });
  const suara = (lansiaId, jam, transkrip, gejala, ringkasan) => ({ lansiaId, tipeInput: 'VOICE_NOTE', statusBahaya: 'KUNING', createdAt: ago(jam), aiAnalysis: { transkrip, gejala, ringkasan }, ...lok(lansiaId) });
  return [
    aman(oma, 80),
    suara(oma, 55, 'Lutut saya sakit kalau jalan, obatnya habis.', ['nyeri lutut', 'obat habis'], 'Nyeri lutut saat berjalan dan obat habis. Perlu dibelikan obat.'),
    aman(oma, 31),
    aman(opa, 76),
    aman(opa, 52),
    suara(opa, 27, 'Semalam susah tidur, kepala agak pusing.', ['susah tidur', 'pusing'], 'Susah tidur semalam dan sedikit pusing.'),
  ];
}

// Pastikan keluarga demo lengkap. reset = kembalikan ke keadaan awal (hanya data keluarga demo yang disentuh).
export async function ensureDemo({ reset = false } = {}) {
  return db.$transaction(async (tx) => {
    const household =
      (await tx.household.findUnique({ where: { kodeUndangan: DEMO.kodeUndangan } })) ??
      (await tx.household.create({ data: { nama: DEMO.nama, kodeUndangan: DEMO.kodeUndangan } }));
    const householdId = household.id;

    const lansia = [];
    for (const l of DEMO.lansia) {
      const ada = await tx.lansia.findFirst({ where: { householdId, nama: l.nama } });
      lansia.push(
        ada
          ? reset
            ? await tx.lansia.update({ where: { id: ada.id }, data: { kodePairing: l.kodePairing, terhubungAt: new Date() } })
            : ada
          : await tx.lansia.create({ data: { householdId, ...l, terhubungAt: new Date() } })
      );
    }
    const [oma, opa] = lansia;

    let admin = await tx.member.findFirst({ where: { householdId, nama: DEMO.admin } });
    admin ??= await tx.member.create({ data: { householdId, nama: DEMO.admin, role: 'ADMIN' } });

    const ids = lansia.map((l) => l.id);
    if (reset) {
      await tx.household.update({ where: { id: householdId }, data: { nama: DEMO.nama } });
      await tx.lansia.deleteMany({ where: { householdId, id: { notIn: ids } } });
      await tx.member.deleteMany({ where: { householdId, id: { not: admin.id } } });
      admin = await tx.member.update({ where: { id: admin.id }, data: { role: 'ADMIN' } });
      await tx.dailyRecord.deleteMany({ where: { lansiaId: { in: ids } } });
    }
    if (reset || (await tx.dailyRecord.count({ where: { lansiaId: { in: ids } } })) === 0) {
      await tx.dailyRecord.createMany({ data: dataAwal(oma.id, opa.id) });
    }
    return { household, admin, lansia: oma };
  }, TX_LAMA);
}
