// Dijalankan Next.js sekali saat server start (bukan saat build).
export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs' || process.env.NEXT_PHASE === 'phase-production-build') return;

  const { validateEnv } = await import('./lib/env');
  const { errors, warnings } = validateEnv();
  for (const w of warnings) console.warn(`[env] ${w}`);
  if (!errors.length) return;

  const pesan = `Konfigurasi tidak valid:\n${errors.map((e) => ` - ${e}`).join('\n')}`;
  if (process.env.NODE_ENV === 'production') throw new Error(pesan); // server tidak boleh jalan setengah siap
  console.error(`[env] ${pesan}`);
}
