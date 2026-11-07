import { NextResponse } from 'next/server';
import { normalizeCode } from '@/lib/codes';
import { clientIp, rateLimit } from '@/lib/rate-limit';
import { sessionCookie, signSession } from '@/lib/session';
import { cleanName } from '@/lib/validate';
import { findByKodeKeluarga } from '@/services/household.service';

// Anggota keluarga lain bergabung lewat kode keluarga.
export async function POST(request) {
  try {
    if (!rateLimit(`gabung:${clientIp(request)}`, 10, 60 * 1000)) {
      return NextResponse.json({ error: 'Terlalu banyak percobaan. Tunggu semenit.' }, { status: 429 });
    }
    const body = await request.json();
    const nama = cleanName(body.nama);
    const kode = normalizeCode(body.kode);
    if (!nama || !kode) return NextResponse.json({ error: 'Nama dan kode keluarga wajib diisi.' }, { status: 400 });

    const household = await findByKodeKeluarga(kode);
    if (!household) return NextResponse.json({ error: 'Kode keluarga tidak ditemukan. Periksa lagi.' }, { status: 404 });

    const res = NextResponse.json({ namaLansia: household.namaLansia });
    res.cookies.set(sessionCookie('pengawas', await signSession({ h: household.id, r: 'pengawas', n: nama }), request));
    return res;
  } catch (error) {
    console.error('POST /api/auth/gabung:', error);
    return NextResponse.json({ error: 'Gagal bergabung.' }, { status: 500 });
  }
}
