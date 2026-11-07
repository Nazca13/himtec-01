import { Plus_Jakarta_Sans } from 'next/font/google';
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
  appleWebApp: { capable: true, title: 'SAPA', statusBarStyle: 'black-translucent' },
};

export const viewport = {
  themeColor: '#112a46',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={jakarta.variable}>
      <body>{children}</body>
    </html>
  );
}
