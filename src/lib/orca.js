import OpenAI from 'openai';

// Server-side only: ORCA_API_KEY must never reach client code.
// Diukur: orcarouter/auto 30-40 dtk per jawaban (memilih model sendiri); gemini-2.5-flash-lite ±1,2 dtk.
export const ORCA_TEXT_MODEL = 'google/gemini-2.5-flash-lite';
// Model yang menerima input audio (WAV) lewat OrcaRouter. "auto" bisa memilih model tanpa audio.
export const ORCA_AUDIO_MODEL = 'google/gemini-2.5-flash';

let client;

// Lazy: tanpa key, impor modul ini tidak boleh crash (build tetap jalan).
export function getOrca() {
  const key = process.env.ORCA_API_KEY;
  if (!key || key.startsWith('your_')) return null;
  client ??= new OpenAI({ baseURL: 'https://api.orcarouter.ai/v1', apiKey: key });
  return client;
}
