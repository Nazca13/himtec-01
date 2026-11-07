import { Type } from '@google/genai';
import { getGemini } from '@/lib/gemini';
import { GEMINI_MODEL, STATUS } from '@/lib/constants';

const INSTRUCTION = `Kamu adalah perawat triase untuk pemantauan lansia jarak jauh.
Dengarkan rekaman suara lansia (Bahasa Indonesia, bisa tidak jelas atau berlogat daerah) lalu isi JSON.
Aturan statusBahaya:
- MERAH: jatuh, nyeri dada, sesak napas, wajah/tubuh lemah sebelah, bicara pelo, pingsan, perdarahan, minta tolong.
- KUNING: nyeri, pusing, mual, tidak nafsu makan, lupa minum obat, cemas, kesepian, atau rekaman tidak jelas.
- HIJAU: hanya jika jelas tidak ada keluhan.
Jika ragu, pilih tingkat yang lebih tinggi. Jangan mendiagnosis; ringkasan maksimal 2 kalimat untuk keluarga.`;

const SCHEMA = {
  type: Type.OBJECT,
  properties: {
    transkrip: { type: Type.STRING, description: 'Isi ucapan, apa adanya' },
    gejala: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Daftar gejala atau keluhan' },
    statusBahaya: { type: Type.STRING, enum: Object.values(STATUS) },
    ringkasan: { type: Type.STRING, description: 'Ringkasan singkat untuk keluarga' },
  },
  required: ['transkrip', 'gejala', 'statusBahaya', 'ringkasan'],
};

// Pesan tidak boleh hilang: jika AI mati, simpan sebagai KUNING agar keluarga tetap diberi tahu.
const fallback = (alasan) => ({
  statusBahaya: STATUS.KUNING,
  aiAnalysis: {
    fallback: true,
    alasan,
    gejala: [],
    ringkasan: 'Pesan suara diterima, tetapi analisis AI belum tersedia. Mohon hubungi lansia langsung.',
  },
});

// MediaRecorder memberi "audio/webm;codecs=opus"; Gemini hanya butuh tipe dasarnya.
const baseMime = (mime) => mime.split(';')[0].trim();

export async function triageAudio({ audioBase64, mimeType }) {
  const ai = getGemini();
  if (!ai) return fallback('GEMINI_API_KEY belum diisi');

  try {
    const res = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: [{ inlineData: { mimeType: baseMime(mimeType), data: audioBase64 } }],
      config: {
        systemInstruction: INSTRUCTION,
        responseMimeType: 'application/json',
        responseSchema: SCHEMA,
      },
    });
    const { statusBahaya, ...aiAnalysis } = JSON.parse(res.text);
    return {
      statusBahaya: Object.values(STATUS).includes(statusBahaya) ? statusBahaya : STATUS.KUNING,
      aiAnalysis,
    };
  } catch (err) {
    console.error('Triage gagal:', err);
    return fallback('Gemini gagal dipanggil');
  }
}
