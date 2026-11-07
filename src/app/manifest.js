export default function manifest() {
  return {
    name: 'SAPA - Sistem Asisten Pantau Aktif',
    short_name: 'SAPA',
    description: 'Pantau lansia jarak jauh tanpa membebani lansia dengan teknologi.',
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#ebf5fb',
    theme_color: '#112a46',
    lang: 'id',
    icons: [
      { src: '/icon-192', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icon-512', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icon-512', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
