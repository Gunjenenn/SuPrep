import { ComingSoon } from '@/components/ComingSoon';
import { getT } from '@/lib/i18n';

// Section C · C3
export default function HardPage() {
  const t = getT('practice');
  return <ComingSoon section="C" title={t('pages.hard.title')} tasks="C3" />;
}
