import { ComingSoon } from '@/components/ComingSoon';
import { getT } from '@/lib/i18n';

// Section I · I3
export default function DashboardPage() {
  const t = getT('home');
  return <ComingSoon section="I" title={t('pages.dashboard.title')} tasks="I3" />;
}
