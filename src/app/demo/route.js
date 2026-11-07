import { NextResponse } from 'next/server';
import { demoAktif } from '@/lib/flags';
import { clientIp, rateLimit } from '@/lib/rate-limit';
import { sessionCookie, signSession } from '@/lib/session';
import { ensureDemo } from '@/services/demo.service';

// Satu klik untuk juri: masuk ke keluarga demo sebagai admin DAN sebagai HP Oma Siti di browser yang sama,
// lalu tampilkan keduanya berdampingan. ?reset=1 mengembalikan data demo ke awal.
export async function GET(request) {
  if (!demoAktif()) return new NextResponse('Mode demo dimatikan.', { status: 404 });
  if (!rateLimit(`demo:${clientIp(request)}`, 30, 60 * 1000)) return new NextResponse('Terlalu banyak permintaan. Coba lagi sebentar.', { status: 429 });
  const reset = new URL(request.url).searchParams.has('reset');
  const { admin, lansia } = await ensureDemo({ reset });

  const res = NextResponse.redirect(new URL('/demo/layar', request.url));
  res.cookies.set(sessionCookie('pengawas', await signSession({ m: admin.id }), request));
  res.cookies.set(sessionCookie('lansia', await signSession({ l: lansia.id, v: lansia.deviceVersion }), request));
  return res;
}
