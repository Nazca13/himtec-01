import { NextResponse } from 'next/server';
import { askAssistant } from '@/services/assistant.service';

const MAX_QUESTION = 500;

export async function POST(request) {
  try {
    const { question } = await request.json();
    const q = typeof question === 'string' ? question.trim() : '';

    if (!q || q.length > MAX_QUESTION) {
      return NextResponse.json({ error: `Pertanyaan wajib diisi, maksimal ${MAX_QUESTION} karakter.` }, { status: 400 });
    }

    const answer = await askAssistant(q);
    return NextResponse.json({ answer });
  } catch (error) {
    console.error('POST /api/assistant:', error);
    return NextResponse.json({ error: 'Asisten sedang tidak tersedia.' }, { status: 500 });
  }
}
