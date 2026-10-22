// Section I · profile.
import { getDb } from '@/lib/supabase/server';
import type { Profile } from '@/types';

export const DEMO_PROFILE: Profile = {
  id: 'u-demo',
  name: 'Тэмүүлэн',
  onboarded: true,
  target: 700,
  examDate: '2026-12-05',
  start: 'english',
};

export async function getProfile(): Promise<Profile> {
  const db = await getDb();
  if (!db) return DEMO_PROFILE;
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) return { ...DEMO_PROFILE, id: 'anon', name: '', onboarded: false };
  const { data, error } = await db.from('profiles').select('*').eq('id', user.id).maybeSingle();
  if (error) throw error;
  return (data as Profile) ?? { ...DEMO_PROFILE, id: user.id, name: '', onboarded: false };
}
