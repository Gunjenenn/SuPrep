import { ComingSoon } from '@/components/ComingSoon';
import { getT } from '@/lib/i18n';

// Section E · E2
export default function CardsPage() {
  const t = getT('cards');
  return <ComingSoon section="E" title={t('pages.cards.title')} tasks="E2" />;
}
