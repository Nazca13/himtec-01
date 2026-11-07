import { NextResponse } from 'next/server';
import { STATUS, TIPE_INPUT } from '@/lib/constants';
import { authResponse, requireLansia } from '@/lib/auth';
import { bersihkanLokasi } from '@/lib/lokasi';
import { createRecord, ValidationError } from '@/services/record.service';

// Status untuk tombol ditentukan server, bukan klien.
const STATUS_TOMBOL = {
  [TIPE_INPUT.AMAN]: STATUS.HIJAU,
  [TIPE_INPUT.DARURAT]: STATUS.MERAH,
};

// HP lansia: kirim tombol Aman/Darurat. Lansia diambil dari sesi, tidak pernah dari body.
export async function POST(request) {
  try {
    const { lansia } = await requireLansia(request);
    const { tipeInput, lokasi } = await request.json();
    const statusBahaya = STATUS_TOMBOL[tipeInput];
    if (!statusBahaya) {
      return NextResponse.json({ error: 'tipeInput harus TOMBOL_AMAN atau TOMBOL_DARURAT.' }, { status: 400 });
    }
    const record = await createRecord({ lansiaId: lansia.id, tipeInput, statusBahaya, lokasi: bersihkanLokasi(lokasi) });
    return NextResponse.json({ record }, { status: 201 });
  } catch (error) {
    const auth = authResponse(error);
    if (auth) return auth;
    if (error instanceof ValidationError) return NextResponse.json({ error: error.message }, { status: 400 });
    console.error('POST /api/record:', error);
    return NextResponse.json({ error: 'Gagal menyimpan pesan.' }, { status: 500 });
  }
}
