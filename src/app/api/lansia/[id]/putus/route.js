import { NextResponse } from 'next/server';
import { authResponse, requireMember } from '@/lib/auth';
import { lansiaMilik, putusLansia } from '@/services/household.service';

// Admin memutus HP lansia (hilang/diganti): kode baru, sesi HP lama langsung tidak berlaku.
export async function POST(request, { params }) {
  try {
    const { household } = await requireMember(request, { admin: true });
    const lansia = await lansiaMilik(household.id, (await params).id);
    if (!lansia) return NextResponse.json({ error: 'Lansia tidak ditemukan.' }, { status: 404 });
    const updated = await putusLansia(lansia.id);
    return NextResponse.json({ kodePairing: updated.kodePairing });
  } catch (error) {
    const auth = authResponse(error);
    if (auth) return auth;
    console.error('POST /api/lansia/[id]/putus:', error);
    return NextResponse.json({ error: 'Gagal memutus HP.' }, { status: 500 });
  }
}
