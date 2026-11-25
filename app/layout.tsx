import type { ReactNode } from 'react';
import { Instrument_Sans, Instrument_Serif, IBM_Plex_Mono } from 'next/font/google';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Sidebar from '@/components/Sidebar';
import RealtimeBoot from '@/components/RealtimeBoot';
import './globals.css';

const instrumentSans = Instrument_Sans({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  variable: '--font-instrument-sans',
  display: 'swap',
});

const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  variable: '--font-instrument-serif',
  display: 'swap',
});

const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-plex-mono',
  display: 'swap',
});

export const metadata = {
  title: 'Movara OS',
  description: 'Movara Solutions operating system',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    title: 'Movara',
    statusBarStyle: 'black-translucent',
  },
  icons: {
    icon: [
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
  },
  other: {
    'mobile-web-app-capable': 'yes',
  },
};

// themeColor belongs in viewport export (Next.js 14.1+)
export const viewport = {
  themeColor: '#0d0d0d',
  width: 'device-width',
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Unauthenticated — render login page without the app shell
  if (!user) {
    const isLoginRoute =
      typeof globalThis !== 'undefined' &&
      (globalThis as Record<string, unknown>).__NEXT_ROUTER_BASEPATH !== undefined;
    void isLoginRoute; // suppress unused
    return (
      <html lang="en-SG" className={`${instrumentSans.variable} ${instrumentSerif.variable} ${plexMono.variable}`}>
        <body>{children}</body>
      </html>
    );
  }

  // Fetch settings for sidebar brand name
  const { data: settings } = await supabase
    .from('settings')
    .select('company_name')
    .single();

  return (
    <html lang="en-SG" className={`${instrumentSans.variable} ${instrumentSerif.variable} ${plexMono.variable}`}>
      <body>
        <RealtimeBoot />
        <div className="app">
          <Sidebar companyName={settings?.company_name ?? 'Your Agency'} />
          <main className="main">{children}</main>
        </div>
      </body>
    </html>
  );
}
