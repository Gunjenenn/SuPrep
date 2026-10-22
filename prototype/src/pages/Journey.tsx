import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { LuBookOpen, LuCheck, LuClock, LuFlag, LuLock, LuNotebookPen, LuPencil, LuSpline, LuGraduationCap } from 'react-icons/lu';
import { CatHead } from '../brand/Cat';
import { LessonNode, STAGES, Stage } from '../data/curriculum';
import { badgeById } from '../data/meta';
import { QUESTIONS } from '../data/questions';
import { NodeStatus, nodeStatus, stageUnlocked, useStore } from '../lib/store';
import BadgeEmblem from '../components/Badge';
import { Bar, PageHeader, Pill } from '../components/ui';

const TONE: Record<Stage['tone'], { fill: string; soft: string }> = {
  leaf: { fill: 'var(--c-leaf)', soft: 'var(--c-sage)' },
  moss: { fill: 'var(--c-moss)', soft: 'var(--c-sage)' },
  teal: { fill: 'var(--c-teal)', soft: 'var(--c-teal-soft)' },
  rose: { fill: 'var(--c-rose)', soft: 'var(--c-rose-soft)' },
  ink: { fill: 'var(--c-amber)', soft: 'var(--c-amber-soft)' },
};

export function useOpenNode() {
  const { go } = useStore();
  return (n: LessonNode) => {
    switch (n.kind) {
      case 'lesson':
      case 'checkpoint':
        return go({ name: 'lesson', id: n.id });
      case 'desmos':
        return go({ name: 'desmos', id: n.desmosId });
      case 'practice': {
        const pool = n.domain === 'mixed' ? ['a5', 'v3', 'p4', 'g2', 'a7', 'v2'] : QUESTIONS.filter((q) => q.domain === n.domain).slice(0, 5).map((q) => q.id);
        return go({ name: 'practice', ids: pool, title: n.title, nodeId: n.id });
      }
      case 'timed':
        return go({ name: 'practice', ids: ['a2', 'v1', 'p2', 'g5', 'a6'], timed: 6 * 60, title: n.title, nodeId: n.id });
      case 'review':
        return go({ name: 'mistakes' });
      case 'mock':
        return go({ name: 'mock' });
    }
  };
}

export default function Journey() {
  const { s } = useStore();
  const total = STAGES.reduce((a, st) => a + st.nodes.length, 0);
  const done = Object.keys(s.done).length;
  return (
    <div className="gutter py-6 md:py-8 max-w-[1240px] mx-auto">
      <PageHeader eyebrow="Миний замнал" title="Ойлгох → Сурах → Дадлага → Эзэмших → Хэрэглэх"
        sub="Таван шат, нэг зам. Хичээл бүр шалгалтаар төгсөж, дараагийн алхмыг нээнэ. Desmos Академи үргэлж нээлттэй."
        right={<div className="text-right"><div className="font-thin text-[44px] leading-none text-leaf tnum">{Math.round((done / total) * 100)}%</div><div className="text-[12px] text-ink-3 mt-1">{done}/{total} алхам</div></div>} />
      <div className="grid gap-6">
        {STAGES.map((st) => <StageBlock key={st.id} stage={st} />)}
      </div>
    </div>
  );
}

function StageBlock({ stage }: { stage: Stage }) {
  const { s } = useStore();
  const unlocked = stageUnlocked(s, stage.id);
  const done = stage.nodes.filter((n) => s.done[n.id]).length;
  const tone = TONE[stage.tone];
  const badge = stage.badge ? badgeById(stage.badge) : null;
  return (
    <section className={`card overflow-hidden ${unlocked ? '' : 'opacity-[0.82]'}`} aria-label={stage.title}>
      <div className="grid lg:grid-cols-[300px_1fr]">
        <div className="p-6 lg:border-r border-b lg:border-b-0 border-line relative" style={{ background: `color-mix(in srgb, ${tone.soft} 55%, transparent)` }}>
          <div className="flex items-start justify-between gap-3">
            <span className="font-display font-extrabold text-[52px] leading-[0.85] tnum" style={{ color: tone.fill, textShadow: '0 4px 0 var(--c-edge)' }}>{String(stage.no).padStart(2, '0')}</span>
            {badge && <div className="text-center"><BadgeEmblem badge={badge} earned={!!s.badges[badge.id]} size={54} /></div>}
          </div>
          <div className="eyebrow mt-4" style={{ color: tone.fill }}>{stage.en}</div>
          <h2 className="font-display font-extrabold text-[21px] leading-tight mt-1">{stage.title}</h2>
          <p className="text-ink-2 text-[13.5px] mt-2">{stage.blurb}</p>
          <div className="mt-4 flex items-center gap-3">
            <Bar value={done / stage.nodes.length} tone={stage.tone === 'ink' ? 'leaf' : (stage.tone as any)} h={6} />
            <span className="text-[12px] text-ink-3 tnum shrink-0">{done}/{stage.nodes.length}</span>
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {stage.alwaysOpen && <Pill tone="teal">Үргэлж нээлттэй</Pill>}
            {!unlocked && <Pill tone="neutral"><LuLock size={11} /> {stage.id === 's2' ? '1-р шатны шалгалтыг давна' : stage.id === 's4' ? '2-р шатны шалгалтыг давна' : 'Desmos эсвэл SAT шалгалтыг давна'}</Pill>}
            {badge && <Pill tone="rose">Шагнал: {badge.mn}</Pill>}
          </div>
        </div>
        <Trail stage={stage} />
      </div>
    </section>
  );
}

function iconFor(n: LessonNode, size = 22) {
  switch (n.kind) {
    case 'checkpoint': return <LuFlag size={size} />;
    case 'desmos': return <LuSpline size={size} />;
    case 'practice': return <LuPencil size={size} />;
    case 'timed': return <LuClock size={size} />;
    case 'review': return <LuNotebookPen size={size} />;
    case 'mock': return <LuGraduationCap size={size} />;
    default: return <LuBookOpen size={size} />;
  }
}

function Trail({ stage }: { stage: Stage }) {
  const { s } = useStore();
  const open = useOpenNode();
  const wrap = useRef<HTMLDivElement>(null);
  const refs = useRef<(HTMLDivElement | null)[]>([]);
  const [pts, setPts] = useState<{ x: number; y: number }[]>([]);
  const [box, setBox] = useState({ w: 0, h: 0 });
  const [msg, setMsg] = useState<string | null>(null);
  const tone = TONE[stage.tone];
  const statuses: NodeStatus[] = stage.nodes.map((n) => nodeStatus(s, n, stage.id));

  const measure = () => {
    const w = wrap.current;
    if (!w) return;
    const r = w.getBoundingClientRect();
    setBox({ w: r.width, h: r.height });
    setPts(refs.current.map((el) => {
      if (!el) return { x: 0, y: 0 };
      const b = el.getBoundingClientRect();
      return { x: b.left - r.left + b.width / 2, y: b.top - r.top + b.height / 2 };
    }));
  };
  useLayoutEffect(measure, [s.done]);
  useEffect(() => {
    const ro = new ResizeObserver(measure);
    if (wrap.current) ro.observe(wrap.current);
    return () => ro.disconnect();
  }, []);

  const seg = (a: { x: number; y: number }, b: { x: number; y: number }) => {
    if (Math.abs(a.y - b.y) > 60) {
      // wrap to next row: a soft S-curve
      const my = (a.y + b.y) / 2;
      return `M${a.x} ${a.y} C${a.x} ${my + 30}, ${b.x} ${my - 30}, ${b.x} ${b.y}`;
    }
    const mx = (a.x + b.x) / 2;
    return `M${a.x} ${a.y} Q${mx} ${(a.y + b.y) / 2 + (a.y > b.y ? 26 : -26)} ${b.x} ${b.y}`;
  };

  return (
    <div className="p-6 md:p-8 relative">
      <div ref={wrap} className="relative grid grid-cols-[repeat(auto-fill,minmax(118px,1fr))] gap-y-8 gap-x-2">
        <svg className="absolute inset-0 pointer-events-none" width={box.w} height={box.h} aria-hidden="true">
          {pts.slice(1).map((p, i) => {
            if (Math.abs(pts[i].y - p.y) > 60) return null;
            const doneSeg = statuses[i] === 'done' && statuses[i + 1] !== 'locked';
            return (
              <path key={i} d={seg(pts[i], p)} fill="none" strokeLinecap="round"
                stroke={doneSeg ? tone.fill : 'var(--c-line-2)'} strokeWidth={doneSeg ? 3.5 : 2.5} strokeDasharray={doneSeg ? undefined : '2 7'} />
            );
          })}
        </svg>
        {stage.nodes.map((n, i) => {
          const st = statuses[i];
          const isCp = n.kind === 'checkpoint' || n.id.endsWith('-cp') || n.kind === 'mock';
          const offset = i % 2 === 1 ? 'translate-y-7' : '';
          return (
            <div key={n.id} className={`flex flex-col items-center text-center relative ${offset}`}>
              {st === 'current' && (
                <div className="absolute -top-9 z-10 flex flex-col items-center anim-floaty pointer-events-none">
                  <CatHead size={38} mood="happy" />
                </div>
              )}
              <div ref={(el) => (refs.current[i] = el)} className="relative">
                {st === 'current' && <span className={`absolute inset-0 pulse-ring pointer-events-none ${isCp ? 'rounded-[20px] rotate-45' : 'rounded-full'}`} aria-hidden="true" />}
                <button
                  onClick={() => {
                    if (st === 'locked') { setMsg(n.id); setTimeout(() => setMsg(null), 2200); return; }
                    open(n);
                  }}
                  aria-label={`${n.title}${st === 'locked' ? ' (түгжээтэй)' : st === 'done' ? ' (дууссан)' : ''}`}
                  id={`node-${n.id}`}
                  className={`coin relative grid place-items-center transition-transform hover:-translate-y-1 active:translate-y-1 ${isCp ? 'h-[64px] w-[64px] rounded-[20px] rotate-45' : 'h-[66px] w-[66px] rounded-full'} ${msg === n.id ? 'anim-shake' : ''}`}
                  style={{
                    ['--face' as any]: st === 'done' ? 'var(--c-leaf)' : st === 'current' ? tone.fill : st === 'open' ? 'var(--c-paper)' : 'var(--c-paper-2)',
                    ['--edge' as any]: st === 'done' ? 'var(--c-leaf-2)' : st === 'current' ? 'color-mix(in srgb, #000 35%, ' + tone.fill + ')' : 'var(--c-line-2)',
                    border: st === 'locked' ? '2px dashed var(--c-line-2)' : st === 'open' ? `3px solid ${tone.fill}` : 'none',
                    color: st === 'done' || st === 'current' ? '#fff' : st === 'open' ? tone.fill : 'var(--c-ink-3)',
                  }}
                >
                  <span className={isCp ? '-rotate-45' : ''}>
                    {st === 'locked' ? <LuLock size={20} /> : st === 'done' ? <LuCheck size={26} strokeWidth={3} /> : iconFor(n)}
                  </span>
                </button>
              </div>
              <div className="mt-3 px-1">
                <div className={`text-[13px] font-semibold leading-snug ${st === 'locked' ? 'text-ink-3' : ''}`}>{n.title}</div>
                <div className="text-[11px] text-ink-3 mt-0.5">{isCp ? 'Шалгалт · ' : ''}+{n.xp} XP</div>
                {msg === n.id && <div className="mt-1 text-[11px] text-rose font-semibold">Өмнөх алхмаа дуусгаарай</div>}
              </div>
            </div>
          );
        })}
      </div>
      <div className="h-6" />
    </div>
  );
}
