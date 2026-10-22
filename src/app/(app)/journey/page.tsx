import { ComingSoon } from '@/components/ComingSoon';
import { getT } from '@/lib/i18n';

// Section A · A1 · A2
export default function JourneyPage() {
  const t = getT('journey');
  return <ComingSoon section="A" title={t('pages.journey.title')} tasks="A1 · A2" />;
}
