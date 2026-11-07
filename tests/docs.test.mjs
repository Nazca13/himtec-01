// Menjaga dokumentasi tidak melenceng dari kode.
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { test } from 'node:test';

const baca = (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');

test('docs/schema.sql identik dengan prisma/setup.sql', () => {
  assert.equal(baca('docs/schema.sql'), baca('prisma/setup.sql'));
});

test('.env.example tidak berisi rahasia nyata', () => {
  const isi = baca('.env.example');
  assert.doesNotMatch(isi, /sk-[A-Za-z0-9]{10,}/);
  assert.doesNotMatch(isi, /eyJ[A-Za-z0-9_-]{20,}/);
  assert.match(isi, /\[PASSWORD\]/);
});

test('dokumen dan kode tidak memuat kata sandi atau kunci yang terlihat nyata', () => {
  const berkas = ['README.md', 'readthis.md', 'CLAUDE.md', ...readdirSync(new URL('../docs/', import.meta.url)).filter((f) => /\.(md|txt|sql)$/.test(f)).map((f) => `docs/${f}`)];
  for (const f of berkas) {
    const isi = baca(f);
    assert.doesNotMatch(isi, /postgres(ql)?:\/\/[^\s"'<>]+:(?!\[|<|%|\.\.\.|kata-sandi|password|PASSWORD)[^\s@"'<>]{4,}@/i, `${f}: kata sandi dalam URL koneksi`);
    assert.doesNotMatch(isi, /sk-(orca-)?[A-Za-z0-9]{16,}/, `${f}: kunci API`);
    assert.doesNotMatch(isi, /eyJ[A-Za-z0-9_-]{30,}\.[A-Za-z0-9_-]{10,}/, `${f}: token JWT`);
  }
});
