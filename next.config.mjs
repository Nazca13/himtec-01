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
          // HTTPS wajib selama 2 tahun (Vercel selalu HTTPS; header diabaikan di http://localhost).
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
          // Mikrofon (pesan suara), lokasi (lokasi terakhir), dan autoplay sirine ambulans darurat.
          { key: 'Permissions-Policy', value: 'microphone=(self), geolocation=(self), camera=(), autoplay=(self)' },
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
