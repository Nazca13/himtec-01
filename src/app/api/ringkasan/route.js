import { connection, NextResponse } from 'next/server';
import { AuthError, requireSession, unauthorized } from '@/lib/auth';
import { listRecords } from '@/services/record.service';
import { ringkasanKeluarga } from '@/services/mascot.service';

// Widget AI di dashboard keluarga: ringkasan kondisi terbaru, dibuat ulang hanya saat ada log baru.
export async function GET(request) {
  await connection(); // tandai dinamis: handler ini membaca cookie sesi
  try {
    const { household } = await requireSession(request, 'pengawas');
    const records = await listRecords({ householdId: household.id, limit: 30 });
    return NextResponse.json(await ringkasanKeluarga({ household, records }));
  } catch (error) {
    if (error instanceof AuthError) return unauthorized();
    console.error('GET /api/ringkasan:', error);
    return NextResponse.json({ error: 'Gagal membuat ringkasan.' }, { status: 500 });
  }
}
