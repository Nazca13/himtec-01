// shortcut: hitungan di memori satu proses; di serverless/multi-instance tidak akurat.
// Upgrade ke Redis/Upstash jika app dipakai publik.
const hits = new Map();

export function rateLimit(key, max, windowMs) {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5000) for (const [k, v] of hits) if (!v.some((t) => now - t < windowMs)) hits.delete(k);
  return recent.length <= max;
}

export const clientIp = (request) => request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'lokal';
