import { NextResponse } from 'next/server';
import { SESSION_COOKIE, verifySession } from '@/lib/session';

// Aturan akses halaman berdasarkan sesi (cookie bertanda tangan).
// Jika pengguna sudah login, langsung arahkan ke halaman utama masing-masing tanpa alur berbelit.
//   - Sesi pengawas -> langsung ke /pengawas (dashboard)
//   - Sesi lansia   -> langsung ke /lansia (aplikasi 3 tombol)
export async function proxy(request) {
  const { pathname, searchParams } = request.nextUrl;
  const read = (role) => verifySession(request.cookies.get(SESSION_COOKIE[role])?.value).catch(() => null);
  const [lansia, pengawas] = await Promise.all([read('lansia'), read('pengawas')]);
  const go = (path) => NextResponse.redirect(new URL(path, request.url));

  // 1. Halaman aplikasi lansia
  if (pathname === '/lansia') {
    return lansia ? NextResponse.next() : go('/hubungkan');
  }

  // 2. Halaman dashboard keluarga/pengawas
  if (pathname.startsWith('/pengawas')) {
    return pengawas ? NextResponse.next() : go('/');
  }

  // 3. Halaman hubungkan HP lansia ("Peduli hari ini, untuk mereka nanti")
  if (pathname === '/hubungkan') {
    // Jika HP lansia sudah terhubung dan tidak membawa kode baru di URL, langsung buka app lansia
    if (lansia && !searchParams.has('kode')) return go('/lansia');
    return NextResponse.next();
  }

  // 4. Jika sudah login sebagai pengawas/admin: jangan tampilkan halaman masuk/daftar/gabung/home lagi
  if (pengawas) {
    return go('/pengawas');
  }

  // 5. Jika sudah login sebagai lansia: jangan tampilkan halaman masuk/daftar/gabung lagi
  if (lansia) {
    return go('/lansia');
  }

  return NextResponse.next();
}

export const config = { matcher: ['/', '/daftar', '/gabung', '/hubungkan', '/lansia', '/pengawas/:path*'] };
