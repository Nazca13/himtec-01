import { NextResponse } from 'next/server';
import { sessionCookie, signSession } from '@/lib/session';
import { ensureDemo } from '@/services/demo.service';

// Satu klik untuk juri: masuk ke keluarga demo sebagai admin DAN sebagai HP Oma Siti di browser yang sama,
// lalu tampilkan keduanya berdampingan. ?reset=1 mengembalikan data demo ke awal.
export async function GET(request) {
  if (process.env.ENABLE_DEMO === 'false') return new NextResponse('Mode demo dimatikan.', { status: 404 });
  const reset = new URL(request.url).searchParams.has('reset');
  const { admin, lansia } = await ensureDemo({ reset });

  const res = NextResponse.redirect(new URL('/demo/layar', request.url));
  res.cookies.set(sessionCookie('pengawas', await signSession({ m: admin.id }), request));
  res.cookies.set(sessionCookie('lansia', await signSession({ l: lansia.id, v: lansia.deviceVersion }), request));
  return res;
}
