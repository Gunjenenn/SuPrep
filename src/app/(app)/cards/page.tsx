import { DeckHub } from '@/features/cards/DeckHub';
import { countByStatus, summarizeDecks } from '@/features/cards/deck-hub';
import { getUserId, listDecks, listDueCards } from '@/features/cards/queries';

export default async function CardsPage() {
  const userId = await getUserId();
  const [decks, due] = await Promise.all([listDecks(), listDueCards(userId)]);
  return <DeckHub summaries={summarizeDecks(decks, due)} due={due.length} counts={countByStatus(due)} />;
}
