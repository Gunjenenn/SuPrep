import { ComingSoon } from '@/components/ComingSoon';
import { getT } from '@/lib/i18n';

// Section I · I4
export default function PlannerPage() {
  const t = getT('planner');
  return <ComingSoon section="I" title={t('pages.planner.title')} tasks="I4" />;
}
