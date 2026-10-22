import { ComingSoon } from '@/components/ComingSoon';
import { getT } from '@/lib/i18n';

// Section E · E6
export default function MyCardsPage() {
  const t = getT('cards');
  return <ComingSoon section="E" title={t('pages.myCards.title')} tasks="E6" />;
}
