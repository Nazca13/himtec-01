import { NextResponse } from 'next/server';
import { AuthError, requireSession, unauthorized } from '@/lib/auth';
import { putusLansia } from '@/services/household.service';

// Keluarga memutus HP lansia (HP hilang/diganti): kode baru, sesi HP lama langsung tidak berlaku.
export async function POST(request) {
  try {
    const { household } = await requireSession(request, 'pengawas');
    const updated = await putusLansia(household.id);
    return NextResponse.json({ kodeLansia: updated.kodeLansia });
  } catch (error) {
    if (error instanceof AuthError) return unauthorized();
    console.error('POST /api/lansia/putus:', error);
    return NextResponse.json({ error: 'Gagal memutus HP lansia.' }, { status: 500 });
  }
}
