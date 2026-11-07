import { NextResponse } from 'next/server';
import { MAX_AUDIO_BASE64_LENGTH, TIPE_INPUT } from '@/lib/constants';
import { AuthError, requireSession, unauthorized } from '@/lib/auth';
import { createRecord } from '@/services/record.service';
import { triageAudio } from '@/services/triage.service';

export async function POST(request) {
  try {
    const { household } = await requireSession(request, 'lansia');
    const { audioBase64, mimeType } = await request.json();

    if (typeof audioBase64 !== 'string' || !audioBase64 || mimeType !== 'audio/wav') {
      return NextResponse.json({ error: 'audioBase64 dan mimeType audio/wav wajib diisi.' }, { status: 400 });
    }
    if (audioBase64.length > MAX_AUDIO_BASE64_LENGTH) {
      return NextResponse.json({ error: 'Rekaman terlalu panjang.' }, { status: 413 });
    }

    const { statusBahaya, aiAnalysis } = await triageAudio({ audioBase64 });
    const record = await createRecord({ householdId: household.id, tipeInput: TIPE_INPUT.VOICE, statusBahaya, aiAnalysis });

    return NextResponse.json({ record }, { status: 201 });
  } catch (error) {
    if (error instanceof AuthError) return unauthorized();
    console.error('POST /api/ai:', error);
    return NextResponse.json({ error: 'Gagal memproses pesan suara.' }, { status: 500 });
  }
}
