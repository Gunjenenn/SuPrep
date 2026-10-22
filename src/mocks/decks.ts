import { parseDecks } from '@/features/cards/lib/content';
import type { Deck } from '@/types';
import formulas from '../../content/cards/formulas.json';
import words from '../../content/cards/words.json';

export const DECKS: Deck[] = [...parseDecks(words), ...parseDecks(formulas)];

export const ALL_CARDS = DECKS.flatMap((d) => d.cards.map((c) => ({ ...c, deck: d.id })));
export const deckById = (id: string) => DECKS.find((d) => d.id === id);
