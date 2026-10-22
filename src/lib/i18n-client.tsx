'use client';
import { createContext, type ReactNode, useContext, useMemo } from 'react';
import { DEFAULT_LOCALE, getMessages, type Locale, makeT, type T } from './i18n';

const LocaleContext = createContext<Locale>(DEFAULT_LOCALE);

export function I18nProvider({
  locale = DEFAULT_LOCALE,
  children,
}: {
  locale?: Locale;
  children: ReactNode;
}) {
  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>;
}

export function useLocale(): Locale {
  return useContext(LocaleContext);
}

/** const t = useT('cards'); t('study.know') */
export function useT(ns?: string): T {
  const locale = useLocale();
  return useMemo(() => makeT(getMessages(locale), ns, getMessages(DEFAULT_LOCALE)), [locale, ns]);
}
