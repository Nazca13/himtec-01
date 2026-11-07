import { connection, NextResponse } from 'next/server';
import { db } from '@/lib/db';

const BATAS_MS = 3000;

// Pemeriksaan kesehatan untuk pemantau uptime/load balancer. Publik, tanpa data pengguna, tanpa rahasia.
//   200 { status: "ok" }        : server dan database sehat
//   503 { status: "degraded" }  : server hidup, database tidak terjangkau atau lambat (>3 detik)
export async function GET() {
  await connection();
  const mulai = Date.now();
  let dbOk = false;
  try {
    await Promise.race([db.$queryRaw`SELECT 1`, new Promise((_, tolak) => setTimeout(() => tolak(new Error('timeout')), BATAS_MS))]);
    dbOk = true;
  } catch {
    // dibiarkan: hasilnya dilaporkan sebagai degraded
  }
  return NextResponse.json(
    {
      status: dbOk ? 'ok' : 'degraded',
      database: { ok: dbOk, ms: Date.now() - mulai },
      versi: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? 'lokal',
      waktu: new Date().toISOString(),
    },
    { status: dbOk ? 200 : 503, headers: { 'Cache-Control': 'no-store' } }
  );
}
