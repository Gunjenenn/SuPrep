import { useMemo, useState } from 'react';
import { LuArrowUp, LuCalendarCheck, LuCheck, LuChevronDown, LuMapPin, LuSparkles, LuTrophy } from 'react-icons/lu';
import { CatHead, CatPeek } from '../brand/Cat';
import { FAQ, FORMULAS_GIVEN, FORMULAS_MEMO, HELP_STEPS, LEAGUE_RIVALS, PHASES, SAT_DATES } from '../data/meta';
import { dayKey, mnDate, useStore } from '../lib/store';
import { Tex } from '../components/Math';
import { Button, PageHeader, Pill, SectionTitle } from '../components/ui';

/* ———— Томьёоны хуудас ———— */
export function Formulas() {
  const [quiz, setQuiz] = useState(false);
  const [shown, setShown] = useState<Record<string, boolean>>({});
  const [known, setKnown] = useState<Record<string, boolean>>({});
  const tile = (key: string, name: string, tex: string, sub?: string) => {
    const flipped = !quiz || shown[key];
    return (
      <button key={key} onClick={() => quiz && setShown((s) => ({ ...s, [key]: !s[key] }))} className={`flip text-left ${quiz ? '' : 'cursor-default'}`} aria-label={name}>
        <div className={`flip-inner h-[132px] ${flipped ? '' : 'is-flipped'}`}>
          <div className="flip-face card p-4 flex flex-col">
            <div className="text-[12px] font-semibold text-ink-3 flex items-center gap-1.5">{name}{known[key] && <LuCheck className="text-leaf" />}</div>
            <div className="flex-1 grid place-items-center math-lg overflow-x-auto no-scrollbar"><Tex tex={tex} /></div>
            {sub && <div className="text-[11.5px] text-ink-3 leading-tight">{sub}</div>}
          </div>
          <div className="flip-face flip-back rounded-[24px] p-4 grid place-items-center text-center" style={{ background: 'var(--c-forest-2)', color: 'var(--c-on-forest)', boxShadow: '0 3px 0 var(--c-edge)' }}>
            <div>
              <div className="font-display font-bold text-[15px]">{name}</div>
              <div className="text-[12px] opacity-70 mt-1">Санаж байна уу? Дарж шалга</div>
            </div>
          </div>
        </div>
      </button>
    );
  };
  return (
    <div className="gutter py-6 md:py-8 max-w-[1120px] mx-auto">
      <PageHeader eyebrow="Материал · Томьёоны хуудас" title="Томьёоны хуудас"
        sub="Шалгалтад өгөгддөг reference sheet, мөн өгөгддөггүй ч заавал мэдэх томьёонууд. Өөрийгөө шалгах горимд картууд эргэнэ."
        right={<Button variant={quiz ? 'dark' : 'secondary'} onClick={() => { setQuiz((q) => !q); setShown({}); }} icon={<LuSparkles />} id="formula-quiz">{quiz ? 'Бүгдийг харах' : 'Өөрийгөө шалгах'}</Button>} />
      <SectionTitle eyebrow="Bluebook-д өгөгдөнө" title="Reference sheet" />
      <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">{FORMULAS_GIVEN.map((f) => tile(f.n, f.n, f.tex))}</div>
      <SectionTitle className="mt-10" eyebrow="Өгөгддөггүй — цээжлэх" title="Заавал мэдэх 6 томьёо" />
      <div className="mt-4 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {FORMULAS_MEMO.map((f) => (
          <div key={f.n} className="grid gap-2">
            {tile('m-' + f.n, f.n, f.tex, f.why)}
            <button onClick={() => setKnown((k) => ({ ...k, ['m-' + f.n]: !k['m-' + f.n] }))} className={`self-start text-[12.5px] font-semibold px-3 h-8 rounded-full border ${known['m-' + f.n] ? 'bg-sage border-sage-2 text-leaf-2' : 'border-line text-ink-3 hover:text-ink'}`}>
              {known['m-' + f.n] ? '✓ Цээжилсэн' : 'Цээжилсэн гэж тэмдэглэх'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ———— Долоо хоногийн чансаа ———— */
export function League() {
  const { s, go } = useStore();
  const weekStart = useMemo(() => { const d = new Date(); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return dayKey(d); }, []);
  const mine = s.xpLog.filter((l) => l.day >= weekStart).reduce((a, b) => a + b.amount, 0) + 180;
  const rows = [...LEAGUE_RIVALS.map(([name, xp]) => ({ name, xp, me: false })), { name: `${s.profile.name} (та)`, xp: mine, me: true }].sort((a, b) => b.xp - a.xp);
  const myRank = rows.findIndex((r) => r.me) + 1;
  const toPromo = myRank > 3 ? rows[2].xp - mine + 1 : 0;
  const podium = rows.slice(0, 3);
  return (
    <div className="gutter py-6 md:py-8 max-w-[960px] mx-auto">
      <PageHeader eyebrow="Материал · Чансаа" title="Ногоон лиг"
        sub="Долоо хоногийн XP-ээр эрэмбэлнэ. Ням гарагийн 22:00-д шинэчлэгдэж, эхний 3 нь дараагийн лиг рүү дэвшинэ."
        right={<Pill tone={myRank <= 3 ? 'leaf' : 'neutral'}>{myRank <= 3 ? 'Дэвших бүсэд байна' : `Дэвшихэд ${toPromo} XP дутуу`}</Pill>} />
      {/* 3D podium */}
      <div className="grid grid-cols-3 gap-3 items-end max-w-[620px] mx-auto">
        {[podium[1], podium[0], podium[2]].map((r, i) => {
          const place = [2, 1, 3][i];
          const h = [118, 160, 92][i];
          return (
            <div key={r.name} className="flex flex-col items-center gap-2">
              {place === 1 ? <CatHead size={54} mood="happy" /> : <span className="h-12 w-12 rounded-full coin grid place-items-center font-display font-bold text-white" style={{ ['--face' as any]: place === 2 ? 'var(--c-teal)' : 'var(--c-rose)', ['--edge' as any]: 'var(--c-edge)' }}>{r.name[0]}</span>}
              <div className="text-[13px] font-bold text-center leading-tight">{r.name}</div>
              <div className="w-full rounded-t-3xl grid place-items-start justify-center pt-3" style={{ height: h, background: place === 1 ? 'var(--c-leaf)' : 'var(--c-paper)', border: '1.5px solid var(--c-line)', boxShadow: '0 6px 0 var(--c-edge)', color: place === 1 ? '#fff' : 'var(--c-ink)' }}>
                <span className="font-display font-extrabold text-[34px] leading-none">{place}</span>
              </div>
            </div>
          );
        })}
      </div>
      <div className="card mt-8 overflow-hidden">
        {rows.map((r, i) => (
          <div key={r.name}>
            <div className={`flex items-center gap-4 px-5 py-3.5 ${r.me ? 'bg-sage' : ''}`}>
              <span className={`w-7 text-center font-display font-bold tnum ${i < 3 ? 'text-leaf-2' : 'text-ink-3'}`}>{i + 1}</span>
              <span className="h-9 w-9 rounded-full grid place-items-center font-bold text-[13px] bg-paper-2 border border-line">{r.name[0]}</span>
              <span className={`flex-1 min-w-0 truncate text-[14.5px] ${r.me ? 'font-bold' : 'font-semibold'}`}>{r.name}</span>
              <span className="font-mono text-[13px] font-bold tnum">{r.xp.toLocaleString('en-US')} XP</span>
            </div>
            {i === 2 && <div className="flex items-center gap-2 px-5 py-1.5 bg-paper-2 text-[11px] font-bold text-leaf-2 uppercase tracking-wider border-y border-line"><LuArrowUp size={12} /> Дэвших бүс</div>}
          </div>
        ))}
      </div>
      <div className="mt-6 flex flex-wrap gap-3 items-center">
        <Button onClick={() => go({ name: 'desmos' })} icon={<LuTrophy />}>XP цуглуулах</Button>
        <span className="text-[13px] text-ink-3">Desmos хичээл +40 XP, шалгалт +60 XP. Бусад сурагч демо өгөгдөл.</span>
      </div>
    </div>
  );
}

/* ———— Тусламж ———— */
export function Help() {
  const [faq, setFaq] = useState(-1);
  return (
    <div className="gutter py-6 md:py-8 max-w-[1000px] mx-auto">
      <PageHeader eyebrow="Материал · Тусламж" title="Монголоос SAT өгөх нь"
        sub="Бүртгүүлэхээс шалгалтын өдөр хүртэл алхам алхмаар. Огноо, төлбөрийг College Board-ийн албан ёсны сайтаас заавал шалгаарай." />
      <ol className="grid md:grid-cols-2 gap-4">
        {HELP_STEPS.map((st, i) => (
          <li key={st.t} className="card p-5 flex gap-4">
            <span className="coin h-11 w-11 shrink-0 rounded-2xl grid place-items-center font-display font-bold text-white" style={{ ['--face' as any]: 'var(--c-leaf)', ['--edge' as any]: 'var(--c-leaf-2)' }}>{i + 1}</span>
            <div><div className="font-display font-bold text-[15px]">{st.t}</div><p className="text-[14px] text-ink-2 mt-1">{st.d}</p></div>
          </li>
        ))}
      </ol>
      <div className="mt-6 rounded-[24px] p-6 flex gap-4 items-start" style={{ background: 'var(--c-forest-2)', color: 'var(--c-on-forest)', boxShadow: '0 4px 0 var(--c-edge)' }}>
        <LuMapPin size={22} className="shrink-0 mt-1" style={{ color: 'var(--c-lime)' }} />
        <div>
          <div className="font-display font-bold">Улаанбаатар дахь шалгалтын төвүүд</div>
          <p className="text-[14px] opacity-80 mt-1.5 max-w-[62ch]">International School of Ulaanbaatar, British School of Ulaanbaatar зэрэг. Төв бүр бүх өдөр шалгалт авдаггүй тул College Board-ийн test center хайлтаар шалгана. 07:45 гэхэд очно.</p>
        </div>
      </div>
      <SectionTitle className="mt-10" eyebrow="FAQ" title="Түгээмэл асуулт" />
      <div className="mt-4 grid gap-3">
        {FAQ.map((f, i) => (
          <div key={f.q} className="card overflow-hidden">
            <button onClick={() => setFaq(faq === i ? -1 : i)} className="w-full flex items-center gap-3 px-5 py-4 text-left font-semibold text-[15px]" aria-expanded={faq === i}>
              <span className="flex-1">{f.q}</span>
              <LuChevronDown className={`transition-transform ${faq === i ? 'rotate-180' : ''}`} />
            </button>
            {faq === i && <p className="px-5 pb-5 -mt-1 text-[14px] text-ink-2 anim-rise">{f.a}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ———— AI төлөвлөгөө ———— */
const WEEK1 = [
  ['Даваа', 'Оношлогооны мини тест: Алгебр (10 асуулт)', 30], ['Мягмар', 'Оношлогоо: Ахисан математик', 30], ['Лхагва', 'Оношлогоо: Өгөгдөл, магадлал', 30],
  ['Пүрэв', 'Оношлогоо: Геометр, тригонометр', 30], ['Баасан', 'Замнал: Математикийн хэл', 25], ['Бямба', 'Desmos hack 1–3 + хүнд асуулт 5', 40], ['Ням', 'Амралт · алдааны дэвтэр', 10],
] as const;
const fmt = (d: Date) => `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;

export function Planner() {
  const { s, setProfile, go } = useStore();
  const idx = Math.max(0, SAT_DATES.findIndex((x) => x.d === s.profile.examDate));
  const sd = SAT_DATES[idx] || SAT_DATES[1];
  const [made, setMade] = useState(false);
  const target = Date.parse(sd.d + 'T08:00:00+08:00');
  const days = Math.max(0, Math.ceil((target - Date.now()) / 864e5));
  let cursor = Date.now();
  const phases = PHASES.map((p, i) => {
    const len = Math.max(1, Math.round(days * p.f));
    const a = new Date(cursor), b = new Date(cursor + (len - 1) * 864e5);
    cursor += len * 864e5;
    return { ...p, len, range: `${fmt(a)} – ${fmt(b)}`, shade: 88 - i * 17 };
  });
  return (
    <div className="gutter py-6 md:py-8 max-w-[1120px] mx-auto">
      <PageHeader eyebrow="AI төлөвлөгөө" title="Шалгалт хүртэлх төлөвлөгөө" sub="Монголд өгөх SAT-ийн өдрөө сонго. Үлдсэн хугацаанд юу хийхийг Суу таван үе шатад хувааж гаргана." />
      <div className="grid lg:grid-cols-[minmax(0,1fr)_360px] gap-5">
        <section className="card p-5 md:p-6 min-w-0">
          <div className="eyebrow">1 · SAT-ийн өдөр</div>
          <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
            {SAT_DATES.map((x, i) => (
              <button key={x.d} onClick={() => { setProfile({ examDate: x.d }); setMade(false); }} id={`sat-${i}`}
                className={`rounded-2xl p-3 text-left border-[1.5px] transition-transform active:translate-y-0.5 ${i === idx ? 'border-forest-2' : 'border-line bg-paper hover:border-line-2'}`}
                style={i === idx ? { background: 'var(--c-forest-2)', color: 'var(--c-on-forest)', boxShadow: '0 4px 0 var(--c-edge)' } : { boxShadow: '0 3px 0 var(--c-edge)' }}>
                <div className="font-display font-bold text-[14px] tnum">{x.d.replaceAll('-', '.')}</div>
                <div className="text-[11px] opacity-75 mt-1">Бүртгэл {x.reg} хүртэл</div>
                <div className="text-[11px] opacity-60">Хоцорсон {x.late}</div>
              </button>
            ))}
          </div>
          <div className="eyebrow mt-6">2 · Зорилтот математикийн оноо</div>
          <div className="mt-3 flex flex-wrap gap-2">
            {[600, 650, 700, 750, 800].map((v) => (
              <button key={v} onClick={() => setProfile({ target: v })} className={`h-11 px-5 rounded-2xl font-display font-bold tnum border-[1.5px] ${s.profile.target === v ? 'bg-leaf text-white border-leaf' : 'bg-paper border-line'}`} style={{ boxShadow: `0 4px 0 ${s.profile.target === v ? 'var(--c-leaf-2)' : 'var(--c-edge)'}` }}>{v}</button>
            ))}
          </div>
          <div className="eyebrow mt-7">Үе шатууд</div>
          <div className="mt-3 flex h-14 rounded-2xl overflow-hidden" style={{ boxShadow: '0 4px 0 var(--c-edge)' }}>
            {phases.map((p) => (
              <div key={p.n} className="grid place-items-center text-[11px] font-bold px-1 text-center leading-tight min-w-0" style={{ width: `${p.f * 100}%`, background: `color-mix(in srgb, var(--c-leaf) ${p.shade}%, var(--c-forest-2))`, color: '#fff' }}>
                <span className="truncate w-full">{p.n}</span>
              </div>
            ))}
          </div>
          <ul className="mt-4 grid gap-2">
            {phases.map((p, i) => (
              <li key={p.n} className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[13.5px]">
                <span className="h-6 w-6 rounded-lg grid place-items-center text-[11px] font-bold text-white" style={{ background: `color-mix(in srgb, var(--c-leaf) ${p.shade}%, var(--c-forest-2))` }}>{i + 1}</span>
                <span className="font-semibold">{p.n}</span><span className="text-ink-3 flex-1 min-w-[140px]">— {p.what}</span>
                <span className="font-mono text-[12px] text-ink-2 tnum shrink-0">{p.range} · {p.len}ө</span>
              </li>
            ))}
          </ul>
        </section>
        <aside className="grid gap-5 content-start">
          <div className="rounded-[24px] p-6 relative overflow-hidden" style={{ background: 'var(--c-forest-2)', color: 'var(--c-on-forest)', boxShadow: '0 5px 0 var(--c-edge)' }}>
            <div className="eyebrow" style={{ color: 'var(--c-lime)' }}>Шалгалт хүртэл</div>
            <div className="mt-2 font-display font-extrabold text-[64px] leading-none tnum">{days}</div>
            <div className="text-[13px] opacity-80 mt-1">өдөр · {Math.floor(days / 7)} долоо хоног</div>
            <div className="mt-4 text-[12.5px] opacity-75">{mnDate(sd.d)}, 08:00 · бүртгэл {sd.reg}-нд хаагдана (УБ-ын цагаар маргааш нь ~12:00)</div>
            <div className="absolute -right-3 -bottom-2"><CatPeek size={110} /></div>
          </div>
          <Button size="lg" onClick={() => setMade(true)} icon={<LuCalendarCheck />} id="make-plan">AI-аар 7 хоногийн төлөвлөгөө</Button>
        </aside>
      </div>
      {made && (
        <section className="card mt-5 p-6 anim-rise">
          <SectionTitle eyebrow="1-р долоо хоног · Оношлогоо" title={`Зорилт ${s.profile.target} · ${days} өдөр`} right={<Pill tone="amber">Демо: урьдчилан бэлдсэн төлөвлөгөө</Pill>} />
          <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-7 gap-2.5">
            {WEEK1.map(([d, t, m], i) => (
              <div key={d} className={`rounded-2xl p-3 border-[1.5px] ${i === (new Date().getDay() + 6) % 7 ? 'border-leaf bg-sage' : 'border-line bg-paper-2'}`}>
                <div className="font-display font-bold text-[13px]">{d}</div>
                <div className="text-[12.5px] text-ink-2 mt-1 leading-snug">{t}</div>
                <div className="mt-2 font-mono text-[11px] text-ink-3">{m} мин</div>
              </div>
            ))}
          </div>
          <div className="mt-5 flex gap-2"><Button onClick={() => go({ name: 'journey' })}>Өнөөдрийнхийг эхлэх</Button></div>
        </section>
      )}
    </div>
  );
}
