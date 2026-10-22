import { ComingSoon } from '@/components/ComingSoon';
import { getT } from '@/lib/i18n';

// Section G · G4 · G5
export default function TutorPage() {
  const t = getT('tutor');
  return <ComingSoon section="G" title={t('pages.tutor.title')} tasks="G4 · G5" />;
}
