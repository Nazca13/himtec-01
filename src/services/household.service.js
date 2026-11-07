import { db } from '@/lib/db';
import { generateCode, KODE_KELUARGA_LEN, KODE_LANSIA_LEN } from '@/lib/codes';

export const findByKodeLansia = (kode) => db.household.findUnique({ where: { kodeLansia: kode } });
export const findByKodeKeluarga = (kode) => db.household.findUnique({ where: { kodeKeluarga: kode } });
export const getHousehold = (id) => db.household.findUnique({ where: { id } });

export async function createHousehold(namaLansia) {
  // Tabrakan kode nyaris mustahil (31^6), tetapi tetap diulang agar aman.
  for (let i = 0; i < 5; i++) {
    try {
      return await db.household.create({
        data: { namaLansia, kodeLansia: generateCode(KODE_LANSIA_LEN), kodeKeluarga: generateCode(KODE_KELUARGA_LEN) },
      });
    } catch (err) {
      if (err.code !== 'P2002') throw err; // bukan tabrakan kode
    }
  }
  throw new Error('Gagal membuat kode unik');
}

export const markLansiaTerhubung = (id) => db.household.update({ where: { id }, data: { lansiaTerhubungAt: new Date() } });

// Memutus HP lansia: kode baru + versi naik, sehingga sesi HP lama langsung ditolak.
export const putusLansia = (id) =>
  db.household.update({
    where: { id },
    data: { kodeLansia: generateCode(KODE_LANSIA_LEN), lansiaVersion: { increment: 1 }, lansiaTerhubungAt: null },
  });
