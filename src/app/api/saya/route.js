import { connection, NextResponse } from 'next/server';
import { requireLansia } from '@/lib/auth';
import { ringkasanHarian } from '@/services/record.service';
import { bagianHari, sapaanLokal } from '@/services/mascot.service';

// Keadaan HP lansia: nama, sudah memberi kabar hari ini, hitungan hari berturut-turut, sapaan awal.
// Tidak melempar 401: sesi kosong = { role: null } (halaman memutuskan sendiri).
export async function GET(request) {
  await connection(); // tandai dinamis: handler ini membaca cookie sesi
  const { lansia } = await requireLansia(request).catch(() => ({}));
  if (!lansia) return NextResponse.json({ role: null });
  const harian = await ringkasanHarian(lansia.id);
  return NextResponse.json({ role: 'lansia', namaLansia: lansia.nama, ...harian, sapaan: sapaanLokal({ nama: lansia.nama, bagian: bagianHari(), ...harian }) });
}
