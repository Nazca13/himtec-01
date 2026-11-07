import { NextResponse } from 'next/server';
import { authResponse, requireMember } from '@/lib/auth';
import { askAssistant } from '@/services/assistant.service';
import { lansiaMilik } from '@/services/household.service';

const MAX_QUESTION = 500;

// Asisten AI untuk keluarga (admin dan pemantau), menjawab tentang satu lansia milik keluarga ini.
export async function POST(request) {
  try {
    const { household } = await requireMember(request);
    const { question, lansiaId } = await request.json();
    const q = typeof question === 'string' ? question.trim() : '';
    if (!q || q.length > MAX_QUESTION) {
      return NextResponse.json({ error: `Pertanyaan wajib diisi, maksimal ${MAX_QUESTION} karakter.` }, { status: 400 });
    }
    const lansia = await lansiaMilik(household.id, lansiaId);
    if (!lansia) return NextResponse.json({ error: 'Pilih orang tua yang ditanyakan.' }, { status: 400 });

    return NextResponse.json({ answer: await askAssistant({ question: q, lansia }) });
  } catch (error) {
    const auth = authResponse(error);
    if (auth) return auth;
    console.error('POST /api/assistant:', error);
    return NextResponse.json({ error: 'Asisten sedang tidak tersedia.' }, { status: 500 });
  }
}
