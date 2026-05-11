import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Sidebar from '@/components/Sidebar';
import RealtimeBoot from '@/components/RealtimeBoot';
import './globals.css';

export const metadata = {
  title: 'Movara Dashboard',
  description: 'AI agency operations dashboard',
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
      <html lang="en">
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
    <html lang="en">
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
