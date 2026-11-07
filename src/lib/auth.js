import { SESSION_COOKIE, verifySession } from '@/lib/session';
import { getHousehold } from '@/services/household.service';

export class AuthError extends Error {}

// Dipakai semua route handler yang butuh sesi. Mengembalikan { session, household }
// atau melempar AuthError (handler membalas 401).
export async function requireSession(request, role) {
  const session = await verifySession(request.cookies.get(SESSION_COOKIE[role])?.value).catch(() => null);
  if (!session || session.r !== role) throw new AuthError('Sesi tidak valid');

  const household = await getHousehold(session.h);
  if (!household) throw new AuthError('Grup tidak ditemukan');
  // HP lansia yang sudah diputus membawa versi lama.
  if (role === 'lansia' && session.v !== household.lansiaVersion) throw new AuthError('HP ini sudah diputus');

  return { session, household };
}

export const unauthorized = () => Response.json({ error: 'Sesi tidak valid. Masuk lagi.' }, { status: 401 });
