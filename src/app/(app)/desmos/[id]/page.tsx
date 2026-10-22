import { ComingSoon } from '@/components/ComingSoon';
import { getT } from '@/lib/i18n';

// Section B · B3 · B4 · B5
export default async function DesmosLessonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const t = getT('desmos');
  return <ComingSoon section="B" title={t('pages.desmosLesson.title')} tasks="B3 · B4 · B5" detail={id} />;
}
