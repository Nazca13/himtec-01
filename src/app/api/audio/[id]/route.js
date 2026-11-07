import { connection } from 'next/server';
import { authResponse, requireMember } from '@/lib/auth';
import { db } from '@/lib/db';
import { generateDemoWav } from '@/lib/demo-wav';
import { demoAktif } from '@/lib/flags';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Audio pesan suara orang tua. Hanya anggota keluarga yang sama yang boleh memutar.
// Mendukung HTTP Range (206): Safari/iOS menolak memutar audio tanpa itu.
export async function GET(request, { params }) {
  await connection();
  try {
    const { household } = await requireMember(request);
    const { id } = await params;
    if (!UUID.test(id)) return new Response('Rekaman tidak ditemukan.', { status: 404 });

    // Satu query sekaligus memastikan rekaman milik keluarga ini; selain itu 404 (tidak membocorkan keberadaan).
    const record = await db.dailyRecord.findFirst({
      where: { id, lansia: { householdId: household.id } },
      select: { rawData: true, tipeInput: true },
    });
    if (!record) return new Response('Rekaman tidak ditemukan.', { status: 404 });

    let buffer;
    if (record.rawData) buffer = Buffer.from(record.rawData.replace(/^data:[^;]+;base64,/, '').trim(), 'base64');
    else if (record.tipeInput === 'VOICE_NOTE' && demoAktif()) buffer = generateDemoWav(); // data contoh demo, tanpa audio asli
    else return new Response('Audio tidak tersedia untuk aktivitas ini.', { status: 404 });

    const headers = { 'Content-Type': 'audio/wav', 'Accept-Ranges': 'bytes', 'Cache-Control': 'private, max-age=86400' };
    const range = /^bytes=(\d*)-(\d*)$/.exec(request.headers.get('range') ?? '');
    if (range && (range[1] || range[2])) {
      const total = buffer.length;
      const start = range[1] ? Number(range[1]) : Math.max(total - Number(range[2]), 0); // "-N" = N byte terakhir
      const end = range[1] && range[2] ? Math.min(Number(range[2]), total - 1) : total - 1;
      if (start > end || start >= total) return new Response(null, { status: 416, headers: { 'Content-Range': `bytes */${total}` } });
      const potongan = buffer.subarray(start, end + 1);
      return new Response(potongan, { status: 206, headers: { ...headers, 'Content-Range': `bytes ${start}-${end}/${total}`, 'Content-Length': String(potongan.length) } });
    }
    return new Response(buffer, { headers: { ...headers, 'Content-Length': String(buffer.length) } });
  } catch (error) {
    const auth = authResponse(error);
    if (auth) return auth;
    console.error('GET /api/audio/[id]:', error);
    return new Response('Gagal memuat audio.', { status: 500 });
  }
}
