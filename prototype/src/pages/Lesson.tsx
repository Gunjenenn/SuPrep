import { useEffect, useMemo, useState } from 'react';
import { LuArrowRight, LuCheck, LuLightbulb, LuMessageCircle, LuRotateCcw, LuX } from 'react-icons/lu';
import { CatHead, CatSitting } from '../brand/Cat';
import { Blob, Stars } from '../brand/Decor';
import { Exercise, STAGES, nodeById } from '../data/curriculum';
import { badgeById } from '../data/meta';
import { useStore } from '../lib/store';
import { getTutor } from '../services/tutor';
import { Rich, Tex } from '../components/Math';
import { Button, Confetti, CountUp, Pill, Suu } from '../components/ui';
import BadgeEmblem from '../components/Badge';

function shuffle<T>(a: T[], seed = 1): T[] {
  const r = [...a];
  let x = seed;
  for (let i = r.length - 1; i > 0; i--) {
    x = (x * 9301 + 49297) % 233280;
    const j = Math.floor((x / 233280) * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
}
const norm = (s: string) => s.replace(/\s/g, '').replace(/[−–]/g, '-').toLowerCase();

export default function Lesson({ id }: { id: string }) {
  const { s, go, award, completeNode, learnWords, giveBadge, setCtx } = useStore();
  const node = nodeById(id)!;
  const stage = node.stage;
  const isCp = node.kind === 'checkpoint';
  const [attempt, setAttempt] = useState(0);
  const exercises: Exercise[] = useMemo(() => (isCp ? node.variants![attempt % node.variants!.length] : node.exercises!), [isCp, attempt, node]);
  const [i, setI] = useState(0);
  const [st, setSt] = useState<{ k: string; v: 'answering' | 'right' | 'wrong' }>({ k: '', v: 'answering' });
  const [results, setResults] = useState<{ ok: boolean; concept: string; explain: string; idx: number }[]>([]);
  const [finished, setFinished] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  const [ans, setAns] = useState<{ k: string; v: any }>({ k: '', v: null });
  const answer = ans.k === `${attempt}-${i}` ? ans.v : null;
  const setAnswer = (v: any) => setAns({ k: `${attempt}-${i}`, v });
  const state = st.k === `${attempt}-${i}` ? st.v : 'answering';
  const setState = (v: 'answering' | 'right' | 'wrong') => setSt({ k: `${attempt}-${i}`, v });
  const ex = exercises[i];
  const graded = exercises.filter((e) => e.kind !== 'concept' && e.kind !== 'match').length;

  useEffect(() => { setCtx({ kind: 'lesson', title: node.title, skill: stage.id === 's1' ? 'Mathematical English' : stage.id === 's3' ? 'Intersections' : node.en }); }, [id]); // eslint-disable-line
  useEffect(() => { setHint(null); }, [i, attempt]);

  const correct = results.filter((r) => r.ok).length;
  const passed = isCp ? correct >= 4 : true;

  const check = () => {
    if (!ex || ex.kind === 'concept' || ex.kind === 'match') return;
    let ok = false;
    if (ex.kind === 'choice') ok = answer === ex.answer;
    if (ex.kind === 'build') {
      const a = (answer as string[] | null) || [];
      ok = a.join(' ') === ex.answer.join(' ');
      const eq = ex.answer.indexOf('=');
      if (!ok && eq > 0) ok = a.join(' ') === [...ex.answer.slice(eq + 1), '=', ...ex.answer.slice(0, eq)].join(' ');
    }
    if (ex.kind === 'input') ok = ex.answer.some((a) => norm(a) === norm(String(answer || '')));
    setResults((r) => [...r, { ok, concept: ex.concept, explain: ex.explain, idx: i }]);
    setState(ok ? 'right' : 'wrong');
  };
  const next = () => {
    if (i + 1 < exercises.length) setI(i + 1);
    else finish();
  };
  const finish = () => {
    setFinished(true);
    const first = !s.done[node.id];
    if (!isCp) {
      completeNode(node.id, correct);
      award(first ? node.xp : 5, first ? `Хичээл: ${node.title}` : 'Давталт');
      if (stage.id === 's1') learnWords(exercises.filter((e) => e.kind === 'match').flatMap((e: any) => e.pairs.map((p: string[]) => p[0])).slice(0, 5));
      if (node.id === 's1-l3') giveBadge('first-equation');
    } else if (passed) {
      completeNode(node.id, correct);
      if (first) {
        award(node.xp, 'Шалгалт давлаа');
        setTimeout(() => award(80, `Шинэ ур чадвар: ${stage.title}`), 700);
        if (stage.badge) setTimeout(() => giveBadge(stage.badge!), 1500);
      } else award(10, 'Шалгалт дахин давлаа');
    } else {
      award(5, 'Шалгалтын оролдлого');
    }
  };
  const retry = () => { setAttempt((a) => a + 1); setI(0); setResults([]); setFinished(false); };

  const askHint = async () => {
    if (!ex) return;
    if ('hint' in ex && ex.hint) { setHint(ex.hint); return; }
    setHint('…');
    const r = await getTutor().reply({ mode: 'hint', ctx: { kind: 'lesson', title: node.title, skill: 'Mathematical English' }, history: [] });
    setHint(r.text);
  };

  const canCheck = ex && ((ex.kind === 'choice' && answer !== null) || (ex.kind === 'build' && answer?.length) || (ex.kind === 'input' && String(answer || '').trim()));

  if (finished) {
    return <Finish node={node} isCp={isCp} passed={passed} correct={correct} graded={graded} results={results} onRetry={retry}
      onNext={() => {
        const st = STAGES.find((x) => x.id === stage.id)!;
        const idx = st.nodes.findIndex((n) => n.id === node.id);
        const nx = st.nodes[idx + 1];
        if (passed && isCp) {
          const nextStage = STAGES[STAGES.findIndex((x) => x.id === stage.id) + 1];
          if (nextStage) go({ name: 'journey' }); else go({ name: 'dashboard' });
        } else if (nx && nx.kind !== 'desmos') go({ name: 'lesson', id: nx.id });
        else go({ name: 'journey' });
      }} />;
  }

  return (
    <div className="gutter py-5 md:py-7 max-w-[860px] mx-auto">
      {/* header */}
      <div className="flex items-center gap-4">
        <button onClick={() => go({ name: 'journey' })} className="h-10 w-10 grid place-items-center rounded-xl hover:bg-paper-2 text-ink-2" aria-label="Хаах"><LuX size={20} /></button>
        <div className="flex-1 flex gap-1.5" aria-label={`Алхам ${i + 1}/${exercises.length}`}>
          {exercises.map((_, k) => {
            const filled = k < i || (k === i && state !== 'answering');
            const bad = results.find((r) => r.idx === k)?.ok === false;
            return (
              <div key={k} className="flex-1 h-2.5 rounded-full bg-paper-2 overflow-hidden">
                <div className={`h-full rounded-full bar-fill ${bad ? 'bg-rose' : 'bg-leaf'}`} style={{ width: filled ? '100%' : '0%' }} />
              </div>
            );
          })}
        </div>
        <Pill tone={isCp ? 'dark' : 'leaf'}>{isCp ? 'Шалгалт · 4/5' : `+${node.xp} XP`}</Pill>
      </div>
      <div className="mt-6 flex items-center gap-2 text-[12px] text-ink-3 font-semibold">
        <span className="eyebrow">{stage.no}-р шат · {stage.title}</span>
        <span>·</span><span>{node.title}</span>
      </div>

      <div key={`${attempt}-${i}`} className="mt-4 card p-6 md:p-8 anim-rise min-h-[320px]">
        {ex.kind === 'concept' && <Concept ex={ex} />}
        {ex.kind === 'match' && <Match ex={ex} onDone={() => setTimeout(next, 650)} />}
        {ex.kind === 'choice' && <Choice ex={ex} value={answer} onChange={setAnswer} locked={state !== 'answering'} />}
        {ex.kind === 'build' && <Build ex={ex} value={answer || []} onChange={setAnswer} locked={state !== 'answering'} />}
        {ex.kind === 'input' && <Input ex={ex} value={answer || ''} onChange={setAnswer} locked={state !== 'answering'} onEnter={() => canCheck && state === 'answering' ? check() : state !== 'answering' && next()} />}
      </div>

      {hint && state === 'answering' && (
        <div className="mt-4 anim-rise"><Suu mood="think" text={hint} size={52} tone="sage" /></div>
      )}

      {/* action bar */}
      <div className={`mt-5 rounded-2xl p-4 md:p-5 flex flex-wrap items-center gap-4 transition-colors ${state === 'right' ? 'bg-sage' : state === 'wrong' ? 'bg-rose-soft' : ''}`}>
        {state === 'answering' ? (
          <>
            {ex.kind !== 'concept' && ex.kind !== 'match' && (
              <Button variant="ghost" onClick={askHint} icon={<LuLightbulb />} id="hint-btn">Сэжүүр</Button>
            )}
            <div className="flex-1" />
            {ex.kind === 'concept' ? (
              <Button size="lg" onClick={next} id="next-btn">Ойлголоо</Button>
            ) : ex.kind === 'match' ? (
              <span className="text-[13px] text-ink-3">Хос бүрийг холбоход автоматаар үргэлжилнэ</span>
            ) : (
              <Button size="lg" onClick={check} disabled={!canCheck} id="check-btn">Шалгах</Button>
            )}
          </>
        ) : (
          <>
            <div className="flex items-start gap-3 flex-1 min-w-[240px]">
              <CatHead size={50} mood={state === 'right' ? 'happy' : 'think'} />
              <div className="min-w-0">
                <div className={`font-display font-extrabold ${state === 'right' ? 'text-leaf-2' : 'text-rose'}`}>
                  {state === 'right' ? ['Яг зөв!', 'Мяу, гоё!', 'Гайхалтай!'][i % 3] : 'Бараг л болсон.'}
                </div>
                <div className="text-[14px] text-ink-2 mt-0.5"><Rich text={(ex as any).explain} /></div>
              </div>
            </div>
            <Button size="lg" onClick={next} variant={state === 'right' ? 'primary' : 'dark'} id="continue-btn">Үргэлжлүүлэх</Button>
          </>
        )}
      </div>
    </div>
  );
}

function Concept({ ex }: { ex: Extract<Exercise, { kind: 'concept' }> }) {
  return (
    <div>
      <div className="eyebrow">Ойлголт</div>
      <h2 className="font-display font-extrabold text-[24px] mt-1.5">{ex.title}</h2>
      <p className="mt-3 text-[16px] text-ink-2 leading-relaxed max-w-[60ch]"><Rich text={ex.body} /></p>
      {ex.example && (
        <div className="mt-6 rounded-2xl border border-line bg-paper-2/60 p-5 grid md:grid-cols-[1fr_auto_auto] items-center gap-4">
          <div>
            <div className="font-semibold text-[16px]">“{ex.example.en}”</div>
            <div className="text-ink-3 text-[13px] mt-0.5">{ex.example.mn}</div>
          </div>
          <LuArrowRight className="text-ink-3 hidden md:block" />
          <div className="math-lg rounded-xl bg-paper border border-line px-5 py-3 text-center"><Tex tex={ex.example.tex} /></div>
        </div>
      )}
    </div>
  );
}

function Match({ ex, onDone }: { ex: Extract<Exercise, { kind: 'match' }>; onDone: () => void }) {
  const left = ex.pairs.map((p) => p[0]);
  const right = useMemo(() => shuffle(ex.pairs.map((p) => p[1]), ex.pairs.length * 7 + 3), [ex]);
  const [sel, setSel] = useState<string | null>(null);
  const [matched, setMatched] = useState<string[]>([]);
  const [bad, setBad] = useState<string | null>(null);
  const pick = (r: string) => {
    if (!sel) return;
    const ok = ex.pairs.some((p) => p[0] === sel && p[1] === r);
    if (ok) {
      const m = [...matched, sel];
      setMatched(m); setSel(null);
      if (m.length === ex.pairs.length) onDone();
    } else { setBad(r); setTimeout(() => setBad(null), 450); }
  };
  const btn = 'w-full min-h-[54px] rounded-2xl border-2 px-4 py-2 text-[15px] font-semibold transition-all';
  return (
    <div>
      <div className="eyebrow">Холбох</div>
      <h2 className="font-display font-extrabold text-[20px] mt-1.5">{ex.prompt}</h2>
      <div className="mt-6 grid grid-cols-2 gap-3 md:gap-5">
        <div className="grid gap-3">
          {left.map((l) => {
            const done = matched.includes(l);
            return (
              <button key={l} disabled={done} onClick={() => setSel(l)} className={`${btn} ${done ? 'border-sage-2 bg-sage text-leaf-2 opacity-70' : sel === l ? 'border-leaf bg-sage/60' : 'border-line bg-paper hover:border-line-2'}`}>{l}</button>
            );
          })}
        </div>
        <div className="grid gap-3">
          {right.map((r) => {
            const pair = ex.pairs.find((p) => p[1] === r)!;
            const done = matched.includes(pair[0]);
            return (
              <button key={r} disabled={done || !sel} onClick={() => pick(r)} className={`${btn} ${done ? 'border-sage-2 bg-sage text-leaf-2 opacity-70' : bad === r ? 'border-rose bg-rose-soft anim-shake' : 'border-line bg-paper hover:border-line-2'} ${!sel && !done ? 'cursor-default' : ''}`}>{r}</button>
            );
          })}
        </div>
      </div>
      <p className="mt-4 text-[12.5px] text-ink-3">Зүүн талаас үг сонгоод, баруун талаас утгыг нь дар.</p>
    </div>
  );
}

function Choice({ ex, value, onChange, locked }: { ex: Extract<Exercise, { kind: 'choice' }>; value: number | null; onChange: (v: number) => void; locked: boolean }) {
  return (
    <div>
      <div className="eyebrow">Сонгох</div>
      <h2 className="font-display font-extrabold text-[20px] mt-1.5 leading-snug"><Rich text={ex.prompt} /></h2>
      <div className="mt-6 grid gap-3">
        {ex.options.map((o, k) => {
          const chosen = value === k;
          const show = locked && (k === ex.answer || chosen);
          const good = k === ex.answer;
          return (
            <button key={k} disabled={locked} onClick={() => onChange(k)} id={`opt-${k}`}
              className={`flex items-center gap-4 rounded-2xl border-2 px-4 py-3.5 text-left text-[16px] transition-all ${show ? (good ? 'border-leaf bg-sage' : 'border-rose bg-rose-soft') : chosen ? 'border-leaf bg-sage/50' : 'border-line bg-paper hover:border-line-2'}`}>
              <span className={`h-8 w-8 shrink-0 rounded-lg grid place-items-center text-[13px] font-bold border ${chosen ? 'bg-leaf text-white border-leaf' : 'border-line-2 text-ink-3'}`}>{'ABCD'[k]}</span>
              <span className="min-w-0"><Rich text={o} /></span>
              {show && good && <LuCheck className="ml-auto text-leaf" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Build({ ex, value, onChange, locked }: { ex: Extract<Exercise, { kind: 'build' }>; value: string[]; onChange: (v: string[]) => void; locked: boolean }) {
  const used = [...value];
  const bank = useMemo(() => shuffle(ex.tokens.map((t, k) => ({ t, k })), ex.tokens.length * 13 + 5), [ex]);
  const usedIdx = useMemo(() => {
    const taken: number[] = [];
    used.forEach((u) => { const f = bank.find((b) => b.t === u && !taken.includes(b.k)); if (f) taken.push(f.k); });
    return taken;
  }, [value]); // eslint-disable-line
  return (
    <div>
      <div className="eyebrow">Тэгшитгэл бүтээх</div>
      <h2 className="font-display font-extrabold text-[20px] mt-1.5">{ex.prompt}</h2>
      <div className="mt-4 rounded-2xl bg-paper-2/70 border border-line px-5 py-4 flex items-center gap-3">
        <CatHead size={34} mood="focus" />
        <span className="text-[17px] font-semibold">“{ex.sentence}”</span>
      </div>
      <div className="mt-6 min-h-[64px] rounded-2xl border-2 border-dashed border-line-2 p-3 flex flex-wrap items-center gap-2" aria-label="Таны хариулт">
        {value.length === 0 && <span className="text-ink-3 text-[14px] px-2">Доорх хэсгүүдээс дарж тэгшитгэлээ бүтээ</span>}
        {value.map((t, k) => (
          <button key={k} disabled={locked} onClick={() => onChange(value.filter((_, j) => j !== k))}
            className="h-12 min-w-12 px-3 rounded-xl bg-forest text-cream font-[KaTeX_Main,serif] text-[22px] anim-pop">{t === 'x' ? <i>x</i> : t}</button>
        ))}
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        {bank.map((b) => {
          const taken = usedIdx.includes(b.k);
          return (
            <button key={b.k} data-token={b.t} disabled={taken || locked} onClick={() => onChange([...value, b.t])}
              className={`h-12 min-w-12 px-3 rounded-xl border-2 font-[KaTeX_Main,serif] text-[22px] transition-all ${taken ? 'border-dashed border-line text-transparent' : 'border-line-2 bg-paper hover:border-leaf hover:-translate-y-0.5 shadow-[0_3px_0_0_var(--c-line)]'}`}>{b.t === 'x' ? <i>x</i> : b.t}</button>
          );
        })}
      </div>
    </div>
  );
}

function Input({ ex, value, onChange, locked, onEnter }: { ex: Extract<Exercise, { kind: 'input' }>; value: string; onChange: (v: string) => void; locked: boolean; onEnter: () => void }) {
  return (
    <div>
      <div className="eyebrow">Бодох</div>
      <h2 className="font-display font-extrabold text-[20px] mt-1.5 leading-snug"><Rich text={ex.prompt} /></h2>
      <input autoFocus value={value} disabled={locked} onChange={(e) => onChange(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && onEnter()}
        placeholder={ex.placeholder} id="answer-input" inputMode="text" autoComplete="off"
        className="mt-7 w-full max-w-xs h-14 rounded-2xl border-2 border-line-2 bg-paper px-5 text-[22px] font-[KaTeX_Main,serif] outline-none focus:border-leaf" />
      <p className="mt-2 text-[12.5px] text-ink-3">Тоо эсвэл илэрхийлэл бичээд Enter дар.</p>
    </div>
  );
}

function Finish({ node, isCp, passed, correct, graded, results, onRetry, onNext }: any) {
  const { s, go } = useStore();
  const stage = node.stage;
  const weak = results.filter((r: any) => !r.ok);
  const nextStage = STAGES[STAGES.findIndex((x) => x.id === stage.id) + 1];
  const [suu, setSuu] = useState<string | null>(null);
  useEffect(() => {
    if (isCp && !passed && weak.length) {
      const names = [...new Set(weak.map((w: any) => w.concept))].join(', ');
      if (stage.id === 's1') getTutor().reply({ mode: 'explain', ctx: { kind: 'lesson', title: node.title, skill: 'Mathematical English' }, history: [] }).then((r) => setSuu(`**${names}** дээр бүдэрлээ. ${r.text}`));
      else setSuu(`**${names}** сэдвийг дээрх тайлбараар нэг харчихаад, шинэ хувилбараар дахин оролдъё. Гацвал надаас асуугаарай.`);
    }
  }, []); // eslint-disable-line
  if (isCp && !passed) {
    return (
      <div className="gutter py-8 max-w-[760px] mx-auto">
        <div className="card p-7 md:p-9 anim-rise">
          <div className="flex items-center gap-4">
            <CatHead size={76} mood="think" />
            <div>
              <div className="eyebrow" style={{ color: 'var(--c-rose)' }}>{correct}/{graded} зөв · 4 хэрэгтэй</div>
              <h1 className="font-display font-extrabold text-[26px] mt-1">Бараг боллоо! Алдсан хэсгээ хамтдаа давтъя.</h1>
            </div>
          </div>
          <div className="mt-6 grid gap-3">
            {weak.map((w: any, k: number) => (
              <div key={k} className="rounded-2xl border border-line bg-paper-2/50 p-4">
                <Pill tone="rose">{w.concept}</Pill>
                <p className="mt-2 text-[14.5px] text-ink-2"><Rich text={w.explain} /></p>
              </div>
            ))}
          </div>
          {suu && <div className="mt-5"><Suu mood="idle" text={suu} size={48} tone="sage" /></div>}
          <div className="mt-7 flex flex-wrap gap-3">
            <Button size="lg" onClick={onRetry} icon={<LuRotateCcw />} id="retry-btn">Шинэ хувилбараар дахин оролдох</Button>
            <Button size="lg" variant="secondary" onClick={() => go({ name: 'tutor' })} icon={<LuMessageCircle />}>Суугаас асуух</Button>
          </div>
          <p className="mt-4 text-[12.5px] text-ink-3">Оролдлого хязгааргүй. Дараагийн удаа ижил төрлийн шинэ асуултууд гарна.</p>
        </div>
      </div>
    );
  }
  const badge = isCp && stage.badge && s.badges[stage.badge] ? badgeById(stage.badge) : null;
  return (
    <div className="gutter py-8 max-w-[760px] mx-auto">
      <div className="card p-7 md:p-10 text-center relative overflow-hidden anim-rise">
        <Confetti />
        <div className="relative mx-auto w-[280px] h-[210px]">
          <Blob className="absolute inset-x-0 bottom-0 h-[130px] w-full" />
          <Stars className="absolute -top-3 -right-6 w-32" />
          <div className="absolute left-1/2 -translate-x-1/2 bottom-0 anim-bounce-cat"><CatSitting size={130} mood="happy" /></div>
        </div>
        <div className="eyebrow mt-5">{isCp ? 'Шалгалт давлаа' : 'Хичээл дууслаа'}</div>
        <h1 className="font-display font-extrabold text-[28px] mt-1.5">{isCp ? `${stage.title} — эзэмшлээ!` : node.title}</h1>
        <div className="mt-5 flex justify-center gap-3 flex-wrap">
          <div className="rounded-2xl bg-forest text-cream px-5 py-3 min-w-[120px]">
            <div className="font-display font-extrabold text-[28px] text-lime tnum">+<CountUp value={isCp ? node.xp + 80 : node.xp} /></div>
            <div className="text-[11px] text-cream/70 uppercase tracking-wider">XP</div>
          </div>
          {graded > 0 && (
            <div className="rounded-2xl bg-paper-2 px-5 py-3 min-w-[120px]">
              <div className="font-display font-extrabold text-[28px] tnum">{correct}/{graded}</div>
              <div className="text-[11px] text-ink-3 uppercase tracking-wider">Зөв</div>
            </div>
          )}
          <div className="rounded-2xl bg-rose-soft px-5 py-3 min-w-[120px]">
            <div className="font-display font-extrabold text-[28px] text-rose tnum">{s.streak.count}</div>
            <div className="text-[11px] text-ink-3 uppercase tracking-wider">Хэмнэл</div>
          </div>
        </div>
        {isCp && nextStage && (
          <div className="mt-6 rounded-2xl border border-sage-2 bg-sage px-5 py-4 inline-flex items-center gap-3 text-left anim-pop" style={{ animationDelay: '.6s' }}>
            <span className="h-10 w-10 rounded-xl bg-leaf text-white grid place-items-center"><LuCheck strokeWidth={3} /></span>
            <span><span className="block text-[12px] text-leaf-2 font-semibold uppercase tracking-wider">Нээгдлээ</span><span className="font-display font-extrabold">{nextStage.no}-р шат · {nextStage.title}</span></span>
          </div>
        )}
        {badge && <div className="mt-5 grid place-items-center"><BadgeEmblem badge={badge} earned size={74} /><div className="text-[12px] font-semibold mt-1">{badge.mn}</div></div>}
        <div className="mt-8 flex justify-center gap-3 flex-wrap">
          <Button size="lg" onClick={onNext} icon={<LuArrowRight />} className="flex-row-reverse" id="finish-next">{isCp ? 'Замнал руу' : 'Дараагийн алхам'}</Button>
          <Button size="lg" variant="secondary" onClick={() => go({ name: 'dashboard' })}>Нүүр</Button>
        </div>
      </div>
    </div>
  );
}
