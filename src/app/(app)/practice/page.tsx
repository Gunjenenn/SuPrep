import { ComingSoon } from '@/components/ComingSoon';
import { getT } from '@/lib/i18n';

// Section C · C4 · C5
export default function PracticePage() {
  const t = getT('practice');
  return <ComingSoon section="C" title={t('pages.practice.title')} tasks="C4 · C5" />;
}
