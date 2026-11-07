import { connection, NextResponse } from 'next/server';
import { AuthError, requireSession, unauthorized } from '@/lib/auth';
import { pesanMaskot } from '@/services/mascot.service';
import { ringkasanHarian } from '@/services/record.service';

// Pesan maskot yang ditulis AI untuk keadaan lansia saat ini (jatuh ke sapaan lokal jika AI lambat/gagal).
export async function GET(request) {
  await connection(); // tandai dinamis: handler ini membaca cookie sesi
  try {
    const { household } = await requireSession(request, 'lansia');
    const harian = await ringkasanHarian(household.id);
    return NextResponse.json(await pesanMaskot({ householdId: household.id, nama: household.namaLansia, ...harian }));
  } catch (error) {
    if (error instanceof AuthError) return unauthorized();
    console.error('GET /api/lansia/sapa:', error);
    return NextResponse.json({ error: 'Gagal.' }, { status: 500 });
  }
}
