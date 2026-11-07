import { db } from '@/lib/db';

// Grup demo publik untuk juri/presentasi: data palsu, kode tetap.
export const DEMO = { namaLansia: 'Oma Siti', kodeLansia: 'DEMO72', kodeKeluarga: 'DEMOKLG7' };
const H = 60 * 60 * 1000;

function dataAwal(householdId) {
  const ago = (jam) => new Date(Date.now() - jam * H);
  const aman = (jam) => ({ householdId, tipeInput: 'TOMBOL_AMAN', statusBahaya: 'HIJAU', createdAt: ago(jam) });
  // Satu kabar per hari 3 hari terakhir, tanpa kabar hari ini: demo menunjukkan streak naik saat tombol ditekan.
  return [
    aman(80),
    {
      householdId,
      tipeInput: 'VOICE_NOTE',
      statusBahaya: 'KUNING',
      createdAt: ago(55),
      aiAnalysis: { transkrip: 'Lutut saya sakit kalau jalan, obatnya habis.', gejala: ['nyeri lutut', 'obat habis'], ringkasan: 'Nyeri lutut saat berjalan dan obat habis. Perlu dibelikan obat.' },
    },
    aman(31),
  ];
}

// Pastikan grup demo ada. reset = hapus log grup demo SAJA lalu isi ulang (tidak menyentuh grup lain).
export async function ensureDemo({ reset = false } = {}) {
  const household = (await db.household.findUnique({ where: { kodeLansia: DEMO.kodeLansia } })) ?? (await db.household.create({ data: { ...DEMO, lansiaTerhubungAt: new Date() } }));
  if (reset) await db.dailyRecord.deleteMany({ where: { householdId: household.id } });
  if (reset || (await db.dailyRecord.count({ where: { householdId: household.id } })) === 0) {
    await db.dailyRecord.createMany({ data: dataAwal(household.id) });
  }
  return household;
}
