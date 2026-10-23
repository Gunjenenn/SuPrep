import { useEffect, useState } from 'react';
import { LuBookmark, LuCalculator, LuChevronLeft, LuChevronRight, LuEye, LuEyeOff, LuFileText, LuX } from 'react-icons/lu';
import { Logo } from '../brand/Decor';
import { CatHead } from '../brand/Cat';
import { DOMAINS, Domain, checkAnswer, qById } from '../data/questions';
import { useStore } from '../lib/store';
import GraphCalc from '../components/GraphCalc';
import { Rich } from '../components/Math';
import { Button, Modal } from '../components/ui';
import { mmss } from './Practice';

const IDS = ['a2', 'a4', 'a6', 'v1', 'v2', 'v6', 'p2', 'p5', 'g2', 'g4'];
const LIMIT = 15 * 60;

export default function Mock() {
  const { s, go, award, recordAnswer, giveBadge, completeNode } = useStore();
  const qs = IDS.map(qById);
  const [phase, setPhase] = useState<'intro' | 'test' | 'review' | 'result'>('intro');
  const [i, setI] = useState(0);
  const [ans, setAns] = useState<Record<string, string>>({});
  const [mark, setMark] = useState<string[]>([]);
  const [left, setLeft] = useState(LIMIT);
  const [hideTimer, setHideTimer] = useState(false);
  const [calc, setCalc] = useState(false);
  const [ref, setRef] = useState(false);
  const [score, setScore] = useState<{ raw: number; byDomain: Record<string, [number, number]> } | null>(null);

  useEffect(() => {
    if (phase !== 'test' && phase !== 'review') return;
    const t = setInterval(() => setLeft((l) => l - 1), 1000);
    return () => clearInterval(t);
  }, [phase]);
  useEffect(() => { if (left <= 0 && (phase === 'test' || phase === 'review')) submit(); }, [left]); // eslint-disable-line

  const submit = () => {
    let raw = 0;
    const byDomain: Record<string, [number, number]> = {};
    qs.forEach((q) => {
      const a = ans[q.id];
      const ok = a !== undefined && a !== '' && checkAnswer(q, q.choices ? Number(a) : a);
      if (ok) raw++;
      byDomain[q.domain] = [(byDomain[q.domain]?.[0] || 0) + (ok ? 1 : 0), (byDomain[q.domain]?.[1] || 0) + 1];
      if (a !== undefined && a !== '') recordAnswer(q.id, ok, a, 'Mock шалгалт');
    });
    setScore({ raw, byDomain });
    setPhase('result');
    award(80, 'Mock шалгалт дуусгалаа');
    completeNode('s5-mock', raw);
    setTimeout(() => giveBadge('sat-strategist'), 600);
  };

  const q = qs[i];
  const scaled = score ? Math.round((200 + (600 * score.raw) / qs.length) / 10) * 10 : 0;

  return (
    <div className="calm min-h-full bg-paper text-ink flex flex-col">
      <header className="border-b border-line bg-paper sticky top-0 z-30">
        <div className="gutter h-14 flex items-center gap-4">
          <Logo compact />
          <div className="min-w-0">
            <div className="text-[13px] font-bold">Section 2 · Math</div>
            <div className="text-[11px] text-ink-3">Suprep mock · 10 асуулт · 15 мин</div>
          </div>
          {(phase === 'test' || phase === 'review') && (
            <div className="mx-auto flex flex-col items-center">
              <div className={`font-bold tnum text-[17px] ${left < 120 ? 'text-danger' : ''}`}>{hideTimer ? '—:—' : mmss(left)}</div>
              <button onClick={() => setHideTimer((h) => !h)} className="text-[10.5px] text-ink-3 inline-flex items-center gap-1">{hideTimer ? <LuEye size={11} /> : <LuEyeOff size={11} />} {hideTimer ? 'Харуулах' : 'Нуух'}</button>
            </div>
          )}
          <div className="ml-auto flex items-center gap-1">
            {(phase === 'test' || phase === 'review') && (
              <>
                <button onClick={() => setCalc((c) => !c)} className={`h-10 px-3 rounded-lg text-[12.5px] font-semibold inline-flex items-center gap-1.5 ${calc ? 'bg-ink text-paper' : 'hover:bg-paper-2'}`}><LuCalculator size={16} /> Calculator</button>
                <button onClick={() => setRef(true)} className="h-10 px-3 rounded-lg text-[12.5px] font-semibold inline-flex items-center gap-1.5 hover:bg-paper-2"><LuFileText size={16} /> Reference</button>
              </>
            )}
            <button onClick={() => go({ name: 'journey' })} className="h-10 w-10 grid place-items-center rounded-lg hover:bg-paper-2" aria-label="Гарах"><LuX /></button>
          </div>
        </div>
        <div className="h-1 bg-[repeating-linear-gradient(90deg,var(--c-ink)_0_12px,transparent_12px_18px)] opacity-20" />
      </header>

      {phase === 'intro' && (
        <div className="gutter flex-1 grid place-items-center py-10">
          <div className="max-w-xl w-full card p-8">
            <div className="flex items-center gap-3"><CatHead size={50} mood="focus" /><div className="eyebrow">Mock шалгалт</div></div>
            <h1 className="font-display font-extrabold text-[26px] mt-3 tracking-[-0.02em]">Бүтэн тест</h1>
            <p className="text-ink-2 text-[14.5px] mt-1">Digital SAT-ийн математик хэсэгтэй ижил бүтэц. Тест явагдах үед XP, хөдөлгөөн, сэжүүр унтарна.</p>
            <div className="mt-5 grid gap-2.5">
              {[
                ['1-р модуль', '22 асуулт', '35 минут · дунд түвшин'],
                ['Завсарлага', '10 минут', 'Бодит шалгалт шиг'],
                ['2-р модуль', '22 асуулт', '35 минут · 1-р модулийн дүнгээс хамаарч хүнд/хялбар'],
              ].map(([a, b, c], k) => (
                <div key={a} className={`rounded-2xl px-4 py-3 flex items-center gap-4 border-[1.5px] ${k === 1 ? 'border-dashed border-line-2' : 'border-line bg-paper-2'}`}>
                  <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-ink-3 w-24 shrink-0">{a}</span>
                  <span className="font-display font-bold">{b}</span>
                  <span className="text-[12.5px] text-ink-3 ml-auto text-right">{c}</span>
                </div>
              ))}
            </div>
            <p className="mt-4 text-[13px] text-ink-2"><b>Дууссаны дараа:</b> 200–800 оноо, сэдвээр задаргаа, асуулт бүрийн тайлбар.</p>
            <p className="mt-1 text-[12px] text-ink-3">Энэ прототипт 1-р модулийн 10 асуулттай, 15 минутын хувилбар ажиллана.</p>
            <Button size="lg" className="mt-6 w-full" onClick={() => setPhase('test')} id="start-mock">Тест эхлэх</Button>
          </div>
        </div>
      )}

      {phase === 'test' && (
        <div className={`flex-1 grid ${calc ? 'lg:grid-cols-[minmax(380px,1fr)_1.1fr]' : ''}`}>
          {calc && <div className="border-r border-line h-[440px] lg:h-auto lg:min-h-[calc(100vh-120px)] p-2"><GraphCalc height="100%" label="Calculator" /></div>}
          <div className="gutter py-8 max-w-[760px] w-full mx-auto">
            <div className="flex items-center gap-3 bg-paper-2 rounded-lg px-3 py-2">
              <span className="h-7 w-7 rounded bg-ink text-paper grid place-items-center text-[13px] font-bold">{i + 1}</span>
              <button onClick={() => setMark((m) => (m.includes(q.id) ? m.filter((x) => x !== q.id) : [...m, q.id]))} className={`text-[13px] inline-flex items-center gap-1.5 ${mark.includes(q.id) ? 'text-danger font-semibold' : 'text-ink-2'}`} id="mark-review">
                <LuBookmark size={15} fill={mark.includes(q.id) ? 'currentColor' : 'none'} /> Mark for Review
              </button>
            </div>
            <div className="mt-6 text-[17px] leading-relaxed"><Rich text={q.prompt} /></div>
            {q.choices ? (
              <div className="mt-6 grid gap-2.5">
                {q.choices.map((c, k) => (
                  <button key={k} onClick={() => setAns((a) => ({ ...a, [q.id]: String(k) }))} className={`flex items-center gap-4 rounded-xl border-2 px-4 py-3 text-left text-[16px] ${ans[q.id] === String(k) ? 'border-teal bg-teal-soft' : 'border-line hover:border-line-2'}`}>
                    <span className={`h-8 w-8 rounded-full grid place-items-center text-[13px] font-bold border-2 ${ans[q.id] === String(k) ? 'bg-teal text-white border-teal' : 'border-ink-3'}`}>{'ABCD'[k]}</span><Rich text={c} />
                  </button>
                ))}
              </div>
            ) : (
              <input id="mock-in" value={ans[q.id] || ''} onChange={(e) => setAns((a) => ({ ...a, [q.id]: e.target.value }))} placeholder="Answer" className="mt-6 h-14 w-48 rounded-xl border-2 border-line-2 bg-paper px-4 text-[20px] font-[KaTeX_Main,serif] outline-none focus:border-teal" />
            )}
          </div>
        </div>
      )}

      {phase === 'review' && (
        <div className="gutter flex-1 py-10 max-w-[760px] w-full mx-auto">
          <h2 className="font-display font-extrabold text-[24px]">Шалгах хуудас</h2>
          <p className="text-ink-2 text-[14px] mt-1">Асуулт дээр дарж буцна. Хариулаагүй: {qs.filter((x) => !ans[x.id]).length}, тэмдэглэсэн: {mark.length}.</p>
          <div className="mt-6 grid grid-cols-5 sm:grid-cols-10 gap-2">
            {qs.map((x, k) => (
              <button key={x.id} onClick={() => { setI(k); setPhase('test'); }} className={`h-12 rounded-lg border-2 font-bold tnum relative ${ans[x.id] ? 'bg-ink text-paper border-ink' : 'border-dashed border-ink-3'}`}>
                {k + 1}{mark.includes(x.id) && <LuBookmark size={12} className="absolute -top-1.5 -right-1.5 text-danger" fill="currentColor" />}
              </button>
            ))}
          </div>
          <Button size="lg" className="mt-8" onClick={submit} id="submit-mock">Илгээх</Button>
        </div>
      )}

      {phase === 'result' && score && (
        <div className="gutter flex-1 py-10 max-w-[760px] w-full mx-auto">
          <div className="card p-8">
            <div className="flex items-center gap-4"><CatHead size={64} mood="happy" /><div><div className="eyebrow">Mock дүн</div><h1 className="font-display font-extrabold text-[28px]">{score.raw}/{qs.length} зөв</h1></div></div>
            <div className="mt-6 grid sm:grid-cols-3 gap-3">
              <div className="rounded-2xl bg-forest text-cream p-4"><div className="font-thin text-[40px] leading-none text-lime tnum">{scaled}</div><div className="text-[11.5px] text-cream/70 mt-1">Math оноо (ойролцоо)</div></div>
              <div className="rounded-2xl bg-paper-2 p-4"><div className="font-thin text-[40px] leading-none tnum">{mmss(LIMIT - left)}</div><div className="text-[11.5px] text-ink-3 mt-1">зарцуулсан хугацаа</div></div>
              <div className="rounded-2xl bg-paper-2 p-4"><div className="font-thin text-[40px] leading-none tnum">{s.profile.target}</div><div className="text-[11.5px] text-ink-3 mt-1">зорилт</div></div>
            </div>
            <div className="mt-6 grid gap-2">
              {Object.entries(score.byDomain).map(([d, [c, t]]) => (
                <div key={d} className="flex items-center gap-3 text-[14px]"><span className="flex-1">{DOMAINS[d as Domain].en}</span><span className="tnum font-bold">{c}/{t}</span></div>
              ))}
            </div>
            <p className="mt-5 text-[12px] text-ink-3">Тэмдэглэл: оноо нь 10 асуултын жишээ дээрх ойролцоо тооцоо бөгөөд College Board-ын албан ёсны хувиргалт биш.</p>
            <div className="mt-6 flex flex-wrap gap-3"><Button onClick={() => go({ name: 'mistakes' })}>Алдаагаа давтах</Button><Button variant="secondary" onClick={() => go({ name: 'dashboard' })}>Нүүр</Button></div>
          </div>
        </div>
      )}

      {phase === 'test' && (
        <footer className="border-t border-line bg-paper sticky bottom-0" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
          <div className="gutter h-16 flex items-center gap-3">
            <span className="text-[13px] font-semibold">{s.profile.name}</span>
            <button onClick={() => setPhase('review')} className="mx-auto h-10 px-4 rounded-lg bg-ink text-paper text-[13px] font-bold">Question {i + 1} of {qs.length}</button>
            <Button variant="secondary" size="sm" disabled={i === 0} onClick={() => setI(i - 1)} icon={<LuChevronLeft />}>Back</Button>
            <Button size="sm" onClick={() => (i + 1 < qs.length ? setI(i + 1) : setPhase('review'))} id="mock-next" variant="teal">Next <LuChevronRight /></Button>
          </div>
        </footer>
      )}

      <Modal open={ref} onClose={() => setRef(false)} className="max-w-lg">
        <div className="p-6">
          <div className="flex items-center justify-between"><h3 className="font-display font-extrabold">Reference</h3><button onClick={() => setRef(false)} aria-label="Хаах"><LuX /></button></div>
          <div className="mt-4 grid grid-cols-2 gap-3 text-[14px]">
            {[['A=\\pi r^2', 'Тойргийн талбай'], ['C=2\\pi r', 'Тойргийн урт'], ['A=\\ell w', 'Тэгш өнцөгт'], ['A=\\tfrac12 bh', 'Гурвалжин'], ['c^2=a^2+b^2', 'Пифагор'], ['V=\\ell wh', 'Хайрцаг'], ['V=\\pi r^2h', 'Цилиндр'], ['30^\\circ\\!-\\!60^\\circ\\!-\\!90^\\circ:\\ x,\\ x\\sqrt3,\\ 2x', 'Тусгай гурвалжин']].map(([t, l]) => (
              <div key={t} className="rounded-xl border border-line p-3"><Rich text={`$${t}$`} /><div className="text-[11.5px] text-ink-3 mt-1">{l}</div></div>
            ))}
          </div>
          <p className="mt-3 text-[12px] text-ink-3">Тойрог 360°, гурвалжны өнцгүүдийн нийлбэр 180°.</p>
        </div>
      </Modal>
    </div>
  );
}
