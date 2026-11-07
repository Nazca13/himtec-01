import { db } from '@/lib/db';
import { generateCode, KODE_KELUARGA_LEN, KODE_LANSIA_LEN } from '@/lib/codes';

// Kode unik: tabrakan nyaris mustahil (31^6), tetapi tetap diulang agar aman.
async function denganKodeUnik(buat) {
  for (let i = 0; i < 5; i++) {
    try {
      return await buat();
    } catch (err) {
      if (err.code !== 'P2002') throw err; // bukan tabrakan kode
    }
  }
  throw new Error('Gagal membuat kode unik');
}

// Pendaftaran pengurus: keluarga + admin + orang tua pertama, dalam satu transaksi.
export const daftarKeluarga = ({ namaAdmin, namaLansia }) =>
  denganKodeUnik(() =>
    db.$transaction(async (tx) => {
      const household = await tx.household.create({ data: { nama: `Keluarga ${namaAdmin}`, kodeUndangan: generateCode(KODE_KELUARGA_LEN) } });
      const member = await tx.member.create({ data: { householdId: household.id, nama: namaAdmin, role: 'ADMIN' } });
      const lansia = await tx.lansia.create({ data: { householdId: household.id, nama: namaLansia, kodePairing: generateCode(KODE_LANSIA_LEN) } });
      return { household, member, lansia };
    }, { timeout: 15_000, maxWait: 10_000 })
  );

export async function gabungKeluarga({ kode, nama }) {
  const household = await db.household.findUnique({ where: { kodeUndangan: kode } });
  if (!household) return null;
  const member = await db.member.create({ data: { householdId: household.id, nama, role: 'PEMANTAU' } });
  return { household, member };
}

// --- Lansia ---

export const tambahLansia = (householdId, nama) =>
  denganKodeUnik(() => db.lansia.create({ data: { householdId, nama, kodePairing: generateCode(KODE_LANSIA_LEN) } }));

export const findLansiaByKode = (kode) => db.lansia.findUnique({ where: { kodePairing: kode } });

export const tandaiTerhubung = (id) => db.lansia.update({ where: { id }, data: { terhubungAt: new Date() } });

// HP hilang/diganti: kode baru + versi naik, sesi HP lama langsung ditolak.
export const putusLansia = (id) =>
  denganKodeUnik(() =>
    db.lansia.update({ where: { id }, data: { kodePairing: generateCode(KODE_LANSIA_LEN), deviceVersion: { increment: 1 }, terhubungAt: null } })
  );

export const hapusLansia = (id) => db.lansia.delete({ where: { id } });

// Lansia milik keluarga ini; null jika id bukan milik keluarga (mencegah akses lintas keluarga).
export const lansiaMilik = (householdId, id) => (id ? db.lansia.findFirst({ where: { id, householdId } }) : null);

// --- Anggota ---

export const anggotaMilik = (householdId, id) => db.member.findFirst({ where: { id, householdId } });

export class AturanError extends Error {} // pelanggaran aturan peran (400)

// Keluarga harus selalu punya minimal satu admin.
async function pastikanAdminTersisa(householdId, kecualiId) {
  const sisa = await db.member.count({ where: { householdId, role: 'ADMIN', id: { not: kecualiId } } });
  if (!sisa) throw new AturanError('Keluarga harus punya minimal satu admin. Jadikan anggota lain admin dulu.');
}

export async function ubahPeran(member, role) {
  if (member.role === 'ADMIN' && role !== 'ADMIN') await pastikanAdminTersisa(member.householdId, member.id);
  return db.member.update({ where: { id: member.id }, data: { role } });
}

export async function keluarkanAnggota(member) {
  if (member.role === 'ADMIN') await pastikanAdminTersisa(member.householdId, member.id);
  return db.member.delete({ where: { id: member.id } });
}

// Data dashboard: daftar lansia (+ kabar terakhir) dan anggota keluarga.
export async function ringkasKeluarga(householdId) {
  const [lansia, members] = await Promise.all([
    db.lansia.findMany({
      where: { householdId },
      orderBy: { createdAt: 'asc' },
      include: { records: { orderBy: { createdAt: 'desc' }, take: 1, select: { statusBahaya: true, createdAt: true } } },
    }),
    db.member.findMany({ where: { householdId }, orderBy: { createdAt: 'asc' } }),
  ]);
  return { lansia, members };
}
