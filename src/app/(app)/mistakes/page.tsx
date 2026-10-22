import { ComingSoon } from '@/components/ComingSoon';
import { getT } from '@/lib/i18n';

// Section D · D5 · D6
export default function MistakesPage() {
  const t = getT('mistakes');
  return <ComingSoon section="D" title={t('pages.mistakes.title')} tasks="D5 · D6" />;
}
