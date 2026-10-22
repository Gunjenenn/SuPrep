import { ReactNode, useEffect, useState } from 'react';
import { LuBookA, LuBookOpen, LuCalendarRange, LuChartLine, LuEllipsis, LuFlame, LuHouse, LuLifeBuoy, LuMedal, LuMoon, LuNotebookPen, LuRotateCcw, LuRoute, LuSigma, LuSpline, LuSun, LuTimer, LuTrophy, LuX } from 'react-icons/lu';
import { CatHead } from '../brand/Cat';
import { Logo } from '../brand/Decor';
import { levelFor } from '../data/curriculum';
import { badgeById } from '../data/meta';
import { QUESTS } from '../data/meta';
import { Route, useStore } from '../lib/store';
import BadgeEmblem from './Badge';
import { Bar, Button, Confetti, CountUp, Modal, useIsDark } from './ui';

const SuuIcon = ({ size = 18 }: { size?: number }) => <CatHead size={size + 4} style={{ ['--c-cat-rim' as any]: '#2e5a45' }} />;

type NavItem = { r: Route['name']; label: string; icon: ReactNode; short: string; group: 0 | 1 | 2 | 3 };
const NAV: NavItem[] = [
  { r: 'dashboard', label: 'Нүүр', short: 'Нүүр', icon: <LuHouse size={19} />, group: 0 },
  { r: 'journey', label: 'Миний замнал', short: 'Замнал', icon: <LuRoute size={19} />, group: 0 },
  { r: 'desmos', label: 'Desmos Академи', short: 'Desmos', icon: <LuSpline size={19} />, group: 0 },
  { r: 'bank', label: 'Асуултын сан', short: 'Дасгал', icon: <LuBookOpen size={19} />, group: 1 },
  { r: 'tutor', label: 'AI багш Суу', short: 'Суу', icon: <SuuIcon />, group: 0 },
  { r: 'planner', label: 'AI төлөвлөгөө', short: 'Төлөвлөгөө', icon: <LuCalendarRange size={19} />, group: 0 },
  { r: 'hard', label: 'Хүнд асуулт', short: 'Хүнд', icon: <LuFlame size={19} />, group: 1 },
  { r: 'mock', label: 'Бүтэн тест', short: 'Тест', icon: <LuTimer size={19} />, group: 1 },
  { r: 'mistakes', label: 'Алдааны дэвтэр', short: 'Алдаа', icon: <LuNotebookPen size={19} />, group: 1 },
  { r: 'vocab', label: 'Үгсийн сан', short: 'Үгс', icon: <LuBookA size={19} />, group: 2 },
  { r: 'formulas', label: 'Томьёоны карт', short: 'Томьёо', icon: <LuSigma size={19} />, group: 2 },
  { r: 'league', label: 'Чансаа', short: 'Чансаа', icon: <LuMedal size={19} />, group: 2 },
  { r: 'help', label: 'Тусламж', short: 'Тусламж', icon: <LuLifeBuoy size={19} />, group: 2 },
  { r: 'progress', label: 'Миний ахиц', short: 'Ахиц', icon: <LuChartLine size={19} />, group: 3 },
  { r: 'achievements', label: 'Амжилтууд', short: 'Амжилт', icon: <LuTrophy size={19} />, group: 3 },
];
const GROUPS = ['', 'Дасгал', 'Материал', 'Би'];
const MOBILE_MAIN: Route['name'][] = ['dashboard', 'journey', 'desmos', 'bank'];
const activeFor = (r: Route['name']): Route['name'] =>
  r === 'lesson' ? 'journey' : r === 'practice' ? 'bank' : r;

export default function Shell({ children }: { children: ReactNode }) {
  const { s, route, go, reset, setTheme } = useStore();
  const lv = levelFor(s.xp);
  const active = activeFor(route.name);
  const [more, setMore] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const unresolved = s.mistakes.filter((m) => !m.resolved && (m.due ?? 0) <= Date.now()).length;
  const dark = useIsDark();

  return (
    <div className="h-full flex bg-bg">
      {/* sidebar */}
      <aside className="hidden lg:flex w-[248px] shrink-0 flex-col bg-forest text-cream relative overflow-hidden">
        <div className="px-6 pt-6 pb-5"><button onClick={() => go({ name: 'landing' })} aria-label="SuuPrep нүүр"><Logo light /></button></div>
        <nav className="px-3 flex-1 overflow-y-auto no-scrollbar pb-2" aria-label="Үндсэн цэс">
          {GROUPS.map((g, gi) => (
            <div key={gi} className={gi ? 'mt-4' : ''}>
              {g && <div className="px-3 mb-1.5 font-mono text-[10.5px] font-bold tracking-[0.16em] uppercase text-cream/40">{g}</div>}
              {NAV.filter((n) => n.group === gi).map((n) => (
                <button
                  key={n.r}
                  onClick={() => go({ name: n.r } as Route)}
                  aria-current={active === n.r ? 'page' : undefined}
                  className={`group w-full flex items-center gap-3 px-3 h-10 rounded-xl text-[13.5px] font-semibold transition-all relative ${active === n.r ? 'text-forest' : 'text-cream/70 hover:text-white hover:bg-white/[0.06]'}`}
                  style={active === n.r ? { background: 'var(--c-lime)', boxShadow: '0 3px 0 #4d7c0f' } : undefined}
                >
                  <span className={active === n.r ? '' : 'text-cream/55 group-hover:text-cream'}>{n.icon}</span>
                  <span className="truncate">{n.label}</span>
                  {n.r === 'mistakes' && unresolved > 0 && <span className="ml-auto text-[11px] tnum bg-rose text-forest rounded-full px-1.5 font-bold">{unresolved}</span>}
                  {n.r === 'desmos' && active !== n.r && <span className="ml-auto text-[9.5px] font-mono font-bold text-lime">★</span>}
                </button>
              ))}
            </div>
          ))}
        </nav>
        <div className="p-3">
          <div className="rounded-2xl bg-white/[0.06] p-3.5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-moss/30 grid place-items-center font-display font-extrabold text-lime">{s.profile.name.slice(0, 1)}</div>
              <div className="min-w-0">
                <div className="font-semibold text-[14px] truncate">{s.profile.name}</div>
                <div className="text-[11.5px] text-cream/60">Түвшин {lv.n} · {lv.en}</div>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between text-[11.5px] text-cream/70 tnum">
              <span><CountUp value={s.xp} /> XP</span>
              <span>{lv.next ? `${lv.toNext} XP дутуу` : 'Дээд түвшин'}</span>
            </div>
            <div className="mt-1.5 h-1.5 rounded-full bg-white/10 overflow-hidden"><div className="h-full bg-lime bar-fill" style={{ width: `${lv.pct * 100}%` }} /></div>
            <div className="mt-3 flex gap-1">
              <button onClick={() => setTheme(dark ? 'light' : 'dark')} className="flex-1 h-8 rounded-lg text-[11.5px] text-cream/70 hover:text-white hover:bg-white/10 inline-flex items-center justify-center gap-1.5" aria-label="Өнгөний горим солих">
                {dark ? <LuSun size={14} /> : <LuMoon size={14} />} {dark ? 'Цайвар' : 'Бараан'}
              </button>
              <button onClick={() => { if (confirmReset) { reset(); setConfirmReset(false); } else { setConfirmReset(true); setTimeout(() => setConfirmReset(false), 3000); } }} className={`flex-1 h-8 rounded-lg text-[11.5px] inline-flex items-center justify-center gap-1.5 ${confirmReset ? 'bg-rose text-forest font-bold' : 'text-cream/70 hover:text-white hover:bg-white/10'}`} title="Демо явцыг эхнээс нь">
                <LuRotateCcw size={13} /> {confirmReset ? 'Дахин дар' : 'Шинэчлэх'}
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* main column */}
      <div className="flex-1 min-w-0 flex flex-col h-full">
        <TopBar />
        <main id="main-scroll" className="flex-1 overflow-y-auto scroll-thin pb-24 lg:pb-10">
          <div key={route.name + ('id' in route ? route.id : '')} className="anim-rise">{children}</div>
        </main>
      </div>

      {/* mobile nav */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-forest text-cream border-t border-white/10" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)', paddingLeft: 'max(8px, env(safe-area-inset-left, 0px))', paddingRight: 'max(8px, env(safe-area-inset-right, 0px))' }} aria-label="Үндсэн цэс">
        <div className="grid grid-cols-5">
          {NAV.filter((n) => MOBILE_MAIN.includes(n.r)).map((n) => (
            <button key={n.r} onClick={() => go({ name: n.r } as Route)} className={`flex flex-col items-center gap-0.5 py-2.5 text-[10.5px] font-semibold ${active === n.r ? 'text-lime' : 'text-cream/65'}`}>
              {n.icon}<span>{n.short}</span>
            </button>
          ))}
          <button onClick={() => setMore(true)} className={`flex flex-col items-center gap-0.5 py-2.5 text-[10.5px] font-semibold ${!MOBILE_MAIN.includes(active) ? 'text-lime' : 'text-cream/65'}`}>
            <LuEllipsis size={19} /><span>Бусад</span>
          </button>
        </div>
      </nav>
      {more && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/40" onClick={() => setMore(false)}>
          <div className="absolute bottom-0 inset-x-0 bg-forest text-cream rounded-t-3xl p-4 pb-8 anim-rise" onClick={(e) => e.stopPropagation()} style={{ paddingBottom: 'calc(24px + env(safe-area-inset-bottom, 0px))' }}>
            <div className="flex items-center justify-between mb-2 px-2"><Logo light /><button onClick={() => setMore(false)} aria-label="Хаах" className="h-9 w-9 grid place-items-center"><LuX /></button></div>
            <div className="grid grid-cols-3 gap-2 max-h-[60vh] overflow-y-auto">
              {NAV.filter((n) => !MOBILE_MAIN.includes(n.r)).map((n) => (
                <button key={n.r} onClick={() => { go({ name: n.r } as Route); setMore(false); }} className="rounded-2xl bg-white/[0.06] py-4 flex flex-col items-center gap-1.5 text-[12px] font-semibold">
                  {n.icon}{n.label}
                </button>
              ))}
              <button onClick={() => { setTheme(dark ? 'light' : 'dark'); }} className="rounded-2xl bg-white/[0.06] py-4 flex flex-col items-center gap-1.5 text-[12px] font-semibold">{dark ? <LuSun /> : <LuMoon />}{dark ? 'Цайвар' : 'Бараан'}</button>
            </div>
          </div>
        </div>
      )}
      <RewardLayer />
    </div>
  );
}

function TopBar() {
  const { s, go } = useStore();
  const lv = levelFor(s.xp);
  const doneQuests = QUESTS.filter((q) => (s.quests.p[q.id] || 0) >= q.target).length;
  return (
    <div className="sticky z-30 bg-bg/90 backdrop-blur border-b border-line" style={{ top: 'env(safe-area-inset-top, 0px)' }}>
      <div className="gutter h-14 flex items-center gap-3">
        <div className="lg:hidden"><Logo compact /></div>
        <div className="lg:hidden font-display font-extrabold tracking-[0.18em] text-[12px]">SUUPREP</div>
        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <button onClick={() => go({ name: 'dashboard' })} className="hidden sm:flex items-center gap-2 h-9 px-3 rounded-full border border-line bg-paper text-[12.5px] font-semibold" title="Өдрийн даалгавар">
            <span className="h-2 w-2 rounded-full bg-moss" /> Даалгавар {doneQuests}/{QUESTS.length}
          </button>
          <button onClick={() => go({ name: 'progress' })} className="flex items-center gap-1.5 h-9 px-3 rounded-full border border-line bg-paper text-[12.5px] font-bold tnum" title="Дараалсан өдөр">
            <LuFlame size={15} className="text-rose" /> {s.streak.count}
          </button>
          <button onClick={() => go({ name: 'progress' })} className="flex items-center gap-2 h-9 pl-1.5 pr-3 rounded-full border border-line bg-paper text-[12.5px] font-bold" title="Түвшин ба XP">
            <span className="h-6 w-6 rounded-full bg-forest text-lime grid place-items-center text-[11px] font-display">{lv.n}</span>
            <span className="tnum" id="xp-counter"><CountUp value={s.xp} /> XP</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function RewardLayer() {
  const { rewards, dismiss } = useStore();
  const xp = rewards.filter((r) => r.type === 'xp' || r.type === 'quest');
  const modal = rewards.find((r) => r.type === 'level' || r.type === 'badge');
  useEffect(() => {
    const timers = xp.map((r) => setTimeout(() => dismiss(r.id), 2600));
    return () => timers.forEach(clearTimeout);
  }, [xp.map((r) => r.id).join(',')]); // eslint-disable-line
  return (
    <>
      <div className="fixed z-[60] right-4 top-16 flex flex-col items-end gap-2 pointer-events-none" style={{ right: 'max(16px, env(safe-area-inset-right, 0px))' }} aria-live="polite">
        {xp.map((r) => (
          <div key={r.id} className="rounded-2xl bg-forest text-cream shadow-pop px-4 py-2.5 flex items-center gap-3" style={{ animation: 'xp-fly 2.6s ease both' }}>
            {r.type === 'xp' ? (
              <>
                <span className="font-display font-extrabold text-lime text-lg tnum">+{r.amount} XP</span>
                <span className="text-[12.5px] text-cream/75 max-w-[220px] truncate">{r.reason}</span>
              </>
            ) : (
              <span className="text-[13px]">✓ Өдрийн даалгавар биеллээ: <b>{QUESTS.find((q) => q.id === (r as any).quest)?.title}</b></span>
            )}
          </div>
        ))}
      </div>
      <Modal open={!!modal} onClose={() => modal && dismiss(modal.id)}>
        {modal?.type === 'level' && <LevelUp level={modal.level} onClose={() => dismiss(modal.id)} />}
        {modal?.type === 'badge' && <BadgeReveal id={modal.badge} onClose={() => dismiss(modal.id)} />}
      </Modal>
    </>
  );
}

function LevelUp({ level, onClose }: { level: number; onClose: () => void }) {
  const lv = levelFor([0, 0, 200, 500, 900, 1400, 2000][level]);
  return (
    <div className="relative p-8 text-center overflow-hidden">
      <Confetti />
      <div className="eyebrow">Шинэ түвшин нээгдлээ</div>
      <div className="mt-4 mx-auto w-28 h-28 rounded-full bg-forest grid place-items-center anim-pop relative">
        <span className="font-display font-extrabold text-5xl text-lime">{level}</span>
      </div>
      <h3 className="mt-5 font-display font-extrabold text-2xl">{lv.mn}</h3>
      <div className="text-ink-3 text-sm">Level {level} · {lv.en}</div>
      <p className="mt-3 text-ink-2 text-sm">Мяу! Чи нэг шат ахилаа. Түвшин бол хичээл зүтгэлийн хэмжүүр — мэдлэгийн ахицаа "Миний ахиц" хэсгээс хараарай.</p>
      <Button className="mt-6 w-full" onClick={onClose}>Үргэлжлүүлэх</Button>
    </div>
  );
}

function BadgeReveal({ id, onClose }: { id: string; onClose: () => void }) {
  const b = badgeById(id);
  return (
    <div className="relative p-8 text-center overflow-hidden">
      <Confetti n={18} />
      <div className="eyebrow" style={{ color: 'var(--c-rose)' }}>Шинэ тэмдэг</div>
      <div className="mt-4 grid place-items-center anim-pop"><BadgeEmblem badge={b} earned size={128} /></div>
      <h3 className="mt-4 font-display font-extrabold text-xl">{b.mn}</h3>
      <div className="text-ink-3 text-sm">{b.en}</div>
      <p className="mt-2 text-ink-2 text-sm">{b.how}.</p>
      <Button className="mt-6 w-full" onClick={onClose}>Цуглуулгад нэмэх</Button>
    </div>
  );
}
