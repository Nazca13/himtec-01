import { NextResponse } from 'next/server';
import { authResponse, requireMember } from '@/lib/auth';
import { anggotaMilik, AturanError, keluarkanAnggota, ubahPeran } from '@/services/household.service';

const PERAN = new Set(['ADMIN', 'PEMANTAU']);

// Admin mengubah peran anggota (pemantau <-> admin).
export async function PATCH(request, { params }) {
  try {
    const { household } = await requireMember(request, { admin: true });
    const { role } = await request.json();
    if (!PERAN.has(role)) return NextResponse.json({ error: 'Peran harus ADMIN atau PEMANTAU.' }, { status: 400 });
    const target = await anggotaMilik(household.id, (await params).id);
    if (!target) return NextResponse.json({ error: 'Anggota tidak ditemukan.' }, { status: 404 });
    const updated = await ubahPeran(target, role);
    return NextResponse.json({ member: { id: updated.id, nama: updated.nama, role: updated.role } });
  } catch (error) {
    const auth = authResponse(error);
    if (auth) return auth;
    if (error instanceof AturanError) return NextResponse.json({ error: error.message }, { status: 400 });
    console.error('PATCH /api/anggota/[id]:', error);
    return NextResponse.json({ error: 'Gagal mengubah peran.' }, { status: 500 });
  }
}

// Admin mengeluarkan anggota, atau anggota keluar sendiri. Sesi anggota itu langsung tidak berlaku.
export async function DELETE(request, { params }) {
  try {
    const { member, household } = await requireMember(request);
    const id = (await params).id;
    if (member.role !== 'ADMIN' && member.id !== id) return NextResponse.json({ error: 'Hanya admin yang boleh mengeluarkan anggota lain.' }, { status: 403 });
    const target = await anggotaMilik(household.id, id);
    if (!target) return NextResponse.json({ error: 'Anggota tidak ditemukan.' }, { status: 404 });
    await keluarkanAnggota(target);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const auth = authResponse(error);
    if (auth) return auth;
    if (error instanceof AturanError) return NextResponse.json({ error: error.message }, { status: 400 });
    console.error('DELETE /api/anggota/[id]:', error);
    return NextResponse.json({ error: 'Gagal mengeluarkan anggota.' }, { status: 500 });
  }
}
