import { ComingSoon } from '@/components/ComingSoon';
import { getT } from '@/lib/i18n';

// Section A · A3 · A4 · A5
export default async function LessonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const t = getT('journey');
  return <ComingSoon section="A" title={t('pages.lesson.title')} tasks="A3 · A4 · A5" detail={id} />;
}
