import { ComingSoon } from '@/components/ComingSoon';
import { getT } from '@/lib/i18n';

// Section F · F5
export default function ProgressPage() {
  const t = getT('progress');
  return <ComingSoon section="F" title={t('pages.progress.title')} tasks="F5" />;
}
