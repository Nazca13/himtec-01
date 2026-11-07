import { Inter } from 'next/font/google';
import MotionProvider from '@/components/MotionProvider';
import RegisterSW from '@/components/RegisterSW';
import './globals.css';

// Font sistem dulu (SF di perangkat Apple); Inter sebagai cadangan yang mirip di Android/Windows.
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata = {
  title: 'SAPA - Sistem Asisten Pantau Aktif',
  description: 'Pantau lansia jarak jauh tanpa membebani lansia dengan teknologi.',
  applicationName: 'SAPA',
  icons: { icon: '/icon-96.png', apple: '/apple-touch-icon.png' },
  appleWebApp: { capable: true, title: 'SAPA', statusBarStyle: 'default' },
};

export const viewport = {
  themeColor: '#f2f2f7',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={inter.variable}>
      <body>
        <MotionProvider>{children}</MotionProvider>
        <RegisterSW />
      </body>
    </html>
  );
}
