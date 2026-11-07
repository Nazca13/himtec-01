import { Plus_Jakarta_Sans } from 'next/font/google';
import MotionProvider from '@/components/MotionProvider';
import RegisterSW from '@/components/RegisterSW';
import './globals.css';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
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
  themeColor: '#ffffff',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={jakarta.variable}>
      <body>
        <MotionProvider>{children}</MotionProvider>
        <RegisterSW />
      </body>
    </html>
  );
}
