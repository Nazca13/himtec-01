import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';

const TZ = 'Asia/Jakarta';
const DAY = 24 * 60 * 60 * 1000;

export const hariKey = (d) => new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(d);
const jam = (d) =>
  new Intl.DateTimeFormat('id-ID', { timeZone: TZ, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
    .format(d)
    .replace('.', ':');

export const isHariIni = (value) => hariKey(new Date(value)) === hariKey(new Date());

// "Hari ini, 08:30 WIB" / "Kemarin, 21:05 WIB" / "5 Nov, 14:00 WIB"
export function formatWaktu(value) {
  const d = new Date(value);
  const key = hariKey(d);
  let hari;
  if (key === hariKey(new Date())) hari = 'Hari ini';
  else if (key === hariKey(new Date(Date.now() - DAY))) hari = 'Kemarin';
  else hari = new Intl.DateTimeFormat('id-ID', { timeZone: TZ, day: 'numeric', month: 'short' }).format(d);
  return `${hari}, ${jam(d)} WIB`;
}

export const formatLalu = (value) => formatDistanceToNow(new Date(value), { addSuffix: true, locale: id });

// "7 Nov 2026 10.51" untuk konteks AI: model membaca waktu manusiawi, bukan ISO mentah.
export const wib = (d) => new Intl.DateTimeFormat('id-ID', { timeZone: TZ, dateStyle: 'medium', timeStyle: 'short' }).format(d);

export const namaHari = (d) => new Intl.DateTimeFormat('id-ID', { timeZone: TZ, weekday: 'short' }).format(d);

// Jawaban AI kadang berisi markdown (**tebal**, "* butir") padahal UI menampilkan teks biasa.
export const tanpaMarkdown = (teks) =>
  String(teks ?? '')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/^\s*[*-]\s+/gm, '- ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
