// Үгсийн сан + Томьёо — Hippocards-style flashcards.
// Hub of decks → swipe session (right = Мэднэ, left = Дахин) → quick quiz → summary.
import { useEffect, useMemo, useRef, useState } from 'react';
import { LuBell, LuCheck, LuPencil, LuPlay, LuPlus, LuRotateCcw, LuTrash2, LuVolume2, LuX, LuZap } from 'react-icons/lu';
import { CatHead } from '../brand/Cat';
import { Card, DECKS, Deck, LEITNER_DAYS } from '../data/cards';
import { CardState, useStore } from '../lib/store';
import CardArt from '../components/CardArt';
import { Rich, Tex } from '../components/Math';
import { Button, Confetti, CountUp, Pill } from '../components/ui';

type Tab = 'word' | 'formula' | 'mine';
type Session = { title: string; cards: Card[]; color: string; edge: string; kind: Deck['kind']; quizOnly?: boolean };

const speak = (text: string) => {
  try {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US'; u.rate = 0.85;
    window.speechSynthesis.cancel(); window.speechSynthesis.speak(u);
  } catch { /* speech not available in this viewer */ }
};

export function statusOf(st?: CardState) {
  if (!st || st.seen === 0) return 'new';
  return st.box >= 3 ? 'known' : 'learning';
}
const isDue = (st?: CardState) => !!st && st.due <= Date.now();

export default function Cards({ initial = 'word' }: { initial?: Tab }) {
  const { s } = useStore();
  const [tab, setTab] = useState<Tab>(initial);
  const [session, setSession] = useState<Session | null>(null);
  const mineDeck: Deck = { id: 'mine', kind: 'mine', title: 'Миний багц', sub: 'Өөрөө нэмсэн карт', color: 'var(--c-forest-2)', edge: 'var(--c-edge)', cards: s.myCards };
  const decks = tab === 'mine' ? [mineDeck] : DECKS.filter((d) => d.kind === tab);
  const pool = tab === 'mine' ? s.myCards : DECKS.filter((d) => d.kind === tab).flatMap((d) => d.cards);
  const due = pool.filter((c) => isDue(s.cards[c.id]));
  const known = pool.filter((c) => statusOf(s.cards[c.id]) === 'known').length;
  const learning = pool.filter((c) => statusOf(s.cards[c.id]) === 'learning').length;

  if (session) return <Study session={session} onExit={() => setSession(null)} />;

  const start = (d: Deck, only?: Card[]) => {
    const cards = only ?? [...d.cards].sort((a, b) => (s.cards[a.id]?.due ?? 0) - (s.cards[b.id]?.due ?? 0)).slice(0, 10);
    if (cards.length) setSession({ title: d.title, cards, color: d.color, edge: d.edge, kind: d.kind });
  };

  return (
    <div className="gutter py-6 md:py-8 max-w-[1120px] mx-auto">
      <header className="flex flex-wrap items-end justify-between gap-4 mb-6 anim-rise">
        <div>
          <div className="eyebrow">Материал · Карт</div>
          <h1 className="font-display font-extrabold text-[28px] md:text-[34px] tracking-[-0.02em] leading-tight">{tab === 'formula' ? 'Томьёоны карт' : tab === 'mine' ? 'Миний карт' : 'Үгсийн сан'}</h1>
          <p className="text-ink-2 mt-1.5 max-w-[60ch] text-[14.5px]">Карт бүр хөдөлгөөнт зураг, дуудлага, санах түлхүүртэй. Баруун тийш шидвэл «Мэднэ», зүүн тийш «Дахин». Мэдсэн карт 1, 3, 7, 14 хоногийн дараа эргэж ирнэ.</p>
        </div>
        <div className="inline-flex rounded-2xl bg-paper-2 p-1 border border-line" role="tablist">
          {([['word', 'Үгс'], ['formula', 'Томьёо'], ['mine', 'Миний багц']] as const).map(([t, l]) => (
            <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)} id={`cards-tab-${t}`} className={`h-10 px-4 rounded-xl text-[13px] font-bold ${tab === t ? 'bg-paper shadow-card text-ink' : 'text-ink-3'}`}>{l}</button>
          ))}
        </div>
      </header>

      {/* today strip */}
      <section className="grid md:grid-cols-[1.4fr_1fr] gap-4">
        <div className="rounded-[28px] p-6 relative overflow-hidden" style={{ background: 'var(--c-forest-2)', color: 'var(--c-on-forest)', boxShadow: '0 6px 0 var(--c-edge)' }}>
          <div className="eyebrow" style={{ color: 'var(--c-lime)' }}>Өнөөдөр давтах</div>
          <div className="mt-2 flex items-end gap-3"><span className="font-display font-extrabold text-[56px] leading-none tnum"><CountUp value={due.length} /></span><span className="mb-2 opacity-75 text-[14px]">карт хүлээж байна</span></div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button variant="lime" onClick={() => due.length && setSession({ title: 'Өнөөдрийн давталт', cards: due.slice(0, 12), color: 'var(--c-leaf)', edge: 'var(--c-leaf-2)', kind: tab === 'formula' ? 'formula' : 'word' })} disabled={!due.length} icon={<LuPlay />} id="study-due">Давтаж эхлэх</Button>
          </div>
          <div className="absolute right-4 bottom-2 hidden sm:block" aria-hidden="true"><DeckStack color="var(--c-leaf)" edge="var(--c-leaf-2)" mini label={tab === 'formula' ? 'πr²' : 'Aa'} /></div>
        </div>
        <div className="card p-5 grid grid-cols-3 gap-3 items-center">
          {[['Шинэ', pool.length - known - learning, 'var(--c-ink-3)'], ['Сурч буй', learning, 'var(--c-amber)'], ['Цээжилсэн', known, 'var(--c-leaf)']].map(([l, n, c]) => (
            <div key={l as string} className="text-center">
              <div className="font-display font-extrabold text-[30px] tnum" style={{ color: c as string }}>{n as number}</div>
              <div className="text-[12px] text-ink-3 font-semibold">{l}</div>
            </div>
          ))}
          <Reminder />
        </div>
      </section>

      {/* decks */}
      <section className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-8">
        {decks.map((d) => <DeckTile key={d.id} d={d} onLearn={() => start(d)} onQuiz={() => setSession({ title: d.title + ' · тест', cards: d.cards.slice(0, 8), color: d.color, edge: d.edge, kind: d.kind, quizOnly: true })} />)}
      </section>

      {tab === 'mine' && <MyCards />}
      <p className="mt-10 text-[12px] text-ink-3">Санах түлхүүр нь Suprep-ийн жишээ контент. Карт бүр дээрх харандаа товчоор өөрийн санах аргаа бичиж болно.</p>
    </div>
  );
}

function DeckStack({ color, edge, label, mini }: { color: string; edge: string; label: string; mini?: boolean }) {
  const w = mini ? 110 : 160, h = mini ? 76 : 104;
  return (
    <div className="relative" style={{ width: w + 24, height: h + 22 }}>
      {[2, 1, 0].map((k) => (
        <div key={k} className="absolute rounded-2xl grid place-items-center transition-transform"
          style={{
            width: w, height: h, left: 12 + k * 6, top: 12 - k * 6, transform: `rotate(${(k - 1) * 4}deg)`,
            background: k ? `color-mix(in srgb, ${color} ${100 - k * 22}%, var(--c-paper))` : color,
            boxShadow: `0 6px 0 ${edge}`, border: '1.5px solid color-mix(in srgb, #000 10%, transparent)',
          }}>
          {k === 0 && <span className="font-display font-extrabold text-white" style={{ fontSize: mini ? 24 : 32 }}>{label}</span>}
        </div>
      ))}
    </div>
  );
}

function DeckTile({ d, onLearn, onQuiz }: { d: Deck; onLearn: () => void; onQuiz: () => void }) {
  const { s } = useStore();
  const n = d.cards.length;
  const known = d.cards.filter((c) => statusOf(s.cards[c.id]) === 'known').length;
  const learning = d.cards.filter((c) => statusOf(s.cards[c.id]) === 'learning').length;
  const due = d.cards.filter((c) => isDue(s.cards[c.id])).length;
  const LABEL: Record<string, string> = { ops: 'Σ ×', compare: '≥ ≤', algebra: 'y=mx', geo: 'πr', 'f-given': 'A=πr²', 'f-memo': 'b²−4ac', mine: '✎' };
  const label = LABEL[d.id] ?? 'Aa';
  return (
    <article className="group">
      <button onClick={onLearn} disabled={!n} className="block w-full text-left transition-transform group-hover:-translate-y-1" aria-label={`${d.title} багцыг сурах`} id={`deck-${d.id}`}>
        <div className="grid place-items-center py-2"><DeckStack color={d.color} edge={d.edge} label={label} /></div>
      </button>
      <div className="mt-3 flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <div className="font-display font-bold text-[16px]">{d.title}</div>
          <div className="text-[12.5px] text-ink-3">{d.sub} · {n} карт</div>
        </div>
        {due > 0 && <Pill tone="leaf">{due} давтах</Pill>}
      </div>
      <div className="mt-3 flex h-2.5 rounded-full overflow-hidden bg-paper-2" aria-label={`${known} цээжилсэн, ${learning} сурч буй`}>
        <div className="bg-leaf bar-fill" style={{ width: `${(known / Math.max(1, n)) * 100}%` }} />
        <div className="bg-amber bar-fill" style={{ width: `${(learning / Math.max(1, n)) * 100}%` }} />
      </div>
      <div className="mt-3 flex gap-2">
        <Button size="sm" onClick={onLearn} disabled={!n} icon={<LuPlay size={14} />} style={{ ['--face' as any]: d.color, ['--edge' as any]: d.edge }}>Сурах</Button>
        <Button size="sm" variant="secondary" onClick={onQuiz} disabled={n < 4} icon={<LuZap size={14} />} id={`quiz-${d.id}`}>Тест</Button>
      </div>
    </article>
  );
}

function Reminder() {
  const { s, setReminder } = useStore();
  return (
    <div className="col-span-3 mt-1 flex items-center gap-3 rounded-2xl bg-paper-2 px-3 py-2.5 border border-line">
      <LuBell className={s.reminder.on ? 'text-leaf-2' : 'text-ink-3'} />
      <label htmlFor="rem-time" className="text-[13px] font-semibold flex-1">Өдөр бүрийн сануулга</label>
      <input id="rem-time" type="time" value={s.reminder.time} onChange={(e) => setReminder({ ...s.reminder, time: e.target.value })} disabled={!s.reminder.on}
        className="h-9 rounded-lg border border-line bg-paper px-2 text-[13px] font-mono disabled:opacity-50" />
      <button role="switch" aria-checked={s.reminder.on} aria-label="Сануулга" onClick={() => setReminder({ ...s.reminder, on: !s.reminder.on })}
        className={`h-7 w-12 rounded-full relative transition-colors ${s.reminder.on ? 'bg-leaf' : 'bg-line-2'}`}>
        <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${s.reminder.on ? 'left-6' : 'left-1'}`} />
      </button>
    </div>
  );
}

function MyCards() {
  const { s, addMyCard, removeMyCard } = useStore();
  const [f, setF] = useState({ front: '', back: '', hook: '', ex: '' });
  const add = (e: React.FormEvent) => {
    e.preventDefault();
    if (!f.front.trim() || !f.back.trim()) return;
    addMyCard({ id: `my-${Date.now()}`, front: f.front.trim(), back: f.back.trim(), hook: f.hook.trim() || undefined, ex: f.ex.trim() || undefined, art: 'power', v: 'eq' });
    setF({ front: '', back: '', hook: '', ex: '' });
  };
  const field = (k: keyof typeof f, l: string, ph: string) => (
    <label className="grid gap-1 text-[12.5px] font-semibold text-ink-2" htmlFor={`my-${k}`}>{l}
      <input id={`my-${k}`} value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} placeholder={ph}
        className="h-11 rounded-xl border-[1.5px] border-line bg-paper px-3 text-[14px] font-normal text-ink outline-none focus:border-leaf" />
    </label>
  );
  return (
    <section className="mt-10 grid lg:grid-cols-[1fr_1fr] gap-5">
      <form onSubmit={add} className="card p-5 grid gap-3">
        <div className="eyebrow">Шинэ карт</div>
        {field('front', 'Англи үг эсвэл томьёо', 'жишээ: in terms of')}
        {field('back', 'Монгол утга', 'жишээ: …-ээр илэрхийлбэл')}
        {field('hook', 'Санах түлхүүр (заавал биш)', 'Өөрийн санах арга')}
        {field('ex', 'Жишээ (заавал биш, $…$ дотор томьёо)', 'жишээ: $y$ in terms of $x$')}
        <Button type="submit" icon={<LuPlus />} disabled={!f.front.trim() || !f.back.trim()} id="my-add">Карт нэмэх</Button>
      </form>
      <div className="grid gap-2 content-start">
        {s.myCards.length === 0 && <div className="card p-6 text-center text-ink-3 text-[14px]">Одоохондоо карт алга. Зүүн талаас нэмээрэй.</div>}
        {s.myCards.map((c) => (
          <div key={c.id} className="card px-4 py-3 flex items-center gap-3">
            <div className="min-w-0 flex-1"><div className="font-display font-bold text-[14.5px] truncate">{c.front}</div><div className="text-[12.5px] text-ink-3 truncate">{c.back}</div></div>
            <button onClick={() => removeMyCard(c.id)} className="h-9 w-9 grid place-items-center rounded-xl text-ink-3 hover:text-danger hover:bg-danger-soft" aria-label={`${c.front} устгах`}><LuTrash2 size={16} /></button>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ———————————————— study session ———————————————— */
type Q = { card: Card; type: 'mc' | 'type' | 'listen' | 'formula'; options?: string[]; answer: string };

function buildQuiz(cards: Card[], kind: Deck['kind']): Q[] {
  const pool = kind === 'formula' ? DECKS.filter((d) => d.kind === 'formula').flatMap((d) => d.cards) : DECKS.filter((d) => d.kind === 'word').flatMap((d) => d.cards);
  const pick = cards.slice(0, 5);
  return pick.map((c, i) => {
    if (kind === 'formula') {
      const others = pool.filter((x) => x.id !== c.id && x.tex).sort(() => Math.random() - 0.5).slice(0, 3).map((x) => x.tex!);
      return { card: c, type: 'formula', options: [...others, c.tex!].sort(() => Math.random() - 0.5), answer: c.tex! };
    }
    const t = (['mc', 'type', 'listen'] as const)[i % 3];
    if (t === 'type') return { card: c, type: 'type', answer: c.front };
    const field = t === 'mc' ? 'front' : 'back';
    const others = pool.filter((x) => x.id !== c.id).sort(() => Math.random() - 0.5).slice(0, 3).map((x) => x[field]);
    return { card: c, type: t, options: [...others, c[field]].sort(() => Math.random() - 0.5), answer: c[field] };
  });
}

function Study({ session, onExit }: { session: Session; onExit: () => void }) {
  const { s, gradeCard, award, learnWords, bumpQuest } = useStore();
  const [queue, setQueue] = useState<Card[]>(session.cards);
  const [i, setI] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [log, setLog] = useState<Record<string, boolean>>({});
  const [phase, setPhase] = useState<'learn' | 'quiz' | 'done'>(session.quizOnly ? 'quiz' : 'learn');
  const [quiz] = useState(() => buildQuiz(session.cards, session.kind));
  const [qi, setQi] = useState(0);
  const [qAns, setQAns] = useState<string | null>(null);
  const [qScore, setQScore] = useState(0);
  const [typed, setTyped] = useState('');
  const card = queue[i];

  const grade = (knew: boolean) => {
    if (!card) return;
    gradeCard(card.id, knew);
    setLog((l) => ({ ...l, [card.id]: l[card.id] === false ? false : knew }));
    const again = !knew && queue.filter((c) => c.id === card.id).length < 2; // see a forgotten card once more
    const nextQueue = again ? [...queue, card] : queue;
    setQueue(nextQueue);
    setFlipped(false);
    setTimeout(() => {
      if (i + 1 >= nextQueue.length) setPhase(quiz.length >= 3 ? 'quiz' : 'done');
      else setI((k) => k + 1);
    }, 220);
  };

  useEffect(() => {
    if (phase !== 'learn') return;
    const h = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === 'TEXTAREA' || (e.target as HTMLElement)?.tagName === 'INPUT') return;
      if (e.key === 'ArrowRight') grade(true);
      else if (e.key === 'ArrowLeft') grade(false);
      else if (e.key === ' ') { e.preventDefault(); setFlipped((f) => !f); }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  });

  const finished = useRef(false);
  useEffect(() => {
    if (phase !== 'done' || finished.current) return;
    finished.current = true;
    const knew = Object.entries(log).filter(([, v]) => v).map(([k]) => k);
    const xp = knew.length * 2 + qScore * 3 + 5;
    award(xp, `Карт: ${session.title}`);
    if (session.kind !== 'formula') learnWords(session.cards.filter((c) => knew.includes(c.id)).map((c) => c.front));
  }, [phase]); // eslint-disable-line

  const total = session.quizOnly ? quiz.length : queue.length + quiz.length;
  const doneCount = phase === 'learn' ? i : phase === 'quiz' ? (session.quizOnly ? 0 : queue.length) + qi : total;

  return (
    <div className="gutter py-5 md:py-8 max-w-[1120px] mx-auto">
      <div className="grid lg:grid-cols-[1fr_440px_1fr] gap-6 items-start">
        <aside className="hidden lg:block pt-16">
          <div className="eyebrow">Багц</div>
          <div className="font-display font-bold text-[18px] mt-1">{session.title}</div>
          <div className="text-[13px] text-ink-3 mt-1">{session.cards.length} карт · {quiz.length} асуулт</div>
          <div className="mt-6 grid gap-2 text-[13px] text-ink-2">
            <div className="flex items-center gap-2"><kbd className="kbd">←</kbd> Дахин</div>
            <div className="flex items-center gap-2"><kbd className="kbd">→</kbd> Мэднэ</div>
            <div className="flex items-center gap-2"><kbd className="kbd">Space</kbd> Эргүүлэх</div>
          </div>
        </aside>

        {/* phone */}
        <div className="mx-auto w-full max-w-[440px]">
          <div className="rounded-[40px] p-3 sm:p-4 border-[1.5px] border-line bg-paper-2" style={{ boxShadow: '0 8px 0 var(--c-edge), 0 40px 60px -30px rgba(0,0,0,.45)' }}>
            <div className="flex items-center gap-3 px-1 pt-1">
              <button onClick={onExit} className="h-10 w-10 grid place-items-center rounded-full hover:bg-paper text-ink-2" aria-label="Гарах" id="study-exit"><LuX size={20} /></button>
              <div className="flex-1 h-3 rounded-full bg-paper overflow-hidden border border-line"><div className="h-full rounded-full bar-fill" style={{ width: `${(doneCount / Math.max(1, total)) * 100}%`, background: session.color }} /></div>
              <span className="text-[12px] font-mono font-bold text-ink-3 tnum w-12 text-right">{Math.min(doneCount + (phase === 'done' ? 0 : 1), total)}/{total}</span>
            </div>
            <div className="mt-3 min-h-[560px] relative">
              {phase === 'learn' && card && (
                <SwipeStack key={card.id + i} card={card} next={queue.slice(i + 1, i + 3)} flipped={flipped} setFlipped={setFlipped} onGrade={grade} kind={session.kind} color={session.color} />
              )}
              {phase === 'quiz' && quiz[qi] && (
                <QuizCard key={qi} q={quiz[qi]} ans={qAns} typed={typed} setTyped={setTyped}
                  onAnswer={(a) => { setQAns(a); if (a.trim().toLowerCase() === quiz[qi].answer.toLowerCase()) setQScore((x) => x + 1); }}
                  onNext={() => { setQAns(null); setTyped(''); if (qi + 1 < quiz.length) setQi(qi + 1); else setPhase('done'); }} />
              )}
              {phase === 'done' && <Summary session={session} log={log} qScore={qScore} qTotal={quiz.length} onExit={onExit} cardsState={s.cards} />}
            </div>
          </div>
        </div>

        <aside className="hidden lg:block pt-16">
          <div className="eyebrow">Санах ойн хайрцаг</div>
          <div className="mt-3 grid gap-2">
            {LEITNER_DAYS.slice(1).map((d, b) => {
              const n = session.cards.filter((c) => (s.cards[c.id]?.box ?? 0) === b + 1).length;
              return (
                <div key={d} className="flex items-center gap-3">
                  <span className="h-8 w-8 rounded-xl grid place-items-center text-[12px] font-bold text-white coin" style={{ ['--face' as any]: `color-mix(in srgb, var(--c-leaf) ${40 + b * 20}%, var(--c-forest-2))`, ['--edge' as any]: 'var(--c-edge)' }}>{b + 1}</span>
                  <span className="text-[13px] flex-1">{d} хоногийн дараа</span>
                  <span className="font-mono font-bold text-[13px] tnum">{n}</span>
                </div>
              );
            })}
          </div>
          <div className="mt-6 flex gap-3 items-start rounded-2xl bg-sage p-4"><CatHead size={40} mood="wink" /><p className="text-[13px] text-ink-2">Мэдэхгүй картаа энэ хичээл дотроо дахин нэг удаа харна. Ингэж давтах тусам урт хугацааны санах ойд үлдэнэ.</p></div>
        </aside>
      </div>
    </div>
  );
}

function SwipeStack({ card, next, flipped, setFlipped, onGrade, kind, color }: {
  card: Card; next: Card[]; flipped: boolean; setFlipped: (f: boolean | ((x: boolean) => boolean)) => void; onGrade: (k: boolean) => void; kind: Deck['kind']; color: string;
}) {
  const [dx, setDx] = useState(0);
  const [fly, setFly] = useState<0 | 1 | -1>(0);
  const start = useRef<{ x: number; id: number } | null>(null);
  const moved = useRef(false);
  const release = (knew: boolean) => { setFly(knew ? 1 : -1); setTimeout(() => onGrade(knew), 200); };
  const onDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('button, textarea, a')) return;
    start.current = { x: e.clientX, id: e.pointerId }; moved.current = false;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onMove = (e: React.PointerEvent) => { if (!start.current) return; const d = e.clientX - start.current.x; if (Math.abs(d) > 6) moved.current = true; setDx(d); };
  const onUp = () => {
    if (!start.current) return;
    start.current = null;
    if (dx > 110) release(true); else if (dx < -110) release(false);
    else { if (!moved.current) setFlipped((f) => !f); setDx(0); }
  };
  const x = fly ? fly * 520 : dx;
  const tint = Math.max(-1, Math.min(1, dx / 140));
  return (
    <div className="relative h-[560px] select-none">
      {/* cards behind */}
      {next.map((c, k) => (
        <div key={c.id} className="absolute inset-x-3 top-0 h-[440px] rounded-[30px] border-[1.5px] border-line bg-paper"
          style={{ transform: `translateY(${(k + 1) * 12}px) scale(${1 - (k + 1) * 0.045})`, zIndex: 2 - k, boxShadow: '0 5px 0 var(--c-edge)', opacity: 1 - k * 0.25 }} aria-hidden="true" />
      ))}
      {/* top card */}
      <div className="absolute inset-x-3 top-0 h-[440px] z-10 card-in touch-pan-y cursor-grab active:cursor-grabbing"
        style={{ transform: `translateX(${x}px) rotate(${x / 18}deg)`, transition: start.current ? 'none' : 'transform .25s cubic-bezier(.2,.7,.2,1)' }}
        onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}>
        <div className="flip h-full">
          <div className={`flip-inner h-full ${flipped ? 'is-flipped' : ''}`}>
            <CardFace card={card} kind={kind} color={color} />
            <CardBack card={card} kind={kind} color={color} />
          </div>
        </div>
        {tint !== 0 && (
          <div className="absolute inset-0 rounded-[30px] pointer-events-none grid place-items-start p-6" style={{ background: tint > 0 ? `rgba(22,163,74,${tint * 0.25})` : `rgba(200,81,63,${-tint * 0.25})` }}>
            <span className={`font-display font-extrabold text-[22px] px-3 py-1 rounded-xl border-[3px] ${tint > 0 ? 'text-leaf border-leaf ml-auto rotate-12' : 'text-danger border-danger -rotate-12'}`} style={{ opacity: Math.abs(tint) }}>{tint > 0 ? 'МЭДНЭ' : 'ДАХИН'}</span>
          </div>
        )}
      </div>
      {/* controls */}
      <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-5">
        <RoundBtn onClick={() => release(false)} label="Дахин" face="var(--c-danger-soft)" edge="color-mix(in srgb, var(--c-danger) 50%, var(--c-danger-soft))" fg="var(--c-danger)" id="card-again"><LuX size={26} strokeWidth={3} /></RoundBtn>
        <RoundBtn onClick={() => setFlipped((f) => !f)} label="Эргүүлэх" face="var(--c-paper)" edge="var(--c-line-2)" fg="var(--c-ink-2)" small id="card-flip"><LuRotateCcw size={20} /></RoundBtn>
        <RoundBtn onClick={() => release(true)} label="Мэднэ" face="var(--c-leaf)" edge="var(--c-leaf-2)" fg="#fff" id="card-know"><LuCheck size={28} strokeWidth={3} /></RoundBtn>
      </div>
    </div>
  );
}

function RoundBtn({ children, onClick, label, face, edge, fg, small, id }: { children: React.ReactNode; onClick: () => void; label: string; face: string; edge: string; fg: string; small?: boolean; id?: string }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <button onClick={onClick} aria-label={label} id={id} className={`btn3d rounded-full grid place-items-center ${small ? 'h-12 w-12' : 'h-16 w-16'} mb-[5px]`} style={{ ['--face' as any]: face, ['--edge' as any]: edge, color: fg }}>{children}</button>
      <span className="text-[11.5px] font-bold text-ink-3">{label}</span>
    </div>
  );
}

function CardFace({ card, kind, color }: { card: Card; kind: Deck['kind']; color: string }) {
  const isF = kind === 'formula' || !!card.tex && !card.ipa;
  return (
    <div className="flip-face rounded-[30px] bg-paper border-[1.5px] border-line overflow-hidden flex flex-col" style={{ boxShadow: '0 6px 0 var(--c-edge)' }}>
      <div className="h-[200px] grid place-items-center relative" style={{ background: `color-mix(in srgb, ${color} 14%, var(--c-paper))` }}>
        <CardArt key={card.id} art={card.art} v={card.v} size={230} />
      </div>
      <div className="flex-1 grid place-items-center text-center px-6 pb-4">
        <div>
          <div className={`font-display font-extrabold tracking-[-0.02em] leading-tight ${isF ? 'text-[26px]' : card.front.length > 10 ? 'text-[30px]' : 'text-[40px]'}`}>{card.front}</div>
          {card.ipa && (
            <div className="mt-2 flex items-center justify-center gap-2 text-ink-3">
              <span className="font-mono text-[14px]">{card.ipa}</span><span className="text-[13px]">· {card.say}</span>
              <button onClick={(e) => { e.stopPropagation(); speak(card.front); }} className="h-9 w-9 grid place-items-center rounded-full bg-paper-2 border border-line text-ink-2 hover:text-leaf-2" aria-label="Дуудлага сонсох" id="card-speak"><LuVolume2 size={17} /></button>
            </div>
          )}
          {isF && <div className="mt-1 text-[13px] text-ink-3">{card.back}</div>}
          <div className="mt-4 text-[12px] text-ink-3">{isF ? 'Томьёогоо санаад эргүүл' : 'Утгыг нь санаад эргүүл'}</div>
        </div>
      </div>
    </div>
  );
}

function CardBack({ card, kind, color }: { card: Card; kind: Deck['kind']; color: string }) {
  const { s, setNote } = useStore();
  const [edit, setEdit] = useState(false);
  const note = s.notes[card.id];
  const isF = kind === 'formula' || !!card.tex && !card.ipa;
  return (
    <div className="flip-face flip-back rich-inherit rounded-[30px] overflow-hidden flex flex-col" style={{ background: 'var(--c-forest-2)', color: 'var(--c-on-forest)', boxShadow: '0 6px 0 var(--c-edge)' }}>
      <div className="px-6 pt-6 pb-4 text-center">
        <div className="text-[12px] font-mono font-bold opacity-60 uppercase tracking-wider">{card.front}</div>
        {isF ? (
          <div className="mt-3 text-[26px] overflow-x-auto no-scrollbar py-1"><Tex tex={card.tex!} display /></div>
        ) : (
          <div className="mt-2 font-display font-extrabold text-[32px] leading-tight" style={{ color: 'var(--c-lime)' }}>{card.back}</div>
        )}
      </div>
      <div className="flex-1 px-5 pb-5 grid gap-2.5 content-start overflow-y-auto no-scrollbar text-[14px]">
        {isF && card.when && <div className="rounded-2xl bg-white/[0.07] px-4 py-3"><span className="text-[11px] font-mono font-bold opacity-60 uppercase tracking-wider block mb-0.5">Хэзээ</span><Rich text={card.when} /></div>}
        <div className="rounded-2xl px-4 py-3" style={{ background: `color-mix(in srgb, ${color} 30%, transparent)` }}>
          <div className="flex items-center gap-2 mb-1">
            <CatHead size={22} style={{ ['--c-cat-rim' as any]: '#3d6b52' }} />
            <span className="text-[11px] font-mono font-bold opacity-75 uppercase tracking-wider flex-1">{note ? 'Миний санах түлхүүр' : 'Санах түлхүүр'}</span>
            <button onClick={(e) => { e.stopPropagation(); setEdit((x) => !x); }} className="h-7 w-7 grid place-items-center rounded-lg hover:bg-white/10" aria-label="Санах түлхүүр засах" id="hook-edit"><LuPencil size={13} /></button>
          </div>
          {edit ? (
            <textarea autoFocus defaultValue={note ?? card.hook ?? ''} onBlur={(e) => { setNote(card.id, e.target.value); setEdit(false); }} onClick={(e) => e.stopPropagation()} id="hook-text"
              className="w-full min-h-[72px] rounded-xl bg-black/20 p-2 text-[14px] outline-none border border-white/20" aria-label="Өөрийн санах арга" />
          ) : (
            <Rich text={note ?? card.hook ?? 'Өөрийн санах аргаа бичээрэй.'} />
          )}
        </div>
        {card.ex && <div className="rounded-2xl bg-white/[0.07] px-4 py-3"><span className="text-[11px] font-mono font-bold opacity-60 uppercase tracking-wider block mb-0.5">Жишээ</span><Rich text={card.ex} /></div>}
      </div>
    </div>
  );
}

function QuizCard({ q, ans, onAnswer, onNext, typed, setTyped }: { q: Q; ans: string | null; onAnswer: (a: string) => void; onNext: () => void; typed: string; setTyped: (s: string) => void }) {
  const ok = ans !== null && ans.trim().toLowerCase() === q.answer.toLowerCase();
  useEffect(() => { if (q.type === 'listen') speak(q.card.front); }, []); // eslint-disable-line
  const prompt =
    q.type === 'mc' ? <><div className="text-[13px] text-ink-3">Англиар юу гэдэг вэ?</div><div className="font-display font-extrabold text-[28px] mt-1">{q.card.back}</div></>
    : q.type === 'type' ? <><div className="text-[13px] text-ink-3">Англиар бич</div><div className="font-display font-extrabold text-[28px] mt-1">{q.card.back}</div><div className="text-[13px] text-ink-3 mt-1">Дуудлага: {q.card.say}</div></>
    : q.type === 'listen' ? <><div className="text-[13px] text-ink-3">Сонсоод утгыг нь сонго</div><button onClick={() => speak(q.card.front)} className="mt-3 h-16 w-16 rounded-full btn3d grid place-items-center mx-auto mb-[5px]" style={{ ['--face' as any]: 'var(--c-teal)', ['--edge' as any]: 'var(--c-teal-2)', color: '#fff' }} aria-label="Дахин сонсох"><LuVolume2 size={26} /></button><div className="font-mono text-[14px] text-ink-3 mt-2">{q.card.ipa}</div></>
    : <><div className="text-[13px] text-ink-3">Зөв томьёог сонго</div><div className="font-display font-extrabold text-[24px] mt-1">{q.card.front}</div></>;
  return (
    <div className="h-[560px] flex flex-col card-in">
      <div className="rounded-[30px] bg-paper border-[1.5px] border-line p-6 text-center" style={{ boxShadow: '0 6px 0 var(--c-edge)' }}>
        <Pill tone="teal">Тест</Pill>
        <div className="mt-3">{prompt}</div>
      </div>
      <div className="mt-5 grid gap-2.5">
        {q.type === 'type' ? (
          <form onSubmit={(e) => { e.preventDefault(); if (!ans && typed.trim()) onAnswer(typed); }} className="grid gap-2.5">
            <input autoFocus id="quiz-type" value={typed} onChange={(e) => setTyped(e.target.value)} disabled={ans !== null} autoComplete="off" spellCheck={false} placeholder="English…"
              className={`h-14 rounded-2xl border-2 px-5 text-[18px] font-semibold outline-none bg-paper ${ans === null ? 'border-line-2 focus:border-leaf' : ok ? 'border-leaf bg-sage' : 'border-rose bg-rose-soft'}`} />
            {ans === null && <Button type="submit" disabled={!typed.trim()}>Шалгах</Button>}
          </form>
        ) : q.options!.map((o, k) => {
          const pick = ans === o, right = ans !== null && o === q.answer;
          return (
            <button key={k} disabled={ans !== null} onClick={() => onAnswer(o)} id={`qopt-${k}`}
              className={`min-h-[56px] rounded-2xl border-2 px-4 py-2 text-left text-[15.5px] font-semibold transition-transform active:translate-y-0.5 ${right ? 'border-leaf bg-sage' : pick ? 'border-rose bg-rose-soft' : 'border-line bg-paper hover:border-line-2'}`}
              style={{ boxShadow: '0 3px 0 var(--c-edge)' }}>
              {q.type === 'formula' ? <Tex tex={o} /> : o}
            </button>
          );
        })}
      </div>
      {ans !== null && (
        <div className={`mt-auto rounded-2xl p-4 flex items-center gap-3 anim-rise ${ok ? 'bg-sage' : 'bg-rose-soft'}`}>
          <CatHead size={40} mood={ok ? 'happy' : 'think'} />
          <div className="flex-1 min-w-0 text-[14px]"><b className={ok ? 'text-leaf-2' : 'text-rose'}>{ok ? 'Зөв!' : 'Зөв хариу:'}</b> {!ok && (q.type === 'formula' ? <Tex tex={q.answer} /> : q.answer)}</div>
          <Button size="sm" onClick={onNext} id="quiz-next">Дараах</Button>
        </div>
      )}
    </div>
  );
}

function Summary({ session, log, qScore, qTotal, onExit, cardsState }: { session: Session; log: Record<string, boolean>; qScore: number; qTotal: number; onExit: () => void; cardsState: Record<string, CardState> }) {
  const knew = Object.values(log).filter(Boolean).length;
  const forgot = Object.values(log).length - knew;
  const xp = knew * 2 + qScore * 3 + 5;
  const nextDays = (id: string) => { const st = cardsState[id]; return st ? Math.max(0, Math.round((st.due - Date.now()) / 864e5)) : 0; };
  return (
    <div className="h-[560px] flex flex-col items-center text-center relative overflow-hidden card-in">
      <Confetti />
      <div className="anim-bounce-cat mt-4"><CatHead size={110} mood="happy" /></div>
      <div className="eyebrow mt-3">Багц дууслаа</div>
      <h2 className="font-display font-extrabold text-[24px] mt-1">{session.title}</h2>
      <div className="mt-5 grid grid-cols-3 gap-2 w-full">
        <div className="rounded-2xl bg-sage py-3"><div className="font-display font-extrabold text-[24px] text-leaf-2 tnum">{knew}</div><div className="text-[11.5px] text-ink-3">мэдсэн</div></div>
        <div className="rounded-2xl bg-rose-soft py-3"><div className="font-display font-extrabold text-[24px] text-rose tnum">{forgot}</div><div className="text-[11.5px] text-ink-3">дахин</div></div>
        <div className="rounded-2xl py-3" style={{ background: 'var(--c-forest-2)', color: 'var(--c-on-forest)' }}><div className="font-display font-extrabold text-[24px] tnum" style={{ color: 'var(--c-lime)' }}>+{xp}</div><div className="text-[11.5px] opacity-70">XP</div></div>
      </div>
      {qTotal > 0 && <div className="mt-3 text-[13px] text-ink-2">Тест: <b>{qScore}/{qTotal}</b> зөв</div>}
      <div className="mt-4 w-full grid gap-1.5 text-left overflow-y-auto no-scrollbar max-h-[150px]">
        {session.cards.map((c) => (
          <div key={c.id} className="flex items-center gap-3 rounded-xl bg-paper px-3 py-2 border border-line text-[13px]">
            <span className={`h-2.5 w-2.5 rounded-full ${log[c.id] === false ? 'bg-rose' : 'bg-leaf'}`} />
            <span className="font-semibold flex-1 truncate">{c.front}</span>
            <span className="text-ink-3 font-mono text-[12px]">{nextDays(c.id) === 0 ? 'өнөөдөр' : `${nextDays(c.id)} хоногт`}</span>
          </div>
        ))}
      </div>
      <div className="mt-auto w-full"><Button size="lg" className="w-full" onClick={onExit} id="summary-done">Багцууд руу</Button></div>
    </div>
  );
}
