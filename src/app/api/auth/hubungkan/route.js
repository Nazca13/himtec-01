import { NextResponse } from 'next/server';
import { normalizeCode } from '@/lib/codes';
import { pesanServer } from '@/lib/errors';
import { clientIp, rateLimit } from '@/lib/rate-limit';
import { sessionCookie, signSession } from '@/lib/session';
import { findLansiaByKode, tandaiTerhubung } from '@/services/household.service';

// HP orang tua dihubungkan lewat kode pairing. Sesinya tersimpan 1 tahun.
export async function POST(request) {
  try {
    if (!rateLimit(`hubungkan:${clientIp(request)}`, 10, 60 * 1000)) {
      return NextResponse.json({ error: 'Terlalu banyak percobaan. Tunggu semenit.' }, { status: 429 });
    }
    const kode = normalizeCode((await request.json()).kode);
    if (!kode) return NextResponse.json({ error: 'Kode wajib diisi.' }, { status: 400 });

    const lansia = await findLansiaByKode(kode);
    if (!lansia) return NextResponse.json({ error: 'Kode tidak ditemukan. Periksa lagi atau minta kode baru ke pengurus.' }, { status: 404 });

    await tandaiTerhubung(lansia.id);
    const res = NextResponse.json({ namaLansia: lansia.nama });
    res.cookies.set(sessionCookie('lansia', await signSession({ l: lansia.id, v: lansia.deviceVersion }), request));
    return res;
  } catch (error) {
    console.error('POST /api/auth/hubungkan:', error);
    return NextResponse.json({ error: pesanServer(error, 'Gagal menghubungkan.') }, { status: 500 });
  }
}
