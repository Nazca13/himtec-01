import { NextResponse } from 'next/server';
import { authResponse, requireLansia } from '@/lib/auth';
import { bersihkanLokasi } from '@/lib/lokasi';
import { tafsirkanKabar } from '@/services/kabar.service';
import { createRecord, ValidationError } from '@/services/record.service';

// HP lansia mengirim kabar tanpa suara: Saya Aman, Darurat, keluhan pilihan gambar, atau peringatan otomatis
// (kejang/jatuh). Lansia diambil dari sesi; status ditentukan server (tafsirkanKabar), bukan klien.
export async function POST(request) {
  try {
    const { lansia } = await requireLansia(request);
    const { tipeInput, keluhan, sebab, lokasi } = await request.json();
    const { statusBahaya, aiAnalysis } = tafsirkanKabar({ tipeInput, keluhan, sebab, nama: lansia.nama });
    const record = await createRecord({ lansiaId: lansia.id, tipeInput, statusBahaya, aiAnalysis, lokasi: bersihkanLokasi(lokasi) });
    return NextResponse.json({ record }, { status: 201 });
  } catch (error) {
    const auth = authResponse(error);
    if (auth) return auth;
    if (error instanceof ValidationError) return NextResponse.json({ error: error.message }, { status: 400 });
    console.error('POST /api/record:', error);
    return NextResponse.json({ error: 'Gagal menyimpan pesan.' }, { status: 500 });
  }
}
