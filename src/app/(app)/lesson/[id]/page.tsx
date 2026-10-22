import { notFound } from 'next/navigation';
import { LessonPlayer } from '@/features/journey/components/LessonPlayer';
import { getLesson } from '@/features/journey/queries';

export default async function LessonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lesson = await getLesson(id);

  if (!lesson) {
    notFound();
  }

  return <LessonPlayer lesson={lesson} />;
}
