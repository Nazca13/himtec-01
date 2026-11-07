import { NextResponse } from 'next/server';
import { SESSION_COOKIE, verifySession } from '@/lib/session';
import { getHousehold } from '@/services/household.service';

// Siapa saya? Dipakai HP lansia untuk menyapa dengan nama. Tidak melempar 401: sesi kosong = { role: null }.
export async function GET(request) {
  const session = await verifySession(request.cookies.get(SESSION_COOKIE)?.value).catch(() => null);
  const household = session && (await getHousehold(session.h));
  if (!household) return NextResponse.json({ role: null });
  return NextResponse.json({ role: session.r, nama: session.n, namaLansia: household.namaLansia });
}
