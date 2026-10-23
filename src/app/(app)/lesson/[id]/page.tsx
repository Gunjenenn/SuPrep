import { notFound } from 'next/navigation';
import { CheckpointPlayer } from '@/features/journey/components/CheckpointPlayer';
import { LessonPlayer } from '@/features/journey/components/LessonPlayer';
import { getLesson } from '@/features/journey/queries';
import { getDb } from '@/lib/supabase/server';

export default async function LessonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lesson = await getLesson(id);

  if (!lesson) notFound();

  const db = await getDb();
  let demoMode = true;

  if (db) {
    const {
      data: { user },
      error,
    } = await db.auth.getUser();

    if (!error && user) {
      demoMode = false;
    }
  }

  if (lesson.kind === 'checkpoint') {
    return <CheckpointPlayer lesson={lesson} demoMode={demoMode} />;
  }

  return <LessonPlayer lesson={lesson} demoMode={demoMode} />;
}
