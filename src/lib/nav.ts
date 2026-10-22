// Sidebar / bottom-nav structure. Labels are keys in src/messages/*.json → nav.*
import { routes } from './routes';

export type NavItem = { key: string; href: string; section: string; mobile?: boolean };
export type NavGroup = { key: 'main' | 'practice' | 'materials' | 'me'; items: NavItem[] };

export const NAV: NavGroup[] = [
  {
    key: 'main',
    items: [
      { key: 'dashboard', href: routes.dashboard, section: 'I', mobile: true },
      { key: 'journey', href: routes.journey, section: 'A', mobile: true },
      { key: 'desmos', href: routes.desmosHome, section: 'B', mobile: true },
    ],
  },
  {
    key: 'practice',
    items: [
      { key: 'bank', href: routes.bank(), section: 'C' },
      { key: 'hard', href: routes.hard, section: 'C' },
      { key: 'mock', href: routes.mock, section: 'D' },
      { key: 'mistakes', href: routes.mistakes, section: 'D' },
    ],
  },
  {
    key: 'materials',
    items: [
      { key: 'cards', href: routes.cards, section: 'E', mobile: true },
      { key: 'tutor', href: routes.tutor(), section: 'G' },
      { key: 'planner', href: routes.planner, section: 'I' },
      { key: 'league', href: routes.league, section: 'F' },
      { key: 'help', href: routes.help, section: 'I' },
    ],
  },
  {
    key: 'me',
    items: [
      { key: 'progress', href: routes.progress, section: 'F' },
      { key: 'achievements', href: routes.achievements, section: 'F' },
    ],
  },
];

/** Active when the path is the item or below it (/cards/ops → cards). */
export function isActive(pathname: string, href: string): boolean {
  const base = href.split('?')[0];
  return pathname === base || pathname.startsWith(`${base}/`);
}
