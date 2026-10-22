import { ComingSoon } from '@/components/ComingSoon';
import { getT } from '@/lib/i18n';

// Section F · F4
export default function AchievementsPage() {
  const t = getT('progress');
  return <ComingSoon section="F" title={t('pages.achievements.title')} tasks="F4" />;
}
