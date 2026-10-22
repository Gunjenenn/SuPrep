import { ComingSoon } from '@/components/ComingSoon';
import { getT } from '@/lib/i18n';

// Section E · E3 · E4
export default async function DeckPage({ params }: { params: Promise<{ deck: string }> }) {
  const { deck } = await params;
  const t = getT('cards');
  return <ComingSoon section="E" title={t('pages.deck.title')} tasks="E3 · E4" detail={deck} />;
}
