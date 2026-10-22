import { ComingSoon } from '@/components/ComingSoon';
import { getT } from '@/lib/i18n';

// Section D · D1 · D2 · D3 · D4
export default function MockPage() {
  const t = getT('exam');
  return <ComingSoon section="D" title={t('pages.mock.title')} tasks="D1 · D2 · D3 · D4" />;
}
