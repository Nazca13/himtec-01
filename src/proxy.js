import { NextResponse } from 'next/server';

// Disalin dari src/lib/roles.js: proxy berjalan terpisah dari kode render, jangan impor modul bersama.
const HOME = { lansia: '/lansia', pengawas: '/pengawas' };

// Perangkat yang sudah memilih peran langsung dialihkan di server: tidak ada kedipan halaman pemilih.
export function proxy(request) {
  const { searchParams } = request.nextUrl;
  if (searchParams.has('ganti')) return NextResponse.next();

  const target = HOME[request.cookies.get('sapa-role')?.value];
  if (!target) return NextResponse.next();

  return NextResponse.redirect(new URL(target, request.url));
}

export const config = { matcher: '/' };
