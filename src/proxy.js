import { NextResponse } from 'next/server';
import { SESSION_COOKIE, verifySession } from '@/lib/session';

const HOME = { lansia: '/lansia', pengawas: '/pengawas' };

// Aturan akses halaman berdasarkan sesi (cookie bertanda tangan). Data tetap dijaga lagi di tiap API.
//   tanpa sesi  : hanya halaman masuk (/, /buat, /gabung, /hubungkan)
//   lansia      : hanya /lansia (dan /hubungkan untuk menghubungkan ulang)
//   pengawas    : hanya /pengawas/*
export async function proxy(request) {
  const { pathname } = request.nextUrl;
  const session = await verifySession(request.cookies.get(SESSION_COOKIE)?.value).catch(() => null);
  const role = session?.r;
  const go = (path) => NextResponse.redirect(new URL(path, request.url));

  if (pathname === '/lansia') return role === 'lansia' ? NextResponse.next() : go(HOME[role] ?? '/');
  if (pathname.startsWith('/pengawas')) return role === 'pengawas' ? NextResponse.next() : go(HOME[role] ?? '/');
  if (pathname === '/hubungkan') return role === 'pengawas' ? go(HOME.pengawas) : NextResponse.next();
  // '/', '/buat', '/gabung': yang sudah punya sesi langsung masuk ke tampilannya
  return role ? go(HOME[role]) : NextResponse.next();
}

export const config = { matcher: ['/', '/buat', '/gabung', '/hubungkan', '/lansia', '/pengawas/:path*'] };
