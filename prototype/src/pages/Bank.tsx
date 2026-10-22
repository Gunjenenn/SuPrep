import { useMemo, useState } from 'react';
import { LuBookmark, LuBookmarkCheck, LuCheck, LuClock, LuPlay, LuSearch, LuSpline, LuX } from 'react-icons/lu';
import { DOMAINS, Domain, QUESTIONS } from '../data/questions';
import { useStore } from '../lib/store';
import { Rich } from '../components/Math';
import { Button, PageHeader, Pill } from '../components/ui';

const DIFF = ['', 'Хялбар', 'Дунд', 'Хүнд'];

export default function Bank({ hard = false }: { hard?: boolean }) {
  const { s, go, toggleSave } = useStore();
  const [domain, setDomain] = useState<Domain | 'all'>('all');
  const [diff, setDiff] = useState<number[]>(hard ? [3] : []);
  const [desmosOnly, setDesmosOnly] = useState(false);
  const [savedOnly, setSavedOnly] = useState(false);
  const [q, setQ] = useState('');
  const list = useMemo(
    () => QUESTIONS.filter((x) =>
      (domain === 'all' || x.domain === domain) &&
      (!diff.length || diff.includes(x.difficulty)) &&
      (!desmosOnly || !!x.desmos) &&
      (!savedOnly || s.saved.includes(x.id)) &&
      (!q || (x.prompt + x.skill).toLowerCase().includes(q.toLowerCase()))),
    [domain, diff, desmosOnly, savedOnly, q, s.saved]
  );
  const ids = list.map((x) => x.id);
  const counts = (d: Domain) => QUESTIONS.filter((x) => x.domain === d).length;

  return (
    <div className="gutter py-6 md:py-8 max-w-[1240px] mx-auto">
      <PageHeader eyebrow={hard ? 'Дасгал · Хүнд асуулт' : 'Дасгал · Асуултын сан'} title={hard ? 'Хүнд асуултын бүс' : 'Асуултын сан'}
        sub={hard ? 'Зөвхөн хүнд асуултууд. 700+ оноо авахын тулд эдгээрийг эзэмш — ихэнх нь Desmos-оор хурдан бодогдоно.' : 'SAT-ын дөрвөн агуулгын хүрээ, гурван түвшин. Асуулт бүр дээр AI багш, Desmos стратеги.'}
        right={
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => ids.length && go({ name: 'practice', ids, title: 'Сонгосон дасгал' })} icon={<LuPlay />} disabled={!ids.length} id="practice-selected">Дасгал ({ids.length})</Button>
            <Button onClick={() => ids.length && go({ name: 'practice', ids: ids.slice(0, 5), timed: 6 * 60, title: 'Цагтай дасгал' })} icon={<LuClock />} disabled={!ids.length} id="practice-timed">Цагтай · 6 мин</Button>
          </div>
        } />

      {/* domain tabs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
        <button onClick={() => setDomain('all')} className={`rounded-2xl border-[1.5px] px-4 py-3 text-left shadow-[0_3px_0_var(--c-edge)] ${domain === 'all' ? 'border-forest-2 bg-forest-2 text-cream' : 'border-line bg-paper hover:border-line-2'}`}>
          <div className="text-[11px] uppercase tracking-wider opacity-70 font-semibold">Бүгд</div>
          <div className="font-display font-extrabold text-[15px]">{QUESTIONS.length} бодлого</div>
        </button>
        {(Object.keys(DOMAINS) as Domain[]).map((d) => (
          <button key={d} onClick={() => setDomain(d)} className={`rounded-2xl border-[1.5px] px-4 py-3 text-left shadow-[0_3px_0_var(--c-edge)] min-w-0 ${domain === d ? 'border-forest-2 bg-forest-2 text-cream' : 'border-line bg-paper hover:border-line-2'}`}>
            <div className="text-[11px] uppercase tracking-wider opacity-70 font-semibold truncate">{DOMAINS[d].mn} · {DOMAINS[d].share}</div>
            <div className="font-display font-extrabold text-[15px] truncate">{DOMAINS[d].en}</div>
            <div className="text-[11.5px] opacity-70">{counts(d)} бодлого</div>
          </button>
        ))}
      </div>

      {/* filters */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <div className="relative">
          <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-3" size={15} />
          <input id="bank-search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Хайх (slope, circle…)" className="h-10 w-56 rounded-xl border border-line bg-paper pl-9 pr-3 text-[13.5px] outline-none focus:border-leaf" />
        </div>
        {[1, 2, 3].map((d) => (
          <button key={d} onClick={() => setDiff((x) => (x.includes(d) ? x.filter((y) => y !== d) : [...x, d]))}
            className={`h-10 px-3.5 rounded-xl border text-[13px] font-semibold inline-flex items-center gap-2 ${diff.includes(d) ? 'border-leaf bg-sage text-leaf-2' : 'border-line bg-paper'}`}>
            <Dots n={d} /> {DIFF[d]}
          </button>
        ))}
        <button onClick={() => setDesmosOnly((v) => !v)} className={`h-10 px-3.5 rounded-xl border text-[13px] font-semibold inline-flex items-center gap-1.5 ${desmosOnly ? 'border-teal bg-teal-soft text-teal' : 'border-line bg-paper'}`}><LuSpline size={15} /> Desmos-оор</button>
        <button onClick={() => setSavedOnly((v) => !v)} className={`h-10 px-3.5 rounded-xl border text-[13px] font-semibold inline-flex items-center gap-1.5 ${savedOnly ? 'border-rose bg-rose-soft text-rose' : 'border-line bg-paper'}`}><LuBookmark size={15} /> Хадгалсан ({s.saved.length})</button>
        {(diff.length || desmosOnly || savedOnly || q || domain !== 'all') ? (
          <button onClick={() => { setDiff([]); setDesmosOnly(false); setSavedOnly(false); setQ(''); setDomain('all'); }} className="h-10 px-3 text-[13px] text-ink-3 hover:text-ink inline-flex items-center gap-1"><LuX size={14} /> Цэвэрлэх</button>
        ) : null}
      </div>

      <div className="mt-5 grid md:grid-cols-2 gap-3">
        {list.map((x) => {
          const a = s.answered[x.id];
          const saved = s.saved.includes(x.id);
          return (
            <article key={x.id} className="card p-5 flex flex-col gap-3 lift">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-bold text-ink-3 tnum">#{x.id.toUpperCase()}</span>
                <Pill>{DOMAINS[x.domain].en}</Pill>
                <span className="inline-flex items-center gap-1 text-[11.5px] text-ink-3"><Dots n={x.difficulty} /> {DIFF[x.difficulty]}</span>
                {x.desmos && <Pill tone="teal"><LuSpline size={11} /> Desmos</Pill>}
                {a && <Pill tone={a.ok ? 'leaf' : 'rose'}>{a.ok ? <><LuCheck size={11} /> Зөв</> : 'Алдсан'}</Pill>}
                <button onClick={() => toggleSave(x.id)} className={`ml-auto h-8 w-8 grid place-items-center rounded-lg ${saved ? 'text-rose' : 'text-ink-3 hover:text-ink'}`} aria-label={saved ? 'Хадгалснаас хасах' : 'Хадгалах'}>
                  {saved ? <LuBookmarkCheck size={18} /> : <LuBookmark size={18} />}
                </button>
              </div>
              <div className="text-[14.5px] leading-relaxed line-clamp-3"><Rich text={x.prompt} /></div>
              <div className="mt-auto flex items-center justify-between pt-1">
                <span className="text-[12px] text-ink-3">{x.skill} · {x.choices ? 'Сонголттой' : 'Бичих хариулт'}</span>
                <Button size="sm" variant="soft" onClick={() => go({ name: 'practice', ids: [x.id, ...ids.filter((i) => i !== x.id)].slice(0, 5), title: x.skill })} id={`solve-${x.id}`}>Бодох</Button>
              </div>
            </article>
          );
        })}
      </div>
      {!list.length && <div className="mt-10 text-center text-ink-3">Шүүлтүүрт тохирох бодлого алга.</div>}
    </div>
  );
}

export function Dots({ n }: { n: number }) {
  return (
    <span className="inline-flex gap-0.5" aria-label={`${n}/3`}>
      {[1, 2, 3].map((k) => <span key={k} className={`h-1.5 w-3 rounded-full ${k <= n ? (n === 3 ? 'bg-rose' : n === 2 ? 'bg-amber' : 'bg-leaf') : 'bg-line-2'}`} />)}
    </span>
  );
}
