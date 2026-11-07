import { NextResponse } from 'next/server';
import { SESSION_COOKIE, verifySession } from '@/lib/session';

// Aturan akses halaman berdasarkan sesi (cookie bertanda tangan). Data tetap dijaga lagi di tiap API.
//   /lansia       : butuh sesi lansia, kalau tidak ke /hubungkan (konteks app lansia)
//   /pengawas/*   : butuh sesi keluarga, kalau tidak ke /
//   /, /daftar, /gabung : yang sudah punya sesi keluarga langsung masuk ke dashboard
export async function proxy(request) {
  const { pathname } = request.nextUrl;
  const read = (role) => verifySession(request.cookies.get(SESSION_COOKIE[role])?.value).catch(() => null);
  const [lansia, pengawas] = await Promise.all([read('lansia'), read('pengawas')]);
  const go = (path) => NextResponse.redirect(new URL(path, request.url));

  if (pathname === '/lansia') return lansia ? NextResponse.next() : go('/hubungkan');
  if (pathname.startsWith('/pengawas')) return pengawas ? NextResponse.next() : go('/');
  if (pathname === '/hubungkan') return NextResponse.next();
  if (pengawas) return go('/pengawas');
  if (lansia && pathname === '/') return go('/lansia');
  return NextResponse.next();
}

export const config = { matcher: ['/', '/daftar', '/gabung', '/hubungkan', '/lansia', '/pengawas/:path*'] };
