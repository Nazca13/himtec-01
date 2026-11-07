/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  experimental: {
    agentFeedback: true,
  },
  // Dev dari HP lewat IP jaringan lokal (mis. http://192.168.1.5:3000). Tanpa ini Next memblokir
  // skrip dev dari origin lain: halaman tampil tetapi tombol tidak bereaksi.
  allowedDevOrigins: ['192.168.*.*', '10.*.*.*', '172.*.*.*', '*.local'],
  cacheComponents: true,
  partialPrefetching: true,
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' }, // iframe hanya dari situs sendiri (mode demo)
          { key: 'Content-Security-Policy', value: "frame-ancestors 'self'" },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // Mikrofon (pesan suara) dan lokasi (lokasi terakhir) hanya untuk situs sendiri; kamera tidak dipakai.
          { key: 'Permissions-Policy', value: 'microphone=(self), geolocation=(self), camera=()' },
        ],
      },
      {
        // SW tidak boleh di-cache browser agar versi baru langsung terdeteksi.
        source: '/sw.js',
        headers: [
          { key: 'Content-Type', value: 'application/javascript; charset=utf-8' },
          { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
        ],
      },
    ];
  },
};

export default nextConfig;
