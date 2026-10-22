import { ComingSoon } from '@/components/ComingSoon';
import { getT } from '@/lib/i18n';

// Section I · I5
export default function HelpPage() {
  const t = getT('home');
  return <ComingSoon section="I" title={t('pages.help.title')} tasks="I5" />;
}
