import { getOrca, ORCA_TEXT_MODEL } from '@/lib/orca';
import { STATUS_LABEL, TIPE_LABEL } from '@/lib/constants';
import { formatWaktu, hariKey, wib } from '@/lib/format';

const INSTRUCTION_MASKOT = `Kamu SAPA, burung hantu maskot yang menjadi teman harian seorang lansia.
Bicara sangat sederhana, hangat, kalimat pendek, maksimal 2 kalimat (30 kata). Sebut nama lansia.
Tanpa emoji, tanpa istilah medis, tanpa tanda seru berlebihan.
Jika belum memberi kabar hari ini: ajak menekan tombol hijau "Saya Aman".
Jika sudah: puji dan ucapkan terima kasih. Jika streak lebih dari 1 hari: sebut berapa hari berturut-turut.
Jika status hari ini MERAH: tenangkan dan katakan keluarga sudah diberi tahu.`;

const INSTRUCTION_RINGKASAN = `Kamu asisten untuk keluarga yang memantau seorang lansia. Tulis ringkasan kondisi lansia dalam Bahasa Indonesia:
2 sampai 3 kalimat, hangat dan jelas. Gunakan HANYA data yang diberikan. Jangan mendiagnosis.
Akhiri dengan satu saran tindakan konkret jika perlu (mis. menelepon, membelikan obat); jika semua baik, katakan tidak ada yang perlu dilakukan.`;

const TIMEOUT_MS = 6000;
const cache = new Map(); // shortcut: cache memori satu proses; ganti Redis bila multi-instance

const withTimeout = (promise) => Promise.race([promise, new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), TIMEOUT_MS))]);

async function ask(system, user, maxTokens = 160) {
  const orca = getOrca();
  if (!orca) throw new Error('ORCA_API_KEY belum diisi');
  const res = await withTimeout(
    orca.chat.completions.create({ model: ORCA_TEXT_MODEL, max_tokens: maxTokens, messages: [{ role: 'system', content: system }, { role: 'user', content: user }] })
  );
  return res.choices[0].message.content.trim();
}

export function bagianHari(date = new Date()) {
  const jam = Number(new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Jakarta', hour: '2-digit', hourCycle: 'h23' }).format(date));
  return jam < 4 ? 'malam' : jam < 11 ? 'pagi' : jam < 15 ? 'siang' : jam < 18 ? 'sore' : 'malam';
}

// Sapaan lokal: dipakai saat AI belum siap atau gagal, supaya maskot tidak pernah diam.
export function sapaanLokal({ nama, bagian, sudahHariIni, streak, statusHariIni }) {
  if (statusHariIni === 'MERAH') return `Tenang ya, ${nama}. Keluarga sudah diberi tahu dan akan segera menghubungi.`;
  if (sudahHariIni) return streak > 1 ? `Terima kasih, ${nama}. Sudah ${streak} hari berturut-turut keluarga tahu ${nama} baik-baik saja.` : `Terima kasih, ${nama}. Keluarga sudah tahu kabar hari ini.`;
  return `Selamat ${bagian}, ${nama}. Tekan tombol hijau kalau ${nama} baik-baik saja ya.`;
}

// Pesan maskot di HP lansia, dibuat AI. Di-cache per keadaan (bagian hari, sudah/belum, status) selama 30 menit.
export async function pesanMaskot({ lansiaId, nama, sudahHariIni, streak, statusHariIni }) {
  const bagian = bagianHari();
  const input = { nama, bagian, sudahHariIni, streak, statusHariIni };
  const key = `maskot:${lansiaId}:${hariKey(new Date())}:${bagian}:${sudahHariIni}:${statusHariIni}:${Math.min(streak, 7)}`;
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < 30 * 60 * 1000) return { pesan: hit.text, sumber: 'ai' };
  try {
    const text = await ask(INSTRUCTION_MASKOT, `Data: ${JSON.stringify(input)}`, 90);
    cache.set(key, { text, at: Date.now() });
    return { pesan: text, sumber: 'ai' };
  } catch {
    return { pesan: sapaanLokal(input), sumber: 'lokal' };
  }
}

// Ringkasan live untuk dashboard keluarga. Kuncinya memuat id log terbaru: ringkasan dibuat ulang hanya saat ada kabar baru.
export async function ringkasanKeluarga({ lansia, records }) {
  if (!records.length) return { ringkasan: `Belum ada kabar dari ${lansia.nama}. Ringkasan muncul setelah ada tombol yang ditekan.`, sumber: 'lokal' };
  const key = `ringkasan:${lansia.id}:${records[0].id}`;
  const hit = cache.get(key);
  if (hit) return { ringkasan: hit.text, sumber: 'ai' };
  const baris = records
    .slice(0, 30)
    .map((r) => `${formatWaktu(r.createdAt)} | ${TIPE_LABEL[r.tipeInput]} | ${STATUS_LABEL[r.statusBahaya]}${r.aiAnalysis?.ringkasan ? ` | ${r.aiAnalysis.ringkasan}` : ''}`)
    .join('\n');
  try {
    const text = await ask(INSTRUCTION_RINGKASAN, `Lansia: ${lansia.nama}\nWaktu sekarang: ${wib(new Date())} WIB\nLog terbaru di atas:\n${baris}`, 220);
    cache.set(key, { text, at: Date.now() });
    if (cache.size > 500) cache.delete(cache.keys().next().value);
    return { ringkasan: text, sumber: 'ai' };
  } catch {
    const r = records[0];
    return { ringkasan: `Kabar terakhir dari ${lansia.nama}: ${r.aiAnalysis?.ringkasan ?? r.tipeInput}. Ringkasan AI sedang tidak tersedia.`, sumber: 'lokal' };
  }
}
