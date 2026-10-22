// Section I · push subscriptions (I6).
import { getDb } from '@/lib/supabase/server';

export type PushSub = { endpoint: string; createdAt: string };

export async function listOwnPushSubscriptions(): Promise<PushSub[]> {
  const db = await getDb();
  if (!db) return [];
  const { data, error } = await db.from('push_subscriptions').select('endpoint, created_at');
  if (error) throw error;
  return (data ?? []).map((r) => ({ endpoint: r.endpoint, createdAt: r.created_at }));
}
