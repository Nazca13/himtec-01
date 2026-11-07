// Satu sumber kebenaran untuk peran. Peran baru (mis. perawat) cukup ditambah di sini,
// lalu diberi rute dan ikon di RoleGateway.
export const ROLES = {
  lansia: {
    id: 'lansia',
    label: 'Saya Lansia',
    desc: 'Tiga tombol besar. Tanpa menu, tanpa login.',
    href: '/lansia',
  },
  pengawas: {
    id: 'pengawas',
    label: 'Saya Keluarga',
    desc: 'Pantau kondisi, baca riwayat, tanya asisten AI.',
    href: '/pengawas',
  },
};

// Cookie (bukan localStorage) agar proxy.js bisa mengalihkan di server sebelum halaman dirender.
export const ROLE_COOKIE = 'sapa-role';
