// Tes unit untuk modul murni di src/lib (tanpa database/jaringan). Jalankan: npm test
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { generateCode, normalizeCode } from '../src/lib/codes.js';
import { validateEnv } from '../src/lib/env.js';
import { KELUHAN } from '../src/lib/keluhan.js';
import { bersihkanLokasi } from '../src/lib/lokasi.js';
import { rateLimit } from '../src/lib/rate-limit.js';

test('generateCode: panjang tepat dan tanpa karakter membingungkan (0 O 1 I L)', () => {
  for (let i = 0; i < 200; i++) assert.match(generateCode(6), /^[A-HJKMNP-Z2-9]{6}$/);
});

test('normalizeCode: huruf besar, buang spasi dan tanda hubung', () => {
  assert.equal(normalizeCode(' k7m-2q9 '), 'K7M2Q9');
  assert.equal(normalizeCode(null), '');
});

test('bersihkanLokasi: menolak nilai di luar rentang atau bukan angka', () => {
  assert.deepEqual(bersihkanLokasi({ latitude: 91, longitude: 0 }), {});
  assert.deepEqual(bersihkanLokasi({ latitude: 0, longitude: 181 }), {});
  assert.deepEqual(bersihkanLokasi({ latitude: 'x', longitude: 1 }), {});
  assert.deepEqual(bersihkanLokasi(undefined), {});
});

test('bersihkanLokasi: menerima lokasi sah dan membatasi akurasi', () => {
  assert.deepEqual(bersihkanLokasi({ latitude: -6.26, longitude: 106.78, akurasi: 18 }), { latitude: -6.26, longitude: 106.78, akurasiMeter: 18 });
  assert.equal(bersihkanLokasi({ latitude: 0, longitude: 0, akurasi: 9e9 }).akurasiMeter, 100_000);
  assert.equal(bersihkanLokasi({ latitude: 0, longitude: 0, akurasi: -5 }).akurasiMeter, null);
});

test('rateLimit: mengizinkan sampai batas lalu menolak', () => {
  const kunci = `uji-${Math.random()}`;
  assert.deepEqual([1, 2, 3, 4].map(() => rateLimit(kunci, 3, 60_000)), [true, true, true, false]);
  assert.equal(rateLimit(`${kunci}-lain`, 3, 60_000), true);
});

test('keluhan: id unik, 9 pilihan, tanda gawat berstatus MERAH', () => {
  assert.equal(KELUHAN.length, 9);
  assert.equal(new Set(KELUHAN.map((k) => k.id)).size, 9);
  for (const id of ['NYERI_DADA', 'SESAK', 'JATUH', 'KEJANG']) assert.equal(KELUHAN.find((k) => k.id === id).bahaya, 'MERAH');
});

test('validateEnv: konfigurasi lengkap lolos', () => {
  const r = validateEnv({ DATABASE_URL: 'postgresql://u:p@host:6543/db', SESSION_SECRET: 'x'.repeat(40), ORCA_API_KEY: 'sk-abc' });
  assert.deepEqual(r, { errors: [], warnings: [] });
});

test('validateEnv: menangkap kosong, placeholder, dan rahasia pendek', () => {
  assert.equal(validateEnv({}).errors.length, 2);
  const r = validateEnv({ DATABASE_URL: 'postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres', SESSION_SECRET: 'pendek' });
  assert.equal(r.errors.length, 2);
  assert.ok(r.warnings.some((w) => w.includes('ORCA_API_KEY')));
});

test('tanpaMarkdown: membuang tanda tebal dan menyeragamkan butir', async () => {
  const { tanpaMarkdown } = await import('../src/lib/format.js');
  assert.equal(tanpaMarkdown('* **Hari ini:** aman\n*   **Kemarin:** aman'), '- Hari ini: aman\n- Kemarin: aman');
  assert.equal(tanpaMarkdown(null), '');
});
