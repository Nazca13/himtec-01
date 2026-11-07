import { NextResponse } from 'next/server';
import { normalizeCode } from '@/lib/codes';
import { clientIp, rateLimit } from '@/lib/rate-limit';
import { sessionCookie, signSession } from '@/lib/session';
import { findByKodeLansia, markLansiaTerhubung } from '@/services/household.service';

// HP lansia dihubungkan ke grup lewat kode lansia. Sesinya tersimpan 1 tahun.
export async function POST(request) {
  try {
    if (!rateLimit(`hubungkan:${clientIp(request)}`, 10, 60 * 1000)) {
      return NextResponse.json({ error: 'Terlalu banyak percobaan. Tunggu semenit.' }, { status: 429 });
    }
    const kode = normalizeCode((await request.json()).kode);
    if (!kode) return NextResponse.json({ error: 'Kode wajib diisi.' }, { status: 400 });

    const household = await findByKodeLansia(kode);
    if (!household) return NextResponse.json({ error: 'Kode tidak ditemukan. Periksa lagi atau minta kode baru ke keluarga.' }, { status: 404 });

    await markLansiaTerhubung(household.id);
    const res = NextResponse.json({ namaLansia: household.namaLansia });
    res.cookies.set(sessionCookie(await signSession({ h: household.id, r: 'lansia', n: household.namaLansia, v: household.lansiaVersion }), request));
    return res;
  } catch (error) {
    console.error('POST /api/auth/hubungkan:', error);
    return NextResponse.json({ error: 'Gagal menghubungkan.' }, { status: 500 });
  }
}
