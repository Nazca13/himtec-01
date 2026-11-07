import { db } from '@/lib/db';
import { STATUS, TIPE_INPUT } from '@/lib/constants';

const TIPE_VALID = new Set(Object.values(TIPE_INPUT));
const STATUS_VALID = new Set(Object.values(STATUS));

export class ValidationError extends Error {}

export async function createRecord({ householdId, tipeInput, statusBahaya, aiAnalysis }) {
  if (!householdId) throw new ValidationError('householdId wajib');
  if (!TIPE_VALID.has(tipeInput)) throw new ValidationError('tipeInput tidak valid');
  if (!STATUS_VALID.has(statusBahaya)) throw new ValidationError('statusBahaya tidak valid');

  return db.dailyRecord.create({
    data: { householdId, tipeInput, statusBahaya, aiAnalysis: aiAnalysis ?? undefined },
  });
}

// householdId wajib: tidak ada query log yang boleh lintas grup.
export function listRecords({ householdId, limit = 50, since }) {
  return db.dailyRecord.findMany({
    where: { householdId, ...(since && { createdAt: { gte: since } }) },
    orderBy: { createdAt: 'desc' },
    take: Math.min(limit, 200),
  });
}
