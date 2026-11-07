import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';

const TZ = 'Asia/Jakarta';
const DAY = 24 * 60 * 60 * 1000;

const dayKey = (d) => new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(d);
const jam = (d) =>
  new Intl.DateTimeFormat('id-ID', { timeZone: TZ, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
    .format(d)
    .replace('.', ':');

export const isHariIni = (value) => dayKey(new Date(value)) === dayKey(new Date());

// "Hari ini, 08:30 WIB" / "Kemarin, 21:05 WIB" / "5 Nov, 14:00 WIB"
export function formatWaktu(value) {
  const d = new Date(value);
  const key = dayKey(d);
  let hari;
  if (key === dayKey(new Date())) hari = 'Hari ini';
  else if (key === dayKey(new Date(Date.now() - DAY))) hari = 'Kemarin';
  else hari = new Intl.DateTimeFormat('id-ID', { timeZone: TZ, day: 'numeric', month: 'short' }).format(d);
  return `${hari}, ${jam(d)} WIB`;
}

export const formatLalu = (value) => formatDistanceToNow(new Date(value), { addSuffix: true, locale: id });
