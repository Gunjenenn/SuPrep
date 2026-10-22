import { ComingSoon } from '@/components/ComingSoon';
import { getT } from '@/lib/i18n';

// Section B · B5 · B6
export default function DesmosPage() {
  const t = getT('desmos');
  return <ComingSoon section="B" title={t('pages.desmos.title')} tasks="B5 · B6" />;
}
