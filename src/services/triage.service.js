import { getOrca, ORCA_AUDIO_MODEL } from '@/lib/orca';
import { STATUS } from '@/lib/constants';

const INSTRUCTION = `Kamu adalah perawat triase untuk pemantauan lansia jarak jauh.
Dengarkan rekaman suara lansia (Bahasa Indonesia, bisa tidak jelas atau berlogat daerah) lalu balas HANYA dengan JSON:
{"transkrip": string, "gejala": string[], "statusBahaya": "HIJAU" | "KUNING" | "MERAH", "ringkasan": string}
Aturan statusBahaya:
- MERAH: jatuh, nyeri dada, sesak napas, wajah/tubuh lemah sebelah, bicara pelo, pingsan, perdarahan, minta tolong.
- KUNING: nyeri, pusing, mual, tidak nafsu makan, lupa minum obat, cemas, kesepian, atau rekaman tidak jelas.
- HIJAU: hanya jika jelas tidak ada keluhan.
Jika ragu, pilih tingkat yang lebih tinggi. Jangan mendiagnosis; ringkasan maksimal 2 kalimat untuk keluarga.`;

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

// Klien mengirim WAV (lihat useRecorder); Gemini lewat OrcaRouter hanya menerima wav/mp3.
export async function triageAudio({ audioBase64 }) {
  const orca = getOrca();
  if (!orca) return fallback('ORCA_API_KEY belum diisi');

  try {
    const res = await orca.chat.completions.create({
      model: ORCA_AUDIO_MODEL,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: INSTRUCTION },
        { role: 'user', content: [{ type: 'input_audio', input_audio: { data: audioBase64, format: 'wav' } }] },
      ],
    });
    const { statusBahaya, ...aiAnalysis } = JSON.parse(res.choices[0].message.content);
    return {
      statusBahaya: Object.values(STATUS).includes(statusBahaya) ? statusBahaya : STATUS.KUNING,
      aiAnalysis,
    };
  } catch (err) {
    console.error('Triage gagal:', err);
    return fallback('OrcaRouter gagal dipanggil');
  }
}
