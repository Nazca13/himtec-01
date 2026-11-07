export default function manifest() {
  return {
    id: '/',
    name: 'SAPA - Sistem Asisten Pantau Aktif',
    short_name: 'SAPA',
    description: 'Pantau lansia jarak jauh tanpa membebani lansia dengan teknologi.',
    start_url: '/?source=pwa',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#ffffff',
    theme_color: '#ffffff',
    lang: 'id',
    categories: ['health', 'medical', 'lifestyle'],
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
    shortcuts: [
      { name: 'Pusat pantau keluarga', short_name: 'Keluarga', url: '/pengawas', icons: [{ src: '/icon-96.png', sizes: '96x96' }] },
      { name: 'Riwayat', url: '/pengawas/riwayat', icons: [{ src: '/icon-96.png', sizes: '96x96' }] },
    ],
  };
}
