'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { type ReactNode, useState } from 'react';
import { Logo } from '@/components/brand';
import { Sheet } from '@/components/ui/Sheet';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { cn } from '@/lib/cn';
import { useT } from '@/lib/i18n-client';
import { isActive, NAV, type NavItem } from '@/lib/nav';
import { routes } from '@/lib/routes';

function NavLink({ item, pathname, onClick }: { item: NavItem; pathname: string; onClick?: () => void }) {
  const t = useT('common');
  const on = isActive(pathname, item.href);
  return (
    <Link
      href={item.href}
      onClick={onClick}
      aria-current={on ? 'page' : undefined}
      className={cn(
        'flex items-center h-10 px-3.5 rounded-xl text-[14px] font-semibold transition-colors',
        on
          ? 'btn3d [--face:var(--c-lime)] [--edge:var(--c-lime-2)] text-[var(--c-on-lime)] mb-[5px]'
          : 'text-ink-2 hover:bg-paper-2 hover:text-ink',
      )}
    >
      {t(`nav.${item.key}`)}
    </Link>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const t = useT('common');
  const pathname = usePathname() ?? '/';
  const [more, setMore] = useState(false);
  const all = NAV.flatMap((g) => g.items);
  const tabs = all.filter((i) => i.mobile);
  const rest = all.filter((i) => !i.mobile);

  return (
    <div className="min-h-dvh md:grid md:grid-cols-[248px_minmax(0,1fr)]">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[70] card px-4 py-2"
      >
        {t('nav.skip')}
      </a>

      {/* desktop sidebar */}
      <aside className="hidden md:flex flex-col gap-5 sticky top-0 h-dvh overflow-y-auto scroll-thin border-r-[1.5px] border-line bg-paper px-4 py-5">
        <Link href={routes.dashboard} className="px-2">
          <Logo />
        </Link>
        <nav className="grid gap-4" aria-label="SuuPrep">
          {NAV.map((g) => (
            <div key={g.key} className="grid gap-1">
              {t(`nav.groups.${g.key}`) && (
                <div className="eyebrow px-3.5 mb-1">{t(`nav.groups.${g.key}`)}</div>
              )}
              {g.items.map((item) => (
                <NavLink key={item.key} item={item} pathname={pathname} />
              ))}
            </div>
          ))}
        </nav>
        <div className="mt-auto">
          <ThemeToggle className="w-full justify-between" />
        </div>
      </aside>

      {/* biome-ignore lint/correctness/useUniqueElementIds: the app shell renders once; #main is the skip-link target */}
      <main id="main" className="min-w-0 gutter pt-6 pb-28 md:pb-10 md:pt-8 max-w-6xl w-full mx-auto">
        {children}
      </main>

      {/* phone bottom nav */}
      <nav
        aria-label="SuuPrep"
        className="md:hidden fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 gap-1 border-t-[1.5px] border-line bg-paper px-2 pt-2 pb-[max(8px,env(safe-area-inset-bottom))]"
      >
        {tabs.map((item) => {
          const on = isActive(pathname, item.href);
          return (
            <Link
              key={item.key}
              href={item.href}
              aria-current={on ? 'page' : undefined}
              className={cn(
                'grid place-items-center h-12 rounded-xl text-[11px] font-bold text-center leading-tight px-1',
                on ? 'bg-sage text-leaf-2' : 'text-ink-2',
              )}
            >
              {t(`nav.${item.key}`)}
            </Link>
          );
        })}
        <button
          type="button"
          onClick={() => setMore(true)}
          className="grid place-items-center h-12 rounded-xl text-[11px] font-bold text-ink-2"
        >
          {t('nav.more')}
        </button>
      </nav>

      <Sheet open={more} onClose={() => setMore(false)} label={t('nav.more')}>
        <div className="grid gap-1">
          {rest.map((item) => (
            <NavLink key={item.key} item={item} pathname={pathname} onClick={() => setMore(false)} />
          ))}
        </div>
        <ThemeToggle className="mt-5" />
      </Sheet>
    </div>
  );
}
