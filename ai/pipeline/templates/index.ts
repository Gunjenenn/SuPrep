// All question templates, by SAT Math domain.
import { ADVANCED } from './advanced';
import { ALGEBRA } from './algebra';
import { DATA } from './data';
import { GEOMETRY } from './geometry';
import type { Template } from './shared';

export const TEMPLATES: Template[] = [...ALGEBRA, ...ADVANCED, ...DATA, ...GEOMETRY];
