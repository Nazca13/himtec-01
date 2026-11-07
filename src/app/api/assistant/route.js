import { NextResponse } from 'next/server';
import { authResponse, requireMember } from '@/lib/auth';
import { askAssistant } from '@/services/assistant.service';
import { lansiaMilik, ringkasKeluarga } from '@/services/household.service';

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
    // Tanpa lansiaId (mis. halaman belum selesai memuat): pakai orang tua pertama di keluarga ini.
    const lansia = lansiaId ? await lansiaMilik(household.id, lansiaId) : (await ringkasKeluarga(household.id)).lansia[0];
    if (!lansia) return NextResponse.json({ error: lansiaId ? 'Orang tua tidak ditemukan.' : 'Belum ada orang tua di keluarga ini.' }, { status: 400 });

    return NextResponse.json({ answer: await askAssistant({ question: q, lansia }) });
  } catch (error) {
    const auth = authResponse(error);
    if (auth) return auth;
    console.error('POST /api/assistant:', error);
    return NextResponse.json({ error: 'Asisten sedang tidak tersedia.' }, { status: 500 });
  }
}
