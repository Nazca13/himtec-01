import { NextResponse } from 'next/server';
import { normalizeCode } from '@/lib/codes';
import { pesanServer } from '@/lib/errors';
import { clientIp, rateLimit } from '@/lib/rate-limit';
import { sessionCookie, signSession } from '@/lib/session';
import { cleanName } from '@/lib/validate';
import { gabungKeluarga } from '@/services/household.service';

// Anggota keluarga bergabung sebagai PEMANTAU lewat kode undangan. Admin bisa menaikkan perannya nanti.
export async function POST(request) {
  try {
    if (!rateLimit(`gabung:${clientIp(request)}`, 10, 60 * 1000)) {
      return NextResponse.json({ error: 'Terlalu banyak percobaan. Tunggu semenit.' }, { status: 429 });
    }
    const body = await request.json();
    const nama = cleanName(body.nama);
    const kode = normalizeCode(body.kode);
    if (!nama || !kode) return NextResponse.json({ error: 'Nama dan kode undangan wajib diisi.' }, { status: 400 });

    const hasil = await gabungKeluarga({ kode, nama });
    if (!hasil) return NextResponse.json({ error: 'Kode undangan tidak ditemukan. Periksa lagi.' }, { status: 404 });

    const res = NextResponse.json({ keluarga: hasil.household.nama });
    res.cookies.set(sessionCookie('pengawas', await signSession({ m: hasil.member.id }), request));
    return res;
  } catch (error) {
    console.error('POST /api/auth/gabung:', error);
    return NextResponse.json({ error: pesanServer(error, 'Gagal bergabung.') }, { status: 500 });
  }
}
