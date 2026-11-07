import { db } from '@/lib/db';
import { hariKey } from '@/lib/format';
import { STATUS, TIPE_INPUT } from '@/lib/constants';

const TIPE_VALID = new Set(Object.values(TIPE_INPUT));
const STATUS_VALID = new Set(Object.values(STATUS));

export class ValidationError extends Error {}

export async function createRecord({ lansiaId, tipeInput, statusBahaya, aiAnalysis, rawData, lokasi = {} }) {
  if (!lansiaId) throw new ValidationError('lansiaId wajib');
  if (!TIPE_VALID.has(tipeInput)) throw new ValidationError('tipeInput tidak valid');
  if (!STATUS_VALID.has(statusBahaya)) throw new ValidationError('statusBahaya tidak valid');

  return db.dailyRecord.create({
    data: { lansiaId, tipeInput, statusBahaya, aiAnalysis: aiAnalysis ?? undefined, rawData: rawData ?? undefined, ...lokasi },
  });
}

// lansiaId wajib: tidak ada query log yang boleh lintas lansia/keluarga.
export async function listRecords({ lansiaId, limit = 50, since }) {
  const rows = await db.dailyRecord.findMany({
    where: { lansiaId, ...(since && { createdAt: { gte: since } }) },
    orderBy: { createdAt: 'desc' },
    take: Math.min(limit, 200),
    select: {
      id: true,
      lansiaId: true,
      tipeInput: true,
      statusBahaya: true,
      aiAnalysis: true,
      latitude: true,
      longitude: true,
      akurasiMeter: true,
      createdAt: true,
      rawData: true,
    },
  });

  return rows.map(({ rawData, ...r }) => ({
    ...r,
    hasAudio: Boolean(rawData) || r.tipeInput === TIPE_INPUT.VOICE,
  }));
}

const HARI_MS = 24 * 60 * 60 * 1000;
const URUT_STATUS = { HIJAU: 0, KUNING: 1, MERAH: 2 };

// Ringkasan untuk HP lansia: sudah memberi kabar hari ini? berapa hari berturut-turut ada kabar?
// Hari dihitung menurut WIB. Streak tidak putus sampai hari ini berakhir tanpa kabar.
export async function ringkasanHarian(lansiaId) {
  const rows = await db.dailyRecord.findMany({
    where: { lansiaId, createdAt: { gte: new Date(Date.now() - 90 * HARI_MS) } },
    select: { createdAt: true, statusBahaya: true },
    orderBy: { createdAt: 'desc' },
  });
  const hari = new Set(rows.map((r) => hariKey(r.createdAt)));
  const hariIni = hariKey(new Date());
  const sudahHariIni = hari.has(hariIni);

  let streak = 0;
  for (let i = sudahHariIni ? 0 : 1; hari.has(hariKey(new Date(Date.now() - i * HARI_MS))); i++) streak++;

  const statusHariIni = rows
    .filter((r) => hariKey(r.createdAt) === hariIni)
    .reduce((worst, r) => (URUT_STATUS[r.statusBahaya] > URUT_STATUS[worst] ? r.statusBahaya : worst), 'HIJAU');

  return { sudahHariIni, streak, statusHariIni: sudahHariIni ? statusHariIni : null };
}

// Lokasi terakhir yang diketahui (kabar terbaru yang membawa koordinat).
export const lokasiTerakhir = (lansiaId) =>
  db.dailyRecord.findFirst({
    where: { lansiaId, latitude: { not: null } },
    orderBy: { createdAt: 'desc' },
    select: { latitude: true, longitude: true, akurasiMeter: true, createdAt: true, tipeInput: true },
  });
