import { JourneyProgress } from '@/features/journey/components/JourneyProgress';
import { getProgress, type LessonProgress, listStages } from '@/features/journey/queries';
import { getDb } from '@/lib/supabase/server';

export default async function JourneyPage() {
  const stages = await listStages();
  const db = await getDb();

  let progress: LessonProgress[] = [];
  let demoMode = true;

  if (db) {
    const {
      data: { user },
      error,
    } = await db.auth.getUser();

    if (!error && user) {
      progress = await getProgress(user.id);
      demoMode = false;
    }
  }

  return <JourneyProgress stages={stages} progress={progress} demoMode={demoMode} />;
}
