import { useMemo, useState } from 'react';
import { LuCheck, LuSearch } from 'react-icons/lu';
import { BADGES, VOCAB } from '../data/meta';
import { mnDate, useStore } from '../lib/store';
import BadgeEmblem from '../components/Badge';
import { Rich } from '../components/Math';
import { Button, PageHeader, Pill } from '../components/ui';

export function Achievements() {
  const { s } = useStore();
  const earned = BADGES.filter((b) => s.badges[b.id]).length;
  return (
    <div className="gutter py-6 md:py-8 max-w-[1100px] mx-auto">
      <PageHeader eyebrow="Амжилтууд" title="Тэмдгийн цуглуулга" sub="Тэмдэг бүр бодит суралцах үйлдлээр олгогдоно. Цуглуулгаа гүйцээгээрэй."
        right={<div className="text-right"><div className="font-thin text-[44px] leading-none text-rose tnum">{earned}<span className="text-ink-3 text-[24px]">/{BADGES.length}</span></div><div className="text-[12px] text-ink-3">цуглуулсан</div></div>} />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 stagger">
        {BADGES.map((b) => {
          const at = s.badges[b.id];
          return (
            <div key={b.id} className={`card p-5 text-center flex flex-col items-center gap-2 ${at ? '' : 'bg-paper-2/40'}`}>
              <BadgeEmblem badge={b} earned={!!at} size={96} />
              <div className={`font-display font-extrabold text-[14px] leading-tight mt-1 ${at ? '' : 'text-ink-3'}`}>{b.mn}</div>
              <div className="text-[11.5px] text-ink-3">{b.en}</div>
              <p className="text-[12px] text-ink-2 leading-snug">{b.how}</p>
              {at ? <Pill tone="rose"><LuCheck size={11} /> {mnDate(at)}</Pill> : <Pill>Түгжээтэй</Pill>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const LVL = ['', 'Амархан', 'Дунд', 'Хэцүү'];
export function Vocab() {
  const { s, learnWords, go } = useStore();
  const [q, setQ] = useState('');
  const [lvl, setLvl] = useState(0);
  const [mode, setMode] = useState<'list' | 'cards'>('list');
  const [ci, setCi] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const list = useMemo(() => VOCAB.filter((w) => (!lvl || w.level === lvl) && (!q || (w.en + w.mn).toLowerCase().includes(q.toLowerCase()))), [q, lvl]);
  const deck = list.length ? list : VOCAB;
  const w = deck[ci % deck.length];
  const next = (knew: boolean) => { if (knew) learnWords([w.en]); setFlipped(false); setTimeout(() => setCi((c) => c + 1), 160); };
  const dot = (l: number) => (l === 1 ? 'bg-leaf' : l === 2 ? 'bg-amber' : 'bg-rose');
  return (
    <div className="gutter py-6 md:py-8 max-w-[1100px] mx-auto">
      <PageHeader eyebrow="Материал · Үгсийн сан" title="SAT математикийн толь" sub="Англи нэр томъёо — монгол утга, тайлбар, жишээ. Ногоон = амархан, шар = дунд, улаан = хэцүү."
        right={<div className="text-right"><div className="font-display font-extrabold text-[40px] leading-none text-leaf-2 tnum">{s.words.length}</div><div className="text-[12px] text-ink-3 mt-1">сурсан үг · зорилт 300–400</div></div>} />
      <div className="flex flex-wrap gap-2 mb-6 items-center">
        <div className="inline-flex rounded-2xl bg-paper-2 p-1 border border-line">
          {([['list', 'Жагсаалт'], ['cards', 'Flashcard']] as const).map(([m, l]) => (
            <button key={m} onClick={() => { setMode(m); setFlipped(false); }} id={`vocab-${m}`} className={`h-9 px-4 rounded-xl text-[13px] font-bold ${mode === m ? 'bg-paper shadow-card text-ink' : 'text-ink-3'}`}>{l}</button>
          ))}
        </div>
        <div className="relative">
          <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-3" size={15} />
          <input id="vocab-search" value={q} onChange={(e) => { setQ(e.target.value); setCi(0); }} placeholder="Үг хайх…" className="h-11 w-52 rounded-2xl border-[1.5px] border-line bg-paper pl-9 pr-3 text-[13.5px] outline-none focus:border-leaf" />
        </div>
        {[0, 1, 2, 3].map((l) => (
          <button key={l} onClick={() => { setLvl(l); setCi(0); }} className={`h-11 px-4 rounded-2xl border-[1.5px] text-[13px] font-bold inline-flex items-center gap-2 ${lvl === l ? 'border-forest-2 text-cream' : 'border-line bg-paper'}`} style={lvl === l ? { background: 'var(--c-forest-2)' } : undefined}>
            {l > 0 && <span className={`h-2 w-2 rounded-full ${dot(l)}`} />}{l ? LVL[l] : 'Бүгд'}
          </button>
        ))}
        <Button className="ml-auto" variant="secondary" onClick={() => go({ name: 'lesson', id: 's1-l3' })}>Дасгал</Button>
      </div>
      {mode === 'list' ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {list.map((x) => {
            const known = s.words.includes(x.en);
            return (
              <div key={x.en} className="card p-4 flex gap-3 items-start">
                <span className={`mt-2 h-2.5 w-2.5 rounded-full shrink-0 ${dot(x.level)}`} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2 flex-wrap"><span className="font-display font-bold text-[15px]">{x.en}</span><span className="text-[13px] text-leaf-2 font-semibold">{x.mn}</span></div>
                  {x.def && <p className="text-[13px] text-ink-2 mt-1"><Rich text={x.def} /></p>}
                  {x.ex && <p className="text-[12.5px] text-ink-3 mt-1"><Rich text={x.ex} /></p>}
                </div>
                <button onClick={() => learnWords([x.en])} className={`h-8 w-8 rounded-xl grid place-items-center shrink-0 border ${known ? 'bg-leaf text-white border-leaf' : 'border-line text-ink-3 hover:text-ink'}`} aria-label={known ? 'Сурсан' : 'Сурсан гэж тэмдэглэх'}><LuCheck size={15} /></button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="grid place-items-center">
          <div className="text-[12px] font-mono text-ink-3 mb-3 tnum">{(ci % deck.length) + 1} / {deck.length}</div>
          <button onClick={() => setFlipped((f) => !f)} className="flip w-full max-w-[520px]" aria-label="Картыг эргүүлэх" id="flashcard">
            <div className={`flip-inner h-[300px] ${flipped ? 'is-flipped' : ''}`}>
              <div className="flip-face rounded-[32px] grid place-items-center p-8 text-center" style={{ background: 'var(--c-forest-2)', color: 'var(--c-on-forest)', boxShadow: '0 10px 0 var(--c-edge), 0 40px 60px -30px rgba(0,0,0,.6)' }}>
                <div>
                  <div className="eyebrow" style={{ color: 'var(--c-lime)' }}>English</div>
                  <div className="font-display font-extrabold text-[40px] mt-3 leading-tight">{w.en}</div>
                  <div className="mt-6 text-[12.5px] opacity-60">Дарж эргүүлэх</div>
                </div>
              </div>
              <div className="flip-face flip-back rounded-[32px] grid place-items-center p-8 text-center" style={{ background: 'var(--c-leaf)', color: '#fff', boxShadow: '0 10px 0 var(--c-leaf-2), 0 40px 60px -30px rgba(0,0,0,.6)' }}>
                <div>
                  <div className="font-display font-extrabold text-[30px] leading-tight">{w.mn}</div>
                  {w.def && <p className="mt-3 text-[15px] opacity-95 max-w-[40ch]"><Rich text={w.def} /></p>}
                  {w.ex && <p className="mt-2 text-[13.5px] opacity-85"><Rich text={w.ex} /></p>}
                </div>
              </div>
            </div>
          </button>
          <div className="mt-8 flex gap-3">
            <Button variant="secondary" size="lg" onClick={() => next(false)} id="card-again">Дахин үзэх</Button>
            <Button size="lg" onClick={() => next(true)} id="card-know">Мэднэ</Button>
          </div>
        </div>
      )}
    </div>
  );
}
