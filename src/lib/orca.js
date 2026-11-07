import OpenAI from 'openai';

// Server-side only: ORCA_API_KEY must never reach client code.
export const orca = new OpenAI({
  baseURL: 'https://api.orcarouter.ai/v1',
  apiKey: process.env.ORCA_API_KEY,
});

export const ORCA_MODEL = 'orcarouter/auto';
