import { NextResponse } from 'next/server';
import { authResponse, requireMember } from '@/lib/auth';
import { hapusLansia, lansiaMilik } from '@/services/household.service';

// Admin menghapus orang tua dari keluarga (beserta seluruh log-nya, cascade).
export async function DELETE(request, { params }) {
  try {
    const { household } = await requireMember(request, { admin: true });
    const lansia = await lansiaMilik(household.id, (await params).id);
    if (!lansia) return NextResponse.json({ error: 'Lansia tidak ditemukan.' }, { status: 404 });
    await hapusLansia(lansia.id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const auth = authResponse(error);
    if (auth) return auth;
    console.error('DELETE /api/lansia/[id]:', error);
    return NextResponse.json({ error: 'Gagal menghapus.' }, { status: 500 });
  }
}
