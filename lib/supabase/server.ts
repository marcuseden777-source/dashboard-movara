import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/types';

export async function createClient() {
  const cookieStore = await cookies();
  // Cast needed: @supabase/ssr passes Schema as the 3rd type arg to SupabaseClient,
  // but supabase-js v2 has 5 type params where 3rd is SchemaName (a string), not Schema.
  // SupabaseClient<Database, 'public'> correctly defaults all 5 params.
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {}
        },
      },
    }
  ) as unknown as SupabaseClient<Database, 'public'>;
}
