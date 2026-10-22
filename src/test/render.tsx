// render() with the same providers as the app. Import everything from here in component tests:
//   import { render, screen, fireEvent } from '@/test/render';
import { type RenderOptions, render as rtlRender } from '@testing-library/react';
import type { ReactElement, ReactNode } from 'react';
import type { Locale } from '@/lib/i18n';
import { I18nProvider } from '@/lib/i18n-client';

export function Providers({ children, locale = 'mn' }: { children: ReactNode; locale?: Locale }) {
  return <I18nProvider locale={locale}>{children}</I18nProvider>;
}

export function render(ui: ReactElement, { locale, ...options }: RenderOptions & { locale?: Locale } = {}) {
  return rtlRender(ui, {
    wrapper: ({ children }) => <Providers locale={locale}>{children}</Providers>,
    ...options,
  });
}

export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
