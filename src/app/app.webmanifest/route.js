// Manifest PWA khusus app lansia. Halaman keluarga adalah web biasa: tidak menautkan manifest,
// jadi browser tidak menawarkan "Install" di sana.
export function GET() {
  return Response.json(
    {
      id: '/lansia',
      name: 'SAPA - Teman Harian',
      short_name: 'SAPA',
      description: 'Satu ketukan untuk memberi kabar ke keluarga.',
      start_url: '/lansia',
      scope: '/',
      display: 'standalone',
      orientation: 'portrait',
      background_color: '#ebf5fb',
      theme_color: '#ebf5fb',
      lang: 'id',
      categories: ['health', 'medical', 'lifestyle'],
      icons: [
        { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
        { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
        { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      ],
    },
    { headers: { 'Content-Type': 'application/manifest+json' } }
  );
}
