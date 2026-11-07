import { NextResponse } from 'next/server';
import { clientIp, rateLimit } from '@/lib/rate-limit';
import { sessionCookie, signSession } from '@/lib/session';
import { cleanName } from '@/lib/validate';
import { createHousehold } from '@/services/household.service';

// Keluarga membuat grup baru dan langsung masuk sebagai pengawas.
export async function POST(request) {
  try {
    if (!rateLimit(`buat:${clientIp(request)}`, 10, 60 * 60 * 1000)) {
      return NextResponse.json({ error: 'Terlalu banyak percobaan. Coba lagi nanti.' }, { status: 429 });
    }
    const body = await request.json();
    const nama = cleanName(body.nama);
    const namaLansia = cleanName(body.namaLansia, 60);
    if (!nama || !namaLansia) {
      return NextResponse.json({ error: 'Nama Anda dan nama lansia wajib diisi.' }, { status: 400 });
    }

    const household = await createHousehold(namaLansia);
    const res = NextResponse.json(
      { household: { namaLansia: household.namaLansia, kodeLansia: household.kodeLansia, kodeKeluarga: household.kodeKeluarga } },
      { status: 201 }
    );
    res.cookies.set(sessionCookie('pengawas', await signSession({ h: household.id, r: 'pengawas', n: nama }), request));
    return res;
  } catch (error) {
    console.error('POST /api/auth/buat:', error);
    return NextResponse.json({ error: 'Gagal membuat grup.' }, { status: 500 });
  }
}
