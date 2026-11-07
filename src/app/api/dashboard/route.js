import { connection, NextResponse } from 'next/server';
import { authResponse, requireMember } from '@/lib/auth';
import { listRecords, lokasiTerakhir } from '@/services/record.service';
import { lansiaMilik, ringkasKeluarga } from '@/services/household.service';

// Semua data dashboard keluarga dalam satu panggilan (di-poll tiap 5 detik):
// diri sendiri + peran, keluarga, daftar lansia (+ kabar terakhir), anggota, dan log lansia yang dipilih.
// Kode (undangan/pairing) hanya dikirim ke admin.
export async function GET(request) {
  await connection(); // tandai dinamis: handler ini membaca cookie sesi
  try {
    const { member, household } = await requireMember(request);
    const admin = member.role === 'ADMIN';
    const { lansia, members } = await ringkasKeluarga(household.id);

    const diminta = new URL(request.url).searchParams.get('lansia');
    const dipilih = (diminta && (await lansiaMilik(household.id, diminta))) || lansia[0] || null;
    const [records, lokasi] = dipilih ? await Promise.all([listRecords({ lansiaId: dipilih.id, limit: 200 }), lokasiTerakhir(dipilih.id)]) : [[], null];

    return NextResponse.json({
      me: { id: member.id, nama: member.nama, role: member.role },
      household: { nama: household.nama, ...(admin && { kodeUndangan: household.kodeUndangan }) },
      lansia: lansia.map((l) => ({
        id: l.id,
        nama: l.nama,
        terhubungAt: l.terhubungAt,
        terakhir: l.records[0] ?? null,
        ...(admin && { kodePairing: l.kodePairing }),
      })),
      members: members.map((m) => ({ id: m.id, nama: m.nama, role: m.role })),
      dipilihId: dipilih?.id ?? null,
      records,
      lokasiTerakhir: lokasi, // semua anggota (admin dan pemantau) boleh melihat
    });
  } catch (error) {
    const auth = authResponse(error);
    if (auth) return auth;
    console.error('GET /api/dashboard:', error);
    return NextResponse.json({ error: 'Gagal memuat dashboard.' }, { status: 500 });
  }
}
