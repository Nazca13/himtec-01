import { db } from '@/lib/db';
import { STATUS, TIPE_INPUT } from '@/lib/constants';

const TIPE_VALID = new Set(Object.values(TIPE_INPUT));
const STATUS_VALID = new Set(Object.values(STATUS));

export class ValidationError extends Error {}

export async function createRecord({ tipeInput, statusBahaya, aiAnalysis }) {
  if (!TIPE_VALID.has(tipeInput)) throw new ValidationError('tipeInput tidak valid');
  if (!STATUS_VALID.has(statusBahaya)) throw new ValidationError('statusBahaya tidak valid');

  return db.dailyRecord.create({
    data: { tipeInput, statusBahaya, aiAnalysis: aiAnalysis ?? undefined },
  });
}

export function listRecords({ limit = 50, since } = {}) {
  return db.dailyRecord.findMany({
    where: since ? { createdAt: { gte: since } } : undefined,
    orderBy: { createdAt: 'desc' },
    take: Math.min(limit, 200),
  });
}
