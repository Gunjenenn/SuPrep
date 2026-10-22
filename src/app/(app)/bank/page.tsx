import { ComingSoon } from '@/components/ComingSoon';
import { getT } from '@/lib/i18n';

// Section C · C2
export default function BankPage() {
  const t = getT('practice');
  return <ComingSoon section="C" title={t('pages.bank.title')} tasks="C2" />;
}
