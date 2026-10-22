import Link from 'next/link';
import { CatSitting, Logo, Stars } from '@/components/brand';
import { getT } from '@/lib/i18n';
import { routes } from '@/lib/routes';

// Section I · I1 — replace this with the 3D landing (prototype: Landing.tsx + Hero3D.tsx)
export default function LandingPage() {
  const t = getT('common');
  return (
    <main className="min-h-dvh gutter py-8 grid content-center justify-items-center gap-6 text-center paper-grain">
      <Logo />
      <div className="relative">
        <Stars className="absolute -top-6 -right-24 w-40 opacity-70" />
        <CatSitting size={150} mood="happy" className="anim-floaty" />
      </div>
      <h1 className="font-display font-extrabold text-[30px] md:text-[44px] leading-tight text-ink max-w-[16ch]">
        {t('app.tagline')}
      </h1>
      <div className="flex flex-wrap justify-center gap-3">
        <Link
          href={routes.onboarding}
          className="btn3d inline-flex items-center h-[52px] px-7 rounded-2xl font-bold text-[15px] [--face:var(--c-leaf)] [--edge:var(--c-leaf-2)] text-[var(--c-on-leaf)]"
        >
          {t('landing.start')}
        </Link>
        <Link
          href={routes.dashboard}
          className="btn3d inline-flex items-center h-[52px] px-7 rounded-2xl font-bold text-[15px] border-[1.5px] border-line-2 [--face:var(--c-paper)] [--edge:var(--c-line-2)] text-ink"
        >
          {t('landing.demo')}
        </Link>
      </div>
    </main>
  );
}
