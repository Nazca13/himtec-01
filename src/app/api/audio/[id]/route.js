import { connection } from 'next/server';
import { authResponse, requireMember } from '@/lib/auth';
import { db } from '@/lib/db';

// Helper membuat suara WAV sintetis sederhana untuk data demo (chord hangat 1.5 detik)
function generateDemoWav(durationSec = 1.5, sampleRate = 16000) {
  const numSamples = Math.floor(durationSec * sampleRate);
  const dataSize = numSamples * 2;
  const buffer = Buffer.alloc(44 + dataSize);

  // WAV header
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // Subchunk1Size (16 for PCM)
  buffer.writeUInt16LE(1, 20); // AudioFormat (1 = PCM)
  buffer.writeUInt16LE(1, 22); // NumChannels (1 = mono)
  buffer.writeUInt32LE(sampleRate, 24); // SampleRate
  buffer.writeUInt32LE(sampleRate * 2, 28); // ByteRate
  buffer.writeUInt16LE(2, 32); // BlockAlign
  buffer.writeUInt16LE(16, 34); // BitsPerSample
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  // Generate pleasant harmonized vocal tones (440Hz A4 + 554.37Hz C#5 + 659.25Hz E5) with smooth envelope
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const env = Math.sin((Math.PI * i) / numSamples); // smooth bell curve envelope
    const s1 = Math.sin(2 * Math.PI * 330 * t);
    const s2 = Math.sin(2 * Math.PI * 440 * t) * 0.7;
    const s3 = Math.sin(2 * Math.PI * 660 * t) * 0.5;
    const sample = Math.max(-1, Math.min(1, (s1 + s2 + s3) * env * 0.45));
    buffer.writeInt16LE(Math.floor(sample * 32767), 44 + i * 2);
  }

  return buffer;
}

// Mengambil audio WAV dari rekaman suara lansia. Hanya anggota keluarga yang berhak mendengar.
export async function GET(request, { params }) {
  await connection();
  try {
    const { member, household } = await requireMember(request);
    const { id } = await params;

    const record = await db.dailyRecord.findUnique({
      where: { id },
      select: { rawData: true, lansiaId: true, tipeInput: true },
    });

    if (!record) {
      return new Response('Rekaman tidak ditemukan.', { status: 404 });
    }

    // Pastikan rekaman milik lansia di keluarga yang sama.
    const lansia = await db.lansia.findUnique({ where: { id: record.lansiaId } });
    if (!lansia || lansia.householdId !== household.id) {
      return new Response('Akses ditolak.', { status: 403 });
    }

    let buffer;
    if (record.rawData) {
      const cleanBase64 = record.rawData.replace(/^data:[^;]+;base64,/, '').trim();
      buffer = Buffer.from(cleanBase64, 'base64');
    } else if (record.tipeInput === 'VOICE_NOTE') {
      // Untuk catatan demo atau rekaman lama tanpa rawData, sediakan audio demo yang bisa diputar
      buffer = generateDemoWav();
    } else {
      return new Response('Audio tidak tersedia untuk aktivitas ini.', { status: 404 });
    }

    return new Response(buffer, {
      headers: {
        'Content-Type': 'audio/wav',
        'Content-Length': String(buffer.length),
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'private, max-age=86400',
      },
    });
  } catch (error) {
    const auth = authResponse(error);
    if (auth) return auth;
    console.error('GET /api/audio/[id]:', error);
    return new Response('Gagal memuat audio.', { status: 500 });
  }
}
