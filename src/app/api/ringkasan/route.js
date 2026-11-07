import { connection, NextResponse } from 'next/server';
import { authResponse, requireMember } from '@/lib/auth';
import { lansiaMilik } from '@/services/household.service';
import { listRecords } from '@/services/record.service';
import { ringkasanKeluarga } from '@/services/mascot.service';

// Widget AI di dashboard: ringkasan kondisi satu lansia, dibuat ulang hanya saat ada log baru.
export async function GET(request) {
  await connection(); // tandai dinamis: handler ini membaca cookie sesi
  try {
    const { household } = await requireMember(request);
    const lansia = await lansiaMilik(household.id, new URL(request.url).searchParams.get('lansia'));
    if (!lansia) return NextResponse.json({ error: 'Lansia tidak ditemukan.' }, { status: 404 });
    const records = await listRecords({ lansiaId: lansia.id, limit: 30 });
    return NextResponse.json(await ringkasanKeluarga({ lansia, records }));
  } catch (error) {
    const auth = authResponse(error);
    if (auth) return auth;
    console.error('GET /api/ringkasan:', error);
    return NextResponse.json({ error: 'Gagal membuat ringkasan.' }, { status: 500 });
  }
}
