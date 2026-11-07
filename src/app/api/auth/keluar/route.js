import { NextResponse } from 'next/server';
import { SESSION_COOKIE } from '@/lib/session';

export async function POST(request) {
  let role = null;
  try {
    const url = new URL(request.url);
    role = url.searchParams.get('role');
    if (!role) {
      const body = await request.json().catch(() => ({}));
      role = body?.role;
    }
  } catch {}

  const res = NextResponse.json({ ok: true });
  if (role === 'lansia') {
    res.cookies.delete(SESSION_COOKIE.lansia);
  } else if (role === 'pengawas') {
    res.cookies.delete(SESSION_COOKIE.pengawas);
  } else {
    res.cookies.delete(SESSION_COOKIE.pengawas);
    res.cookies.delete(SESSION_COOKIE.lansia);
  }
  return res;
}
