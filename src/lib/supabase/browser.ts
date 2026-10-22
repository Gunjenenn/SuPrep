'use client';
import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import { hasSupabase, publicEnv } from '@/lib/env';

let client: SupabaseClient | null = null;

/** Browser client (Realtime, auth UI). null when Supabase is not configured. */
export function getBrowserDb(): SupabaseClient | null {
  if (!hasSupabase()) return null;
  if (!client) {
    const { supabaseUrl, supabaseAnonKey } = publicEnv();
    client = createBrowserClient(supabaseUrl, supabaseAnonKey);
  }
  return client;
}
