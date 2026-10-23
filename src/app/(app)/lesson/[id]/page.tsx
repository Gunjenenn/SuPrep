import { notFound } from 'next/navigation';
import { CheckpointPlayer } from '@/features/journey/components/CheckpointPlayer';
import { LessonPlayer } from '@/features/journey/components/LessonPlayer';
import { getLesson } from '@/features/journey/queries';

export default async function LessonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lesson = await getLesson(id);

  if (!lesson) {
    notFound();
  }

  if (lesson.kind === 'checkpoint') {
    return <CheckpointPlayer lesson={lesson} />;
  }

  return <LessonPlayer lesson={lesson} />;
}
