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
    const rawNama = cleanName(body.nama, 35);
    const hubungan = body.hubungan ? cleanName(body.hubungan, 15) : null;
    const namaAdmin = hubungan && hubungan !== 'Lainnya' ? `${rawNama} (${hubungan})`.slice(0, 40) : rawNama;
    const rawLansia = cleanName(body.namaLansia, 45);
    const kondisi = body.kondisiLansia ? cleanName(body.kondisiLansia, 30) : null;
    const namaLansia = kondisi ? `${rawLansia} (${kondisi})`.slice(0, 60) : rawLansia;
    const namaKeluarga = body.namaKeluarga ? cleanName(body.namaKeluarga, 60) : `Keluarga ${rawNama}`;
    if (!rawNama || !rawLansia) return NextResponse.json({ error: 'Nama Anda dan nama orang tua wajib diisi.' }, { status: 400 });

    const { household, member, lansia } = await daftarKeluarga({ namaAdmin, namaLansia, namaKeluarga });
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
