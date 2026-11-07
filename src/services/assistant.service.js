import { getGemini } from '@/lib/gemini';
import { orca, ORCA_MODEL } from '@/lib/orca';
import { GEMINI_MODEL, STATUS_LABEL, TIPE_LABEL } from '@/lib/constants';
import { listRecords } from './record.service';

const INSTRUCTION = `Kamu asisten keluarga untuk memantau lansia. Jawab dalam Bahasa Indonesia, ringkas dan hangat.
Gunakan HANYA data log di bawah. Jika data tidak cukup, katakan terus terang. Jangan mendiagnosis penyakit.
Tandai hal yang butuh tindakan keluarga.`;

const DAYS_BACK = 7;

const wib = (d) =>
  new Intl.DateTimeFormat('id-ID', {
    timeZone: 'Asia/Jakarta',
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(d);

function buildContext(records) {
  if (!records.length) return 'Belum ada log aktivitas.';
  return records
    .map((r) => {
      const ringkasan = r.aiAnalysis?.ringkasan ? ` | ${r.aiAnalysis.ringkasan}` : '';
      return `${wib(r.createdAt)} WIB | ${TIPE_LABEL[r.tipeInput]} | ${STATUS_LABEL[r.statusBahaya]}${ringkasan}`;
    })
    .join('\n');
}

export async function askAssistant(question) {
  const since = new Date(Date.now() - DAYS_BACK * 24 * 60 * 60 * 1000);
  const records = await listRecords({ limit: 100, since });
  const context = buildContext(records);
  const prompt = `Log ${DAYS_BACK} hari terakhir (terbaru di atas):\n${context}\n\nPertanyaan pengawas: ${question}`;

  const ai = getGemini();
  if (ai) {
    try {
      const res = await ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: prompt,
        config: { systemInstruction: INSTRUCTION },
      });
      return res.text;
    } catch (err) {
      console.error('Gemini asisten gagal, coba Orca:', err);
    }
  }

  if (process.env.ORCA_API_KEY) {
    const res = await orca.chat.completions.create({
      model: ORCA_MODEL,
      messages: [
        { role: 'system', content: INSTRUCTION },
        { role: 'user', content: prompt },
      ],
    });
    return res.choices[0].message.content;
  }

  throw new Error('Tidak ada penyedia AI yang aktif. Isi GEMINI_API_KEY atau ORCA_API_KEY.');
}
