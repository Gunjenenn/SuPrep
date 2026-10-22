import type { DeckKind } from '@/types';

export const MY_DECK_ID = 'my';

export const reviewDeckId = (kind: DeckKind) => `review-${kind}`;
