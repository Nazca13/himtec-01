import { NextResponse } from 'next/server';
import { authResponse, requireMember } from '@/lib/auth';
import { cleanName } from '@/lib/validate';
import { tambahLansia } from '@/services/household.service';

// Admin menambah orang tua yang dipantau (form "Tambah orang tua"). Kode pairing langsung dibuat.
export async function POST(request) {
  try {
    const { household } = await requireMember(request, { admin: true });
    const nama = cleanName((await request.json()).nama, 60);
    if (!nama) return NextResponse.json({ error: 'Nama orang tua wajib diisi.' }, { status: 400 });
    const lansia = await tambahLansia(household.id, nama);
    return NextResponse.json({ lansia: { id: lansia.id, nama: lansia.nama, kodePairing: lansia.kodePairing } }, { status: 201 });
  } catch (error) {
    const auth = authResponse(error);
    if (auth) return auth;
    console.error('POST /api/lansia:', error);
    return NextResponse.json({ error: 'Gagal menambah orang tua.' }, { status: 500 });
  }
}
