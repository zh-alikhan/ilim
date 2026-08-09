import type { Metadata, Viewport } from 'next';
import { Inter, Manrope } from 'next/font/google';
import { LocaleProvider } from '@/components/layout/LocaleProvider';
import './globals.css';

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-inter',
  display: 'swap',
});

const manrope = Manrope({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-manrope',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Ilim — Authentic Islamic Knowledge',
  description:
    'A curated digital library of authentic Islamic guidance for everyday life, grounded in the Quran, authentic hadith, and the words of respected scholars.',
  applicationName: 'Ilim',
  keywords: [
    'Islam',
    'Quran',
    'Hadith',
    'Islamic knowledge',
    'Islamic guidance',
  ],
  authors: [{ name: 'Ilim' }],
  robots: { index: true, follow: true },
  manifest: '/manifest.webmanifest',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#060a1c',
  colorScheme: 'dark',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${manrope.variable}`}>
      <body className="min-h-dvh bg-[#020308]">
        <LocaleProvider>{children}</LocaleProvider>
      </body>
    </html>
  );
}
