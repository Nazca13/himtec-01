import { db } from '@/lib/db';
import { SESSION_COOKIE, verifySession } from '@/lib/session';

export class AuthError extends Error {} // 401: belum masuk / sesi tidak berlaku
export class ForbiddenError extends Error {} // 403: sudah masuk, tetapi peran tidak cukup

export const unauthorized = () => Response.json({ error: 'Sesi tidak valid. Masuk lagi.' }, { status: 401 });
export const forbidden = () => Response.json({ error: 'Hanya admin yang boleh melakukan ini.' }, { status: 403 });

// Anggota keluarga (ADMIN/PEMANTAU). Peran dibaca dari database, bukan dari cookie,
// sehingga perubahan peran dan pengeluaran anggota langsung berlaku.
export async function requireMember(request, { admin = false } = {}) {
  const session = await verifySession(request.cookies.get(SESSION_COOKIE.pengawas)?.value).catch(() => null);
  if (!session?.m) throw new AuthError('Sesi tidak valid');
  const member = await db.member.findUnique({ where: { id: session.m }, include: { household: true } });
  if (!member) throw new AuthError('Anggota tidak ditemukan');
  if (admin && member.role !== 'ADMIN') throw new ForbiddenError('Bukan admin');
  return { member, household: member.household };
}

// HP lansia. Versi perangkat di cookie harus sama dengan di database (HP yang diputus ditolak).
export async function requireLansia(request) {
  const session = await verifySession(request.cookies.get(SESSION_COOKIE.lansia)?.value).catch(() => null);
  if (!session?.l) throw new AuthError('Sesi tidak valid');
  const lansia = await db.lansia.findUnique({ where: { id: session.l } });
  if (!lansia || lansia.deviceVersion !== session.v) throw new AuthError('HP ini sudah diputus');
  return { lansia };
}

// Respons standar untuk error autentikasi; null jika error lain (biar handler yang menangani).
export function authResponse(error) {
  if (error instanceof AuthError) return unauthorized();
  if (error instanceof ForbiddenError) return forbidden();
  return null;
}
