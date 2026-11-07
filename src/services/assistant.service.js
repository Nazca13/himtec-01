import { tanpaMarkdown } from '@/lib/format';
import { getOrca, ORCA_TEXT_MODEL } from '@/lib/orca';
import { STATUS_LABEL, TIPE_LABEL } from '@/lib/constants';
import { formatWaktu } from '@/lib/format';
import { listRecords } from './record.service';

const INSTRUCTION = `Kamu asisten keluarga untuk memantau lansia. Jawab dalam Bahasa Indonesia, ringkas dan hangat.
Gunakan HANYA data log di bawah. Jika data tidak cukup, katakan terus terang. Jangan mendiagnosis penyakit.
Tandai hal yang butuh tindakan keluarga.`;

const DAYS_BACK = 7;

function buildContext(records) {
  if (!records.length) return 'Belum ada log aktivitas.';
  return records
    .map((r) => {
      const ringkasan = r.aiAnalysis?.ringkasan ? ` | ${r.aiAnalysis.ringkasan}` : '';
      return `${formatWaktu(r.createdAt)} | ${TIPE_LABEL[r.tipeInput]} | ${STATUS_LABEL[r.statusBahaya]}${ringkasan}`;
    })
    .join('\n');
}

export async function askAssistant({ question, lansia }) {
  const orca = getOrca();
  if (!orca) throw new Error('ORCA_API_KEY belum diisi.');

  const since = new Date(Date.now() - DAYS_BACK * 24 * 60 * 60 * 1000);
  const records = await listRecords({ lansiaId: lansia.id, limit: 100, since });
  const prompt = `Lansia yang dipantau: ${lansia.nama}.\nLog ${DAYS_BACK} hari terakhir (terbaru di atas):\n${buildContext(records)}\n\nPertanyaan pengawas: ${question}`;

  const res = await orca.chat.completions.create({
    model: ORCA_TEXT_MODEL,
    messages: [
      { role: 'system', content: INSTRUCTION },
      { role: 'user', content: prompt },
    ],
  });
  return tanpaMarkdown(res.choices[0].message.content);
}
