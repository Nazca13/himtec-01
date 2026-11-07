import { NextResponse } from 'next/server';
import { pesanServer } from '@/lib/errors';
import { clientIp, rateLimit } from '@/lib/rate-limit';
import { sessionCookie, signSession } from '@/lib/session';
import { cleanName } from '@/lib/validate';
import { daftarKeluarga } from '@/services/household.service';

// Pengurus mendaftarkan keluarga: dibuat keluarga + akun admin + orang tua pertama, lalu langsung masuk.
export async function POST(request) {
  try {
    if (!rateLimit(`daftar:${clientIp(request)}`, 10, 60 * 60 * 1000)) {
      return NextResponse.json({ error: 'Terlalu banyak percobaan. Coba lagi nanti.' }, { status: 429 });
    }
    const body = await request.json();
    const nama = cleanName(body.nama);
    const namaLansia = cleanName(body.namaLansia, 60);
    if (!nama || !namaLansia) return NextResponse.json({ error: 'Nama Anda dan nama orang tua wajib diisi.' }, { status: 400 });

    const { household, member, lansia } = await daftarKeluarga({ namaAdmin: nama, namaLansia });
    const res = NextResponse.json(
      { household: { nama: household.nama, kodeUndangan: household.kodeUndangan }, lansia: { nama: lansia.nama, kodePairing: lansia.kodePairing } },
      { status: 201 }
    );
    res.cookies.set(sessionCookie('pengawas', await signSession({ m: member.id }), request));
    return res;
  } catch (error) {
    console.error('POST /api/auth/daftar:', error);
    return NextResponse.json({ error: pesanServer(error, 'Gagal mendaftarkan keluarga.') }, { status: 500 });
  }
}
