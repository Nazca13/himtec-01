import { NextResponse } from 'next/server';
import { STATUS, TIPE_INPUT } from '@/lib/constants';
import { createRecord, listRecords, ValidationError } from '@/services/record.service';

// Status untuk tombol ditentukan server, bukan klien.
const STATUS_TOMBOL = {
  [TIPE_INPUT.AMAN]: STATUS.HIJAU,
  [TIPE_INPUT.DARURAT]: STATUS.MERAH,
};

export async function GET(request) {
  try {
    const limit = Number(new URL(request.url).searchParams.get('limit')) || 50;
    const records = await listRecords({ limit });
    return NextResponse.json({ records });
  } catch (error) {
    console.error('GET /api/record:', error);
    return NextResponse.json({ error: 'Gagal membaca log.' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { tipeInput } = await request.json();
    const statusBahaya = STATUS_TOMBOL[tipeInput];
    if (!statusBahaya) {
      return NextResponse.json({ error: 'tipeInput harus TOMBOL_AMAN atau TOMBOL_DARURAT.' }, { status: 400 });
    }
    const record = await createRecord({ tipeInput, statusBahaya });
    return NextResponse.json({ record }, { status: 201 });
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error('POST /api/record:', error);
    return NextResponse.json({ error: 'Gagal menyimpan pesan.' }, { status: 500 });
  }
}
