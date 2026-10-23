import { JourneyMap } from '@/features/journey/components/JourneyMap';
import { getProgress, type LessonProgress, listStages } from '@/features/journey/queries';
import { getDb } from '@/lib/supabase/server';

export default async function JourneyPage() {
  const stages = await listStages();
  const db = await getDb();

  let progress: LessonProgress[] = [];
  if (db) {
    const {
      data: { user },
      error,
    } = await db.auth.getUser();

    if (!error && user) {
      progress = await getProgress(user.id);
    }
  }

  return <JourneyMap stages={stages} progress={progress} />;
}
