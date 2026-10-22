'use client';
import { useEffect, useState } from 'react';
import { useT } from '@/lib/i18n-client';
import { applyTheme, readTheme, type Theme } from '@/lib/theme';
import { SegmentedControl } from './SegmentedControl';

export function ThemeToggle({ className }: { className?: string }) {
  const t = useT('common');
  const [theme, setTheme] = useState<Theme>('system');
  useEffect(() => setTheme(readTheme()), []);
  return (
    <SegmentedControl<Theme>
      className={className}
      label={t('theme.toggle')}
      value={theme}
      onChange={(v) => {
        setTheme(v);
        applyTheme(v);
      }}
      options={[
        { value: 'light', label: t('theme.light') },
        { value: 'dark', label: t('theme.dark') },
        { value: 'system', label: t('theme.system') },
      ]}
    />
  );
}
