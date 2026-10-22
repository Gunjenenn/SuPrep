import React, { ButtonHTMLAttributes, ReactNode, useEffect, useRef, useState } from 'react';
import { CatHead, CatMood } from '../brand/Cat';
import { Rich } from './Math';

type Variant = 'primary' | 'secondary' | 'ghost' | 'dark' | 'soft' | 'danger' | 'lime' | 'teal';
const FACE: Partial<Record<Variant, [string, string, string]>> = {
  primary: ['var(--c-leaf)', 'var(--c-leaf-2)', '#ffffff'],
  secondary: ['var(--c-paper)', 'var(--c-line-2)', 'var(--c-ink)'],
  dark: ['var(--c-forest-2)', 'var(--c-edge)', 'var(--c-on-forest)'],
  soft: ['var(--c-sage)', 'var(--c-sage-2)', 'var(--c-leaf-ink)'],
  danger: ['var(--c-danger-soft)', 'color-mix(in srgb, var(--c-danger) 45%, var(--c-danger-soft))', 'var(--c-danger)'],
  lime: ['var(--c-lime)', '#5f8a12', '#0c1a12'],
  teal: ['var(--c-teal)', 'var(--c-teal-2)', '#ffffff'],
};
export function Button({ variant = 'primary', size = 'md', className = '', children, icon, style, ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: 'sm' | 'md' | 'lg'; icon?: ReactNode }) {
  const s = { sm: 'h-9 px-4 text-[13px] rounded-xl gap-1.5', md: 'h-11 px-5 text-[14px] rounded-2xl gap-2', lg: 'h-[52px] px-7 text-[15px] rounded-2xl gap-2.5' }[size];
  if (variant === 'ghost') {
    return (
      <button className={`inline-flex items-center justify-center font-bold transition-colors text-ink-2 hover:bg-paper-2 hover:text-ink disabled:opacity-40 ${s} ${className}`} style={style} {...rest}>
        {icon}{children}
      </button>
    );
  }
  const [face, edge, fg] = FACE[variant]!;
  return (
    <button
      className={`btn3d inline-flex items-center justify-center font-bold mb-[5px] ${variant === 'secondary' ? 'border-[1.5px] border-line-2' : ''} ${s} ${className}`}
      style={{ ['--face' as any]: face, ['--edge' as any]: edge, color: fg, ...style }}
      {...rest}
    >
      {icon}{children}
    </button>
  );
}

/** Pointer-driven 3D tilt for hero objects and feature cards. */
export function Tilt({ children, className = '', max = 8 }: { children: ReactNode; className?: string; max?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const move = (e: React.PointerEvent) => {
    const el = ref.current; if (!el || e.pointerType === 'touch') return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty('--ry', `${x * max}deg`); el.style.setProperty('--rx', `${-y * max}deg`);
  };
  const leave = () => { ref.current?.style.setProperty('--ry', '0deg'); ref.current?.style.setProperty('--rx', '0deg'); };
  return (
    <div className={`tilt-wrap ${className}`} onPointerMove={move} onPointerLeave={leave}>
      <div ref={ref} className="tilt-inner h-full">{children}</div>
    </div>
  );
}

export function Pill({ children, tone = 'neutral', className = '' }: { children: ReactNode; tone?: 'neutral' | 'leaf' | 'teal' | 'rose' | 'amber' | 'danger' | 'dark'; className?: string }) {
  const t = {
    neutral: 'bg-paper-2 text-ink-2 border-line',
    leaf: 'bg-sage text-leaf-2 border-sage-2',
    teal: 'bg-teal-soft text-teal border-transparent',
    rose: 'bg-rose-soft text-rose border-transparent',
    amber: 'bg-amber-soft text-amber border-transparent',
    danger: 'bg-danger-soft text-danger border-transparent',
    dark: 'bg-forest text-cream border-transparent',
  }[tone];
  return <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11.5px] font-semibold whitespace-nowrap ${t} ${className}`}>{children}</span>;
}

export function Bar({ value, tone = 'leaf', h = 8, className = '' }: { value: number; tone?: 'leaf' | 'moss' | 'teal' | 'rose' | 'lime' | 'amber'; h?: number; className?: string }) {
  const c = { leaf: 'bg-leaf', moss: 'bg-moss', teal: 'bg-teal', rose: 'bg-rose', lime: 'bg-lime', amber: 'bg-amber' }[tone];
  const [w, setW] = useState(0);
  useEffect(() => { const t = requestAnimationFrame(() => setW(value)); return () => cancelAnimationFrame(t); }, [value]);
  return (
    <div className={`w-full rounded-full bg-paper-2 overflow-hidden shadow-[inset_0_2px_0_rgba(0,0,0,.06)] ${className}`} style={{ height: h }} role="progressbar" aria-valuenow={Math.round(value * 100)} aria-valuemin={0} aria-valuemax={100}>
      <div className={`h-full rounded-full bar-fill ${c} shadow-[inset_0_-2px_0_rgba(0,0,0,.14),inset_0_2px_0_rgba(255,255,255,.25)]`} style={{ width: `${Math.max(0, Math.min(1, w)) * 100}%` }} />
    </div>
  );
}

export function Ring({ value, size = 64, stroke = 7, color = 'var(--c-leaf)', children }: { value: number; size?: number; stroke?: number; color?: string; children?: ReactNode }) {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r;
  const [v, setV] = useState(0);
  useEffect(() => { const t = requestAnimationFrame(() => setV(value)); return () => cancelAnimationFrame(t); }, [value]);
  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90 absolute inset-0">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="var(--c-paper-2)" strokeWidth={stroke} fill="none" />
        <circle cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth={stroke} fill="none" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - Math.max(0, Math.min(1, v)))} style={{ transition: 'stroke-dashoffset 1s cubic-bezier(.2,.7,.2,1)' }} />
      </svg>
      <div className="relative">{children}</div>
    </div>
  );
}

/** Number that counts up when it changes. */
export function CountUp({ value, className = '' }: { value: number; className?: string }) {
  const [shown, setShown] = useState(value);
  const from = useRef(value);
  useEffect(() => {
    const start = performance.now(), a = from.current, b = value;
    if (a === b) return;
    let raf = 0;
    const step = (t: number) => {
      const k = Math.min(1, (t - start) / 900);
      const e = 1 - Math.pow(1 - k, 3);
      setShown(Math.round(a + (b - a) * e));
      if (k < 1) raf = requestAnimationFrame(step); else from.current = b;
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return <span className={`tnum ${className}`}>{shown.toLocaleString('en-US')}</span>;
}

/** Суу speaking. */
export function Suu({ text, mood = 'idle', size = 64, children, className = '', tone = 'paper' }: { text?: string; mood?: CatMood; size?: number; children?: ReactNode; className?: string; tone?: 'paper' | 'sage' | 'dark' }) {
  const bubble = { paper: 'bg-paper border-line', sage: 'bg-sage border-sage-2', dark: 'bg-forest-2 border-forest text-cream' }[tone];
  return (
    <div className={`flex items-end gap-3 ${className}`}>
      <div className={`shrink-0 ${mood === 'think' ? 'anim-tilt' : ''}`}>
        <CatHead size={size} mood={mood} />
      </div>
      <div className={`relative rounded-2xl rounded-bl-md border px-4 py-3 text-[14.5px] leading-relaxed min-w-0 ${bubble}`}>
        {text && <Rich text={text} />}
        {children}
      </div>
    </div>
  );
}

export function SectionTitle({ eyebrow, title, right, className = '' }: { eyebrow?: string; title: ReactNode; right?: ReactNode; className?: string }) {
  return (
    <div className={`flex items-end justify-between gap-4 ${className}`}>
      <div className="min-w-0">
        {eyebrow && <div className="eyebrow mb-1.5">{eyebrow}</div>}
        <h2 className="font-display font-bold text-[18px] tracking-[-0.01em] text-ink">{title}</h2>
      </div>
      {right}
    </div>
  );
}

export function PageHeader({ eyebrow, title, sub, right }: { eyebrow: string; title: string; sub?: string; right?: ReactNode }) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4 mb-7 anim-rise">
      <div className="min-w-0 max-w-2xl">
        <div className="eyebrow mb-2">{eyebrow}</div>
        <h1 className="font-display font-extrabold text-[26px] md:text-[34px] leading-[1.08] tracking-[-0.02em] text-ink">{title}</h1>
        {sub && <p className="mt-2.5 text-ink-2 text-[15px] max-w-[60ch]">{sub}</p>}
      </div>
      {right}
    </header>
  );
}

export function Modal({ open, onClose, children, className = '' }: { open: boolean; onClose?: () => void; children: ReactNode; className?: string }) {
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => e.key === 'Escape' && onClose?.();
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4 bg-[color-mix(in_srgb,var(--c-forest)_55%,transparent)] backdrop-blur-[2px] anim-rise" onClick={onClose} role="dialog" aria-modal="true">
      <div className={`card shadow-pop w-full max-w-md anim-pop ${className}`} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

export function Confetti({ n = 26 }: { n?: number }) {
  const colors = ['var(--c-leaf)', 'var(--c-lime)', 'var(--c-rose)', 'var(--c-moss)', 'var(--c-teal)', 'var(--c-ink)'];
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {Array.from({ length: n }).map((_, i) => {
        const a = (i / n) * Math.PI * 2;
        const d = 90 + (i % 5) * 28;
        return (
          <span key={i} className="absolute left-1/2 top-[38%] block"
            style={{
              width: i % 3 ? 7 : 10, height: i % 3 ? 7 : 4, borderRadius: i % 2 ? 2 : 99, background: colors[i % colors.length],
              ['--dx' as any]: `${Math.cos(a) * d}px`, ['--dy' as any]: `${Math.sin(a) * d + 40}px`, ['--rot' as any]: `${(i % 7) * 60}deg`,
              animation: `confetti 1.3s cubic-bezier(.2,.7,.3,1) ${(i % 6) * 0.03}s both`,
            }} />
        );
      })}
    </div>
  );
}

export function Empty({ title, sub, children }: { title: string; sub?: string; children?: ReactNode }) {
  return (
    <div className="card p-10 text-center grid place-items-center gap-3">
      <CatHead size={70} mood="sleep" />
      <div className="font-display font-bold">{title}</div>
      {sub && <p className="text-ink-2 text-sm max-w-sm">{sub}</p>}
      {children}
    </div>
  );
}

/** True when the page is rendering dark, from an explicit data-theme or the OS setting. Re-renders on change. */
export function useIsDark() {
  const read = () => {
    const t = document.documentElement.getAttribute('data-theme');
    if (t) return t === 'dark';
    return typeof matchMedia !== 'undefined' && matchMedia('(prefers-color-scheme: dark)').matches;
  };
  const [dark, setDark] = useState(read);
  useEffect(() => {
    const h = () => setDark(read());
    const mo = new MutationObserver(h);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    const mq = matchMedia('(prefers-color-scheme: dark)');
    mq.addEventListener?.('change', h);
    return () => { mo.disconnect(); mq.removeEventListener?.('change', h); };
  }, []);
  return dark;
}
