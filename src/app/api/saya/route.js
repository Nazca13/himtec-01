import { connection, NextResponse } from 'next/server';
import { SESSION_COOKIE, verifySession } from '@/lib/session';
import { getHousehold } from '@/services/household.service';
import { ringkasanHarian } from '@/services/record.service';
import { bagianHari, sapaanLokal } from '@/services/mascot.service';

// Keadaan HP lansia: nama, sudah memberi kabar hari ini, hitungan hari berturut-turut, dan sapaan awal.
// Tidak melempar 401: sesi kosong = { role: null } (halaman memutuskan sendiri).
export async function GET(request) {
  await connection(); // tandai dinamis: handler ini membaca cookie sesi
  const session = await verifySession(request.cookies.get(SESSION_COOKIE.lansia)?.value).catch(() => null);
  const household = session && (await getHousehold(session.h));
  if (!household || session.v !== household.lansiaVersion) return NextResponse.json({ role: null });

  const harian = await ringkasanHarian(household.id);
  const nama = household.namaLansia;
  return NextResponse.json({ role: 'lansia', namaLansia: nama, ...harian, sapaan: sapaanLokal({ nama, bagian: bagianHari(), ...harian }) });
}
