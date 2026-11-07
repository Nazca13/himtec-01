import { GoogleGenAI } from '@google/genai';

// Server-side only: GEMINI_API_KEY must never reach client code.
let client;

export function getGemini() {
  const key = process.env.GEMINI_API_KEY;
  if (!key || key.startsWith('your_')) return null;
  client ??= new GoogleGenAI({ apiKey: key });
  return client;
}
