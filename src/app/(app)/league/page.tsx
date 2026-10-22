import { ComingSoon } from '@/components/ComingSoon';
import { getT } from '@/lib/i18n';

// Section F · F6
export default function LeaguePage() {
  const t = getT('progress');
  return <ComingSoon section="F" title={t('pages.league.title')} tasks="F6" />;
}
