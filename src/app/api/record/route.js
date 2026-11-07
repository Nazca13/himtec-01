import { NextResponse } from 'next/server';
import { STATUS, TIPE_INPUT } from '@/lib/constants';
import { AuthError, requireSession, unauthorized } from '@/lib/auth';
import { createRecord, listRecords, ValidationError } from '@/services/record.service';

// Status untuk tombol ditentukan server, bukan klien.
const STATUS_TOMBOL = {
  [TIPE_INPUT.AMAN]: STATUS.HIJAU,
  [TIPE_INPUT.DARURAT]: STATUS.MERAH,
};

// Keluarga: log grupnya + info grup (nama, kode, status HP lansia).
export async function GET(request) {
  try {
    const { session, household } = await requireSession(request, 'pengawas');
    const limit = Number(new URL(request.url).searchParams.get('limit')) || 50;
    const records = await listRecords({ householdId: household.id, limit });
    return NextResponse.json({
      records,
      me: { nama: session.n },
      household: {
        namaLansia: household.namaLansia,
        kodeLansia: household.kodeLansia,
        kodeKeluarga: household.kodeKeluarga,
        lansiaTerhubungAt: household.lansiaTerhubungAt,
      },
    });
  } catch (error) {
    if (error instanceof AuthError) return unauthorized();
    console.error('GET /api/record:', error);
    return NextResponse.json({ error: 'Gagal membaca log.' }, { status: 500 });
  }
}

// HP lansia: kirim tombol Aman/Darurat. Grup diambil dari sesi, tidak pernah dari body.
export async function POST(request) {
  try {
    const { household } = await requireSession(request, 'lansia');
    const { tipeInput } = await request.json();
    const statusBahaya = STATUS_TOMBOL[tipeInput];
    if (!statusBahaya) {
      return NextResponse.json({ error: 'tipeInput harus TOMBOL_AMAN atau TOMBOL_DARURAT.' }, { status: 400 });
    }
    const record = await createRecord({ householdId: household.id, tipeInput, statusBahaya });
    return NextResponse.json({ record }, { status: 201 });
  } catch (error) {
    if (error instanceof AuthError) return unauthorized();
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error('POST /api/record:', error);
    return NextResponse.json({ error: 'Gagal menyimpan pesan.' }, { status: 500 });
  }
}
