// Hook resolusi modul khusus tes: memetakan alias "@/..." ke src/ dan menambah ".js" (seperti jsconfig + bundler).
import { existsSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';

const SRC = fileURLToPath(new URL('../src/', import.meta.url));

export async function resolve(specifier, context, next) {
  if (specifier.startsWith('@/')) {
    const base = SRC + specifier.slice(2);
    const file = [base, `${base}.js`].find((p) => existsSync(p) && p.endsWith('.js')) ?? `${base}.js`;
    return next(pathToFileURL(file).href, context);
  }
  return next(specifier, context);
}
