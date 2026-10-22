import type { CardArt } from '@/types';

export const ART_KINDS = [
  'merge',
  'split',
  'grid',
  'pie',
  'remainder',
  'line',
  'numberline',
  'perp',
  'circle',
  'triangle',
  'bars',
  'parabola',
  'cross',
  'dice',
  'power',
  'solid',
  'rect',
  'angle',
] as const satisfies readonly CardArt[];
