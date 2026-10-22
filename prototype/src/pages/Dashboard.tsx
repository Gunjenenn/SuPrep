import { LuArrowRight, LuCalendarDays, LuCheck, LuFlame, LuMedal, LuSigma, LuSpline, LuTarget, LuTimer } from 'react-icons/lu';
import { CatSitting } from '../brand/Cat';
import { Blob, Stars } from '../brand/Decor';
import { STAGES, levelFor } from '../data/curriculum';
import { QUESTS } from '../data/meta';
import { QUESTIONS, qById } from '../data/questions';
import { mnDate, dayKey, desmosDoneCount, nextNode, useStore, Route } from '../lib/store';
import { Bar, Button, CountUp, Pill, Ring, SectionTitle } from '../components/ui';
import { Rich } from '../components/Math';
import { DESMOS } from '../data/desmos';

const WEEK = ['Да', 'Мя', 'Лх', 'Пү', 'Ба', 'Бя', 'Ня'];

export function greeting() {
  const h = new Date().getHours();
  return h < 5 ? 'Шөнө оройтлоо' : h < 12 ? 'Өглөөний мэнд' : h < 18 ? 'Өдрийн мэнд' : 'Оройн мэнд';
}

export function daysUntil(date: string) {
  const d = new Date(date + 'T09:00:00');
  return Math.max(0, Math.ceil((d.getTime() - Date.now()) / 864e5));
}

export default function Dashboard() {
  const { s, go } = useStore();
  const lv = levelFor(s.xp);
  const nx = nextNode(s);
  const today = dayKey();
  const studiedToday = s.streak.last === today;
  const days = daysUntil(s.profile.examDate);
  const dDone = desmosDoneCount(s);
  const yesterdayXp = s.xpLog.filter((l) => l.day === dayKey(new Date(Date.now() - 864e5))).reduce((a, b) => a + b.amount, 0);
  const todayXp = s.xpLog.filter((l) => l.day === today).reduce((a, b) => a + b.amount, 0);

  // this week's study days (Mon-first)
  const now = new Date();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  const studied = new Set(s.xpLog.map((l) => l.day));
  const week = WEEK.map((w, i) => {
    const d = new Date(monday); d.setDate(monday.getDate() + i);
    const k = dayKey(d);
    return { w, k, on: studied.has(k), today: k === today, future: d > now && k !== today };
  });

  const openNode = (r: { node: any; stage: any }) => {
    const n = r.node;
    if (n.kind === 'desmos') go({ name: 'desmos', id: n.desmosId });
    else go({ name: 'lesson', id: n.id });
  };

  const suuLine = studiedToday
    ? `Өнөөдөр **${todayXp} XP** цуглууллаа. Хэмнэлээ барьж байна — ингээд л явъя.`
    : yesterdayXp
      ? `Өчигдөр ${yesterdayXp} XP цуглуулсан шүү. Өнөөдөр нэг хичээл хийвэл **${s.streak.count + 1} өдөр** дараалсан хэмнэл болно.`
      : 'Шинэ өдөр, шинэ эхлэл. Богинохон нэг хичээлээс эхэлье.';

  const featured = DESMOS.find((d) => d.featured)!;
  const featuredDone = !!s.done['s3-d3'];
  const openMistakes = s.mistakes.filter((m) => !m.resolved);

  return (
    <div className="gutter py-6 md:py-8 max-w-[1240px] mx-auto">
      {/* hero */}
      <section className="card relative overflow-hidden p-6 md:p-8 grid md:grid-cols-[1fr_300px] gap-6 items-center">
        <div className="relative z-10 min-w-0">
          <div className="eyebrow">{greeting()}</div>
          <h1 className="mt-2 font-display font-extrabold text-[30px] md:text-[40px] leading-[1.02] tracking-[-0.02em]">
            {s.profile.name}, <span className="font-script font-bold text-leaf text-[36px] md:text-[48px] tracking-normal">мяу!</span>
          </h1>
          <p className="mt-3 text-ink-2 text-[15px] max-w-[52ch]"><Rich text={suuLine} /></p>
          {nx && (
            <div className="mt-6 rounded-2xl border border-line bg-paper-2/60 p-4 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="min-w-0 flex-1">
                <div className="text-[11.5px] font-semibold text-ink-3 uppercase tracking-wider">Үргэлжлүүлэх · {nx.stage.no}-р шат · {nx.stage.title}</div>
                <div className="font-display font-extrabold text-[18px] mt-0.5 truncate">{nx.node.title}</div>
                <div className="text-[12.5px] text-ink-3 mt-0.5">{nx.node.en} · {nx.node.minutes} мин · +{nx.node.xp} XP</div>
              </div>
              <Button size="lg" onClick={() => openNode(nx)} icon={<LuArrowRight />} className="flex-row-reverse w-full sm:w-auto" id="continue-btn">Үргэлжлүүлэх</Button>
            </div>
          )}
        </div>
        <div className="relative h-[230px] md:h-[270px] hidden sm:block" aria-hidden="true">
          <div className="absolute left-1/2 -translate-x-1/2 bottom-0 w-[230px] h-[64px] rounded-[50%] coin" style={{ ['--face' as any]: 'var(--c-leaf)', ['--edge' as any]: 'var(--c-leaf-2)' }} />
          <Stars className="absolute -top-2 right-0 w-40" />
          <div className="absolute left-1/2 -translate-x-1/2 bottom-6 anim-floaty"><CatSitting size={150} mood={studiedToday ? 'happy' : 'idle'} /></div>
        </div>
      </section>

      {/* stats */}
      <section className="mt-5 grid grid-cols-1 min-[520px]:grid-cols-2 lg:grid-cols-4 gap-4 stagger">
        <button onClick={() => go({ name: 'progress' })} className="card lift p-5 text-left flex items-center gap-4">
          <Ring value={lv.pct} size={62}><span className="font-display font-extrabold text-xl">{lv.n}</span></Ring>
          <div className="min-w-0">
            <div className="text-[11.5px] text-ink-3 font-semibold uppercase tracking-wider">Түвшин</div>
            <div className="font-display font-extrabold truncate">{lv.mn}</div>
            <div className="text-[12px] text-ink-3 tnum"><CountUp value={s.xp} /> XP · {lv.next ? `${lv.toNext} дутуу` : 'Дээд'}</div>
          </div>
        </button>
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <div className="text-[11.5px] text-ink-3 font-semibold uppercase tracking-wider">Хэмнэл</div>
            <LuFlame className="text-rose" />
          </div>
          <div className="font-display font-extrabold text-[28px] leading-none mt-1 tnum">{s.streak.count}<span className="text-sm font-bold text-ink-3 ml-1">өдөр</span></div>
          <div className="mt-3 flex justify-between gap-1">
            {week.map((d) => (
              <div key={d.k} className="flex flex-col items-center gap-1">
                <span className={`h-6 w-6 rounded-full grid place-items-center text-[10px] ${d.on ? 'bg-rose text-white' : d.today ? 'border-2 border-dashed border-rose/60' : 'bg-paper-2'}`}>{d.on && <LuCheck size={12} strokeWidth={3} />}</span>
                <span className={`text-[10px] ${d.today ? 'font-bold text-ink' : 'text-ink-3'}`}>{d.w}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <div className="text-[11.5px] text-ink-3 font-semibold uppercase tracking-wider">SAT хүртэл</div>
            <LuCalendarDays className="text-ink-3" />
          </div>
          <div className="font-thin text-[40px] leading-none mt-1 tnum text-leaf">{days}<span className="font-sans text-sm font-bold text-ink-3 ml-1.5">хоног</span></div>
          <div className="mt-2 text-[12px] text-ink-2 flex items-center gap-1.5"><LuTarget size={13} /> Зорилт <b className="tnum">{s.profile.target}</b> · {mnDate(s.profile.examDate)}</div>
        </div>
        <button onClick={() => go({ name: 'desmos' })} className="card lift p-5 text-left">
          <div className="flex items-center justify-between">
            <div className="text-[11.5px] text-ink-3 font-semibold uppercase tracking-wider">Desmos</div>
            <LuSpline className="text-teal" />
          </div>
          <div className="font-display font-extrabold text-[28px] leading-none mt-1 tnum">{dDone}<span className="text-sm font-bold text-ink-3 ml-1">/ {DESMOS.length}</span></div>
          <Bar value={dDone / DESMOS.length} tone="teal" className="mt-3" />
          <div className="mt-2 text-[12px] text-ink-3">хичээл эзэмшсэн</div>
        </button>
      </section>

      {/* дасгал & материал shortcuts */}
      <section className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-4">
        {([
          ['hard', 'Хүнд асуулт', `${QUESTIONS.filter((q) => q.difficulty === 3).length} асуулт · 700+`, 'var(--c-rose)', <LuFlame key="f" size={20} />],
          ['mock', 'Бүтэн тест', '2 модуль · 70 мин', 'var(--c-teal)', <LuTimer key="t" size={20} />],
          ['formulas', 'Томьёоны хуудас', '12 өгөгдөнө + 6 цээжлэх', 'var(--c-amber)', <LuSigma key="s" size={20} />],
          ['league', 'Ногоон лиг', 'Долоо хоногийн чансаа', 'var(--c-leaf)', <LuMedal key="m" size={20} />],
        ] as const).map(([r, t, sub, c, icon]) => (
          <button key={r} onClick={() => go({ name: r } as Route)} className="card lift p-4 text-left flex items-center gap-3 min-w-0" id={`tile-${r}`}>
            <span className="coin h-11 w-11 shrink-0 rounded-2xl grid place-items-center text-white" style={{ ['--face' as any]: c, ['--edge' as any]: `color-mix(in srgb, #000 35%, ${c})` }}>{icon}</span>
            <span className="min-w-0"><span className="block font-display font-bold text-[14px] truncate">{t}</span><span className="block text-[12px] text-ink-3 truncate">{sub}</span></span>
          </button>
        ))}
      </section>

      <div className="mt-5 grid lg:grid-cols-[1.15fr_1fr] gap-5">
        {/* quests */}
        <section className="card p-6">
          <SectionTitle eyebrow="Өнөөдөр" title="Өдрийн даалгавар" right={<Pill tone="leaf">+10 XP тус бүр</Pill>} />
          <ul className="mt-5 grid gap-3">
            {QUESTS.map((q) => {
              const p = Math.min(q.target, s.quests.p[q.id] || 0);
              const done = p >= q.target;
              return (
                <li key={q.id}>
                  <button onClick={() => go({ name: q.go } as Route)} className={`w-full text-left flex items-center gap-4 rounded-2xl border px-4 py-3.5 transition-colors ${done ? 'border-sage-2 bg-sage/50' : 'border-line hover:border-line-2 bg-paper'}`}>
                    <span className={`h-9 w-9 shrink-0 rounded-xl grid place-items-center ${done ? 'bg-leaf text-white' : 'bg-paper-2 text-ink-3'}`}>
                      {done ? <LuCheck strokeWidth={3} /> : <span className="text-xs font-bold tnum">{p}/{q.target}</span>}
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className={`block text-[14px] font-semibold ${done ? 'text-leaf-2' : ''}`}>{q.title}</span>
                      <Bar value={p / q.target} tone={done ? 'leaf' : 'moss'} h={5} className="mt-2" />
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>

        {/* desmos shortcut */}
        <section className="rounded-[20px] bg-forest text-cream p-6 relative overflow-hidden shadow-card">
          <svg viewBox="0 0 300 200" className="absolute right-0 bottom-0 w-[62%] opacity-90" aria-hidden="true">
            <g stroke="#ffffff" strokeOpacity={0.07}>{Array.from({ length: 16 }).map((_, i) => <path key={i} d={`M${i * 20} 0 V200 M0 ${i * 20} H300`} />)}</g>
            <path d="M20 190 L280 30" stroke="#9acb3c" strokeWidth={3} className="draw-path" style={{ ['--len' as any]: 310 }} />
            <path d="M40 40 L290 175" stroke="#d3968c" strokeWidth={3} className="draw-path" style={{ ['--len' as any]: 290, animationDelay: '.3s' }} />
            <circle cx={176} cy={106} r={7} fill="#f3f0e6" className="anim-pop" style={{ animationDelay: '1.4s' }} />
            <rect x={186} y={70} width={58} height={24} rx={6} fill="#f3f0e6" className="anim-pop" style={{ animationDelay: '1.5s' }} />
            <text x={215} y={87} textAnchor="middle" fontSize={13} fontWeight={700} fill="#0a3323" fontFamily="Onest" className="anim-pop" style={{ animationDelay: '1.5s' }}>(2, 5)</text>
          </svg>
          <div className="relative max-w-[60%] min-w-[200px]">
            <div className="eyebrow" style={{ color: 'var(--c-lime)' }}>Desmos Академи</div>
            <h3 className="mt-2 font-display font-extrabold text-[22px] leading-tight">Өнөөдрийн сорилт</h3>
            <p className="mt-2 text-cream/75 text-[14px]">{featured.title}: <Rich text={featured.question!.replace('Find the intersection of ', '')} /></p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Button onClick={() => go({ name: 'desmos', id: 'd3' })} variant="lime" id="desmos-challenge-btn">{featuredDone ? 'Дахин бодох' : 'Эхлэх'} · +40 XP</Button>
              <Button variant="ghost" onClick={() => go({ name: 'desmos' })} className="!text-cream/80 hover:!bg-white/10">Бүх хичээл</Button>
            </div>
            {featuredDone && <div className="mt-3 text-[12px] text-lime inline-flex items-center gap-1"><LuCheck /> Дуусгасан</div>}
          </div>
        </section>
      </div>

      <div className="mt-5 grid lg:grid-cols-[1fr_1fr] gap-5">
        {/* journey progress */}
        <section className="card p-6">
          <SectionTitle eyebrow="Замнал" title="Сургалтын ахиц" right={<button onClick={() => go({ name: 'journey' })} className="text-[13px] font-semibold text-leaf hover:underline">Замнал харах →</button>} />
          <div className="mt-5 grid gap-4">
            {STAGES.map((st) => {
              const done = st.nodes.filter((n) => s.done[n.id]).length;
              return (
                <div key={st.id} className="grid grid-cols-[28px_1fr_auto] items-center gap-3">
                  <span className="font-thin text-[22px] text-ink-3 tnum">{String(st.no).padStart(2, '0')}</span>
                  <div className="min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="font-semibold text-[14px] truncate">{st.title}</span>
                      <span className="text-[11.5px] text-ink-3 tnum">{done}/{st.nodes.length}</span>
                    </div>
                    <Bar value={done / st.nodes.length} tone={st.tone === 'teal' ? 'teal' : st.tone === 'rose' ? 'rose' : st.tone === 'moss' ? 'moss' : 'leaf'} h={6} className="mt-1.5" />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* AI study planner (from the deck) */}
        <section className="card p-6">
          <SectionTitle eyebrow="AI төлөвлөгөө" title="Энэ долоо хоногийн төлөвлөгөө" right={<button onClick={() => go({ name: 'planner' })} className="text-[13px] font-bold text-leaf-2 hover:underline">Төлөвлөгөө →</button>} />
          <div className="mt-5 grid grid-cols-7 gap-1.5 items-end h-[150px]">
            {[
              { t: 'Алгебр', h: 58 }, { t: 'Шугаман', h: 42 }, { t: 'Функц', h: 76 }, { t: 'Геометр', h: 50 },
              { t: 'Статистик', h: 36 }, { t: 'Давталт', h: 66 }, { t: 'Mock', h: 100, dark: true },
            ].map((d, i) => {
              const isToday = (new Date().getDay() + 6) % 7 === i;
              return (
                <div key={i} className="flex flex-col items-center gap-1.5 h-full justify-end">
                  <div className={`w-full rounded-lg px-1 pt-1.5 text-[9.5px] font-semibold leading-tight text-center ${d.dark ? 'bg-leaf text-white' : isToday ? 'bg-sage-2 text-leaf-2' : 'bg-sage text-ink-2'} ${isToday ? 'ring-2 ring-leaf ring-offset-2 ring-offset-paper' : ''}`} style={{ height: `${d.h}%` }}>
                    <span className="block truncate">{d.t}</span>
                  </div>
                  <span className={`text-[11px] ${isToday ? 'font-bold' : 'text-ink-3'}`}>{WEEK[i]}</span>
                </div>
              );
            })}
          </div>
          {openMistakes.length > 0 && (
            <button onClick={() => go({ name: 'mistakes' })} className="mt-5 w-full flex items-center gap-3 rounded-2xl bg-rose-soft px-4 py-3 text-left">
              <span className="font-display font-extrabold text-rose text-xl tnum">{openMistakes.length}</span>
              <span className="text-[13px] text-ink-2 min-w-0 flex-1">давтах алдаа хүлээж байна · сүүлийнх: <b className="text-ink">{qById(openMistakes[0].qid).skill}</b></span>
              <LuArrowRight className="text-rose shrink-0" />
            </button>
          )}
        </section>
      </div>
    </div>
  );
}
