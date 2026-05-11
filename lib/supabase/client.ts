'use client';
import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/types';

export function createClient() {
  // Same cast as server.ts — @supabase/ssr type params don't align with supabase-js v2.
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  ) as unknown as SupabaseClient<Database, 'public'>;
}
