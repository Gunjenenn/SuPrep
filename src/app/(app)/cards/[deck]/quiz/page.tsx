import { ComingSoon } from '@/components/ComingSoon';
import { getT } from '@/lib/i18n';

// Section E · E5
export default async function DeckQuizPage({ params }: { params: Promise<{ deck: string }> }) {
  const { deck } = await params;
  const t = getT('cards');
  return <ComingSoon section="E" title={t('pages.deckQuiz.title')} tasks="E5" detail={deck} />;
}
