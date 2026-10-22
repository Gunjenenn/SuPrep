// Supabase client for Server Components, Server Actions and Route Handlers.
import { createServerClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import { hasSupabase, publicEnv } from '@/lib/env';

/** null when Supabase is not configured → callers fall back to src/mocks. */
export async function getDb(): Promise<SupabaseClient | null> {
  if (!hasSupabase()) return null;
  const { cookies } = await import('next/headers');
  const store = await cookies();
  const { supabaseUrl, supabaseAnonKey } = publicEnv();
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list) => {
        try {
          for (const { name, value, options } of list) store.set(name, value, options);
        } catch {
          // called from a Server Component: cookies are read-only there, middleware refreshes them
        }
      },
    },
  });
}
