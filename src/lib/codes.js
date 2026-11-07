import { randomInt } from 'node:crypto';

// Tanpa 0/O/1/I/L agar mudah dibaca dan diketik orang tua.
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

export function generateCode(length) {
  return Array.from({ length }, () => ALPHABET[randomInt(ALPHABET.length)]).join('');
}

// Rapikan input: huruf besar, buang spasi dan tanda hubung ("k7m-2q9" -> "K7M2Q9").
export const normalizeCode = (value) => String(value ?? '').toUpperCase().replace(/[^A-Z0-9]/g, '');

export const KODE_LANSIA_LEN = 6;
export const KODE_KELUARGA_LEN = 8;
