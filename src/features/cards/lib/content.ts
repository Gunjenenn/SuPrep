import { z } from 'zod';
import type { Deck } from '@/types';
import { ART_KINDS } from '../art/kinds';

const text = z.string().trim().min(1);

export const CardSchema = z.object({
  id: text,
  front: text,
  ipa: text.optional(),
  say: text.optional(),
  back: text,
  hook: text.optional(),
  ex: text.optional(),
  tex: text.optional(),
  when: text.optional(),
  art: z.enum(ART_KINDS),
  v: text.optional(),
});

export const DeckSchema = z.object({
  id: text,
  kind: z.enum(['word', 'formula', 'mine']),
  title: text,
  sub: text,
  color: text,
  edge: text,
  cards: z.array(CardSchema).min(1),
});

export const ContentSchema = z.object({ decks: z.array(DeckSchema).min(1) });

export function parseDecks(json: unknown): Deck[] {
  return ContentSchema.parse(json).decks;
}

export const MyCardInput = z.object({
  front: z.string().trim().min(1, 'required').max(60, 'tooLong'),
  back: z.string().trim().min(1, 'required').max(80, 'tooLong'),
  hook: z.string().trim().max(200, 'tooLong').optional().default(''),
  ex: z.string().trim().max(160, 'tooLong').optional().default(''),
});

export type MyCardInput = z.infer<typeof MyCardInput>;
