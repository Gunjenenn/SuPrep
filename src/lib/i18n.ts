// Tiny i18n: nested JSON messages, "{name}" interpolation, key fallback.
// Works in Server Components (getT) and Client Components (useT in i18n-client.tsx).
import { MESSAGES } from '@/messages';

export type Locale = 'mn' | 'en';
export const LOCALES: Locale[] = ['mn', 'en'];
export const DEFAULT_LOCALE: Locale = 'mn';

export type Messages = { [key: string]: string | Messages };
export type Vars = Record<string, string | number>;
export type T = (key: string, vars?: Vars) => string;

export function lookup(messages: Messages, path: string): string | undefined {
  let cur: string | Messages | undefined = messages;
  for (const part of path.split('.')) {
    if (cur === undefined || typeof cur === 'string') return undefined;
    cur = cur[part];
  }
  return typeof cur === 'string' ? cur : undefined;
}

export function format(template: string, vars?: Vars): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? String(vars[k]) : m));
}

/** Translator for one namespace ("common", "cards", …). Missing keys fall back to mn, then to the key. */
export function makeT(messages: Messages, ns?: string, fallback?: Messages): T {
  return (key, vars) => {
    const path = ns ? `${ns}.${key}` : key;
    const hit = lookup(messages, path) ?? (fallback ? lookup(fallback, path) : undefined);
    return format(hit ?? path, vars);
  };
}

export function getMessages(locale: Locale): Messages {
  return MESSAGES[locale] ?? MESSAGES[DEFAULT_LOCALE];
}

export function getT(ns?: string, locale: Locale = DEFAULT_LOCALE): T {
  return makeT(getMessages(locale), ns, getMessages(DEFAULT_LOCALE));
}
