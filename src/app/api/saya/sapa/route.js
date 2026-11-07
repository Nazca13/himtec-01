import { connection, NextResponse } from 'next/server';
import { authResponse, requireLansia } from '@/lib/auth';
import { pesanMaskot } from '@/services/mascot.service';
import { ringkasanHarian } from '@/services/record.service';

// Pesan maskot yang ditulis AI untuk keadaan lansia saat ini (jatuh ke sapaan lokal jika AI lambat/gagal).
export async function GET(request) {
  await connection(); // tandai dinamis: handler ini membaca cookie sesi
  try {
    const { lansia } = await requireLansia(request);
    const harian = await ringkasanHarian(lansia.id);
    return NextResponse.json(await pesanMaskot({ lansiaId: lansia.id, nama: lansia.nama, ...harian }));
  } catch (error) {
    const auth = authResponse(error);
    if (auth) return auth;
    console.error('GET /api/saya/sapa:', error);
    return NextResponse.json({ error: 'Gagal.' }, { status: 500 });
  }
}
