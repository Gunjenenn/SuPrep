import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { LuArrowLeft, LuArrowRight, LuCheck, LuCircleHelp, LuLightbulb, LuPlay, LuRotateCcw, LuSpline, LuSparkles } from 'react-icons/lu';
import { CatHead, CatSitting } from '../brand/Cat';
import { Blob, Stars } from '../brand/Decor';
import { DESMOS, DLesson, DStep, desmosById } from '../data/desmos';
import { HACKS, badgeById } from '../data/meta';
import { toGraphInit } from '../data/questions';
import { Poi, POI_LABEL, equivalent, parseRow } from '../lib/graph';
import { desmosNodeId, useStore } from '../lib/store';
import { getTutor } from '../services/tutor';
import GraphCalc, { GraphApi, GraphState, ViewEvent } from '../components/GraphCalc';
import { Rich } from '../components/Math';
import { Bar, Button, Confetti, CountUp, Pill } from '../components/ui';
import BadgeEmblem from '../components/Badge';

export default function DesmosPage({ id }: { id?: string }) {
  return id ? <Workspace key={id} lesson={desmosById(id)} /> : <AcademyHome />;
}

function AcademyHome() {
  const { s, go } = useStore();
  const done = DESMOS.filter((d) => s.done[desmosNodeId(d.id)]).length;
  return (
    <div className="pb-10">
      <section className="bg-forest text-cream relative overflow-hidden">
        <svg className="absolute inset-0 w-full h-full opacity-[0.07]" aria-hidden="true">
          <defs><pattern id="g" width="28" height="28" patternUnits="userSpaceOnUse"><path d="M28 0H0V28" fill="none" stroke="#fff" /></pattern></defs>
          <rect width="100%" height="100%" fill="url(#g)" />
        </svg>
        <div className="gutter max-w-[1240px] mx-auto py-9 md:py-12 grid md:grid-cols-[1fr_340px] gap-8 items-center relative">
          <div>
            <div className="eyebrow" style={{ color: 'var(--c-lime)' }}>Suprep-ийн гол онцлог</div>
            <h1 className="font-display font-extrabold text-[34px] md:text-[48px] leading-[0.98] mt-2">Desmos<br />Академи</h1>
            <p className="mt-4 text-cream/75 max-w-[56ch] text-[15px]">
              Digital SAT-ын Math хэсгийн бүх асуултад Desmos график тооцоолуур зөвшөөрөгдсөн. Ихэнх сурагч үүнийг ашиглаж чаддаггүй. Энд чи тэгээс эхлээд <span className="font-script text-lime text-[20px]">хэзээ, яаж</span> ашиглахаа сурна.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-4">
              <Button size="lg" onClick={() => go({ name: 'desmos', id: DESMOS.find((d) => !s.done[desmosNodeId(d.id)])?.id || 'd3' })} variant="lime" icon={<LuPlay />}>
                {done ? 'Үргэлжлүүлэх' : 'Эхлэх'}
              </Button>
              <div className="text-[13px] text-cream/70 tnum">{done}/{DESMOS.length} хичээл · {DESMOS.reduce((a, d) => a + d.xp, 0)} XP</div>
            </div>
          </div>
          <MiniGraphArt />
        </div>
      </section>

      <div className="gutter max-w-[1240px] mx-auto mt-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger">
          {DESMOS.map((d) => {
            const isDone = !!s.done[desmosNodeId(d.id)];
            return (
              <button key={d.id} onClick={() => go({ name: 'desmos', id: d.id })} id={`dl-${d.id}`}
                className={`card lift text-left p-5 flex flex-col gap-3 relative ${d.featured ? 'ring-2 ring-lime ring-offset-2 ring-offset-bg' : ''}`}>
                <div className="flex items-center justify-between">
                  <span className="font-thin text-[30px] leading-none text-teal tnum">{String(d.no).padStart(2, '0')}</span>
                  {isDone ? <Pill tone="leaf"><LuCheck size={12} /> Дууссан</Pill> : d.featured ? <Pill tone="dark">★ Өнөөдрийн сорилт</Pill> : <Pill tone="teal">{d.skill}</Pill>}
                </div>
                <div>
                  <div className="font-display font-extrabold text-[17px] leading-snug">{d.title}</div>
                  <div className="text-[12.5px] text-ink-3 mt-0.5">{d.en}</div>
                </div>
                {d.question && <div className="text-[13px] text-ink-2 line-clamp-2"><Rich text={d.question} /></div>}
                <div className="mt-auto flex items-center justify-between text-[12px] text-ink-3 pt-1">
                  <span>{d.minutes} мин · {d.steps.length} алхам</span>
                  <span className="font-semibold text-leaf">+{d.xp} XP</span>
                </div>
              </button>
            );
          })}
        </div>

        <HackStrip />

        <div className="mt-8 grid lg:grid-cols-[1fr_380px] gap-5">
          <div className="card p-6">
            <div className="eyebrow">Чөлөөт талбар</div>
            <h2 className="font-display font-extrabold text-[19px] mt-1">Тооцоолуураа туршаад үз</h2>
            <p className="text-[13.5px] text-ink-2 mt-1 mb-4"><Rich text="Тэгшитгэл, тэнцэтгэл биш, цэг $(a,b)$, слайдер $a=2$, хүснэгт — бүгдийг дэмжинэ. График дээр дарахад онцгой цэгүүд гарна." /></p>
            <GraphCalc initialRows={['y=x^2-4', 'y=x+2', '']} height={420} label="Чөлөөт тооцоолуур" />
          </div>
          <div className="card p-6 h-fit">
            <div className="eyebrow">Стратегийн дүрэм</div>
            <h3 className="font-display font-extrabold text-[17px] mt-1">Desmos-ийг хэзээ ашиглах вэ?</h3>
            <ul className="mt-4 grid gap-2.5 text-[14px]">
              {[
                ['Огтлолцол, систем тэгшитгэл', true], ['Язгуур, квадрат тэгшитгэл', true], ['Орой, хамгийн их/бага утга', true],
                ['Хүснэгтийн өгөгдөл, регресс', true], ['Тэнцэтгэл бишийн шийд', true], ['Нэг алхамт тооцоо', false], ['Үгийн утга, тайлбар', false],
              ].map(([t, y]) => (
                <li key={t as string} className="flex items-center gap-3">
                  <span className={`h-6 w-6 rounded-full grid place-items-center text-[11px] font-bold ${y ? 'bg-teal text-white' : 'bg-paper-2 text-ink-3'}`}>{y ? <LuSpline size={13} /> : '✎'}</span>
                  <span className={y ? '' : 'text-ink-3'}>{t}</span>
                  <span className="ml-auto text-[11.5px] text-ink-3">{y ? 'Desmos' : 'Гараар'}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-[12px] text-ink-3 leading-relaxed">Тэмдэглэл: энэ бол Suprep-ийн Desmos-маягийн сургалтын тооцоолуур. Жинхэнэ Desmos API-г лиценз авсны дараа холбоно.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function HackStrip() {
  const [h, setH] = useState(0);
  const hack = HACKS[h];
  return (
    <section className="mt-8 card p-5 md:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div><div className="eyebrow">Desmos hack</div><h2 className="font-display font-bold text-[18px] mt-1">SAT-д хамгийн их хэрэглэгддэг 5 арга</h2></div>
        <span className="text-[12.5px] text-ink-3">Сонгоод баруун талын тооцоолуурт шууд туршина</span>
      </div>
      <div className="mt-4 grid lg:grid-cols-[300px_1fr] gap-5">
        <div className="grid gap-2 content-start">
          {HACKS.map((x, i) => (
            <button key={x.title} onClick={() => setH(i)} id={`hack-${i}`}
              className={`text-left rounded-2xl border-[1.5px] px-4 py-3 transition-transform ${h === i ? 'border-leaf bg-sage' : 'border-line bg-paper hover:border-line-2'}`}
              style={{ boxShadow: `0 3px 0 ${h === i ? 'var(--c-leaf-2)' : 'var(--c-edge)'}` }}>
              <span className="font-mono text-[10.5px] font-bold text-ink-3 tracking-wider">HACK {i + 1}</span>
              <span className="block font-display font-bold text-[14px] mt-0.5">{x.title}</span>
            </button>
          ))}
        </div>
        <div className="grid md:grid-cols-[1fr_1.2fr] gap-4 min-w-0">
          <div>
            <div className="font-display font-bold text-[17px]">{hack.title}</div>
            <div className="text-[13px] text-ink-3 mt-0.5">Хэзээ: {hack.when}</div>
            <ol className="mt-4 grid gap-2.5">
              {hack.steps.map((st, k) => (
                <li key={st} className="flex gap-3 items-start text-[14px]"><span className="coin h-7 w-7 shrink-0 rounded-full grid place-items-center text-[12px] font-bold text-white" style={{ ['--face' as any]: 'var(--c-teal)', ['--edge' as any]: 'var(--c-teal-2)' }}>{k + 1}</span>{st}</li>
              ))}
            </ol>
          </div>
          <div className="h-[300px] min-w-0"><GraphCalc key={h} initialRows={toGraphInit(hack.rows)} height="100%" label={`Hack ${h + 1}`} listWidth={200} /></div>
        </div>
      </div>
    </section>
  );
}

function MiniGraphArt() {
  return (
    <div className="relative hidden md:block h-[240px]" aria-hidden="true">
      <div className="absolute inset-0 rounded-3xl bg-paper overflow-hidden shadow-pop">
        <svg viewBox="0 0 340 240" className="w-full h-full">
          <g stroke="var(--c-graph-grid)">{Array.from({ length: 18 }).map((_, i) => <path key={i} d={`M${i * 20} 0V240M0 ${i * 20}H340`} />)}</g>
          <path d="M170 0V240M0 120H340" stroke="var(--c-graph-axis)" strokeWidth={1.4} />
          <path d="M60 240 Q170 -120 280 240" fill="none" stroke="#2f8a3e" strokeWidth={3} className="draw-path" style={{ ['--len' as any]: 520 }} />
          <path d="M20 200 L330 40" stroke="#c8513f" strokeWidth={3} className="draw-path" style={{ ['--len' as any]: 350, animationDelay: '.4s' }} />
          <circle cx={110} cy={174} r={6} fill="var(--c-paper)" stroke="#7d8780" strokeWidth={2.2} className="anim-pop" style={{ animationDelay: '1.6s' }} />
          <circle cx={244} cy={105} r={6} fill="#56605a" className="anim-pop" style={{ animationDelay: '1.8s' }} />
        </svg>
        <div className="absolute right-6 top-[78px] rounded-lg bg-ink text-paper px-2 py-1 text-[12px] font-semibold anim-pop" style={{ animationDelay: '1.9s' }}>(3, 5)</div>
      </div>
      <div className="absolute -left-10 -bottom-6"><CatHead size={92} mood="focus" /></div>
    </div>
  );
}

// ———— lesson workspace ————
const fill = (t: string, kind?: string) => t.replace('{kind}', kind ? POI_LABEL[kind as keyof typeof POI_LABEL].toLowerCase() : 'өөр цэг');
const normAns = (s: string) => s.replace(/\s/g, '').replace(/[−–]/g, '-').toLowerCase();

function Workspace({ lesson }: { lesson: DLesson }) {
  const { s, go, award, completeNode, giveBadge, bumpQuest, setCtx } = useStore();
  const [step, setStep] = useState(-1); // -1 = intro
  const [feedback, setFeedback] = useState<{ tone: 'good' | 'bad' | 'tip'; text: string } | null>(null);
  const [mood, setMood] = useState<'idle' | 'happy' | 'think' | 'wow'>('idle');
  const [answer, setAnswer] = useState('');
  const [tries, setTries] = useState(0);
  const [complete, setComplete] = useState(false);
  const [highlight, setHighlight] = useState<{ x: number; y: number } | null>(null);
  const [tutorText, setTutorText] = useState<string | null>(null);
  const [choiceState, setChoiceState] = useState<{ picked: number; ok: boolean } | null>(null);
  const api = useRef<GraphApi | null>(null);
  const cur: DStep | undefined = lesson.steps[step];
  const stepRef = useRef(step);
  stepRef.current = step;

  useEffect(() => { setCtx({ kind: 'desmos', title: lesson.title, skill: lesson.skill, problem: lesson.question }); }, [lesson.id]); // eslint-disable-line

  const advance = useCallback((msg?: string) => {
    setFeedback(msg ? { tone: 'good', text: msg } : null);
    setMood('happy');
    setHighlight(null);
    setTutorText(null);
    setAnswer('');
    setTries(0);
    setChoiceState(null);
    setTimeout(() => setMood('idle'), 1400);
    setStep((k) => {
      const n = k + 1;
      if (n >= lesson.steps.length) { setTimeout(() => finish(), 500); return k; }
      return n;
    });
  }, [lesson]); // eslint-disable-line

  const finish = () => {
    const nid = desmosNodeId(lesson.id);
    const first = !s.done[nid];
    completeNode(nid);
    award(first ? lesson.xp : 10, first ? `Desmos: ${lesson.title}` : 'Desmos давталт');
    bumpQuest('desmos');
    if (lesson.badge) setTimeout(() => giveBadge(lesson.badge!), 900);
    if (lesson.id === 'd1') giveBadge('desmos-rookie');
    setComplete(true);
  };

  // ———— validators ————
  const onState = useCallback((g: GraphState) => {
    const st = lesson.steps[stepRef.current];
    if (!st) return;
    if (st.type === 'enter') {
      const t = parseRow({ id: 't', kind: 'expr', text: st.target, color: '' });
      const probe = { a: 1.3, b: 0.7, k: 1.1, m: 0.9, ...g.env };
      const ok = g.parsed.some((p, i) => !g.rows[i].hidden && equivalent(p, t, probe));
      if (ok) advance('Зөв! График зурагдлаа.');
    }
    if (st.type === 'slider') {
      const v = g.env[st.name];
      if (v !== undefined && Math.abs(v - st.value) <= (st.tol ?? 0.05)) advance(`Яг таарлаа: ${st.name} = ${st.value}`);
      else if (v !== undefined && stepRef.current === lesson.steps.indexOf(st)) setFeedback({ tone: 'tip', text: `${st.name} = ${v}. Шулуун цэгийг дайрах хүртэл гүйлгэ.` });
    }
    if (st.type === 'regression') {
      if (g.rows.some((r) => r.kind === 'table' && r.regression)) advance('Регресс асаалаа: $y=2x+1$');
    }
  }, [lesson, advance]);

  const onPoi = useCallback((p: Poi) => {
    const st = lesson.steps[stepRef.current];
    if (!st || st.type !== 'select') return;
    const near = !st.at || (Math.abs(p.x - st.at[0]) < 1e-3 && Math.abs(p.y - st.at[1]) < 1e-3);
    if (p.kind === st.kind && near) advance(`${POI_LABEL[p.kind]}: (${p.x}, ${p.y})`);
    else { setMood('think'); setFeedback({ tone: 'bad', text: fill(st.wrong || 'Энэ цэг биш. Дахин хар.', p.kind) }); }
  }, [lesson, advance]);

  const onView = useCallback((e: ViewEvent) => {
    const st = lesson.steps[stepRef.current];
    if (!st) return;
    if (st.type === 'pan' && e === 'pan') advance('Сайн байна! График хөдөллөө.');
    if (st.type === 'zoom' && e === 'zoom') advance('Томруулж чадлаа!');
  }, [lesson, advance]);

  const submitAnswer = () => {
    if (!cur || cur.type !== 'answer') return;
    const ok = cur.accept.some((a) => normAns(a) === normAns(answer));
    if (ok) { advance(cur.explain); return; }
    setTries((t) => t + 1);
    setMood('think');
    setFeedback({ tone: 'bad', text: tries >= 1 ? `${cur.hint} ${cur.explain}` : `Бараг л. ${cur.hint}` });
  };

  // ———— tutor modes ————
  const showHint = () => {
    if (!cur || !('hint' in cur)) return;
    setMood('think');
    setTutorText(cur.hint);
    if (cur.type === 'select' && cur.at) setHighlight({ x: cur.at[0], y: cur.at[1] });
  };
  const explain = async () => {
    setMood('think');
    setTutorText('…');
    const r = await getTutor().reply({ mode: 'explain', ctx: { kind: 'desmos', title: lesson.title, skill: lesson.skill }, history: [] });
    setTutorText(r.text);
  };
  const demo = async () => {
    if (!cur) return;
    setMood('wow');
    if (cur.type === 'enter' && cur.demo) { setTutorText(`Хар даа, би бичээд үзүүлье: **${cur.demo}**`); await api.current?.typeRow(cur.demo); }
    else if (cur.type === 'select' && cur.at) { setHighlight({ x: cur.at[0], y: cur.at[1] }); setTutorText('Тэмдэглэсэн цэгийн ойролцоо шугам дээр дараад, саарал цэгийг дар.'); }
    else if (cur.type === 'slider') { setTutorText(`Слайдерыг ${cur.value} хүртэл гүйлгэж үзүүлье.`); api.current?.setSlider(cur.name, cur.value); }
    else if (cur.type === 'pan' || cur.type === 'zoom') setTutorText(cur.hint);
    else setTutorText('hint' in cur ? (cur as any).hint : 'Энэ алхамд Desmos-ийн үзүүлэн хэрэггүй.');
  };

  const restart = () => { setStep(-1); setComplete(false); setFeedback(null); setAnswer(''); };

  const nextLesson = DESMOS[DESMOS.findIndex((d) => d.id === lesson.id) + 1];
  const progress = step < 0 ? 0 : (step + (complete ? 1 : 0)) / lesson.steps.length;
  const say = step < 0 ? lesson.intro : cur?.say || lesson.outro;

  return (
    <div className="gutter py-5 max-w-[1440px] mx-auto">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => go({ name: 'desmos' })} className="h-9 px-2.5 inline-flex items-center gap-1.5 rounded-xl hover:bg-paper-2 text-ink-2 text-[13px] font-semibold"><LuArrowLeft /> Академи</button>
        <span className="text-ink-3">/</span>
        <span className="text-[13px] font-semibold truncate">{String(lesson.no).padStart(2, '0')} · {lesson.title}</span>
        <div className="ml-auto flex items-center gap-2"><Pill tone="teal">{lesson.skill}</Pill><Pill tone="leaf">+{lesson.xp} XP</Pill></div>
      </div>

      <div className="grid xl:grid-cols-[420px_1fr] gap-5 items-start">
        {/* LEFT: lesson panel */}
        <div className="grid gap-4">
          <div className="card p-5">
            <div className="flex items-center justify-between">
              <div className="eyebrow" style={{ color: 'var(--c-teal)' }}>Desmos Академи · {lesson.en}</div>
            </div>
            <h1 className="font-display font-extrabold text-[22px] mt-1.5 leading-tight">{lesson.title}</h1>
            {lesson.question && (
              <div className="mt-4 rounded-2xl bg-paper-2/70 border border-line p-4">
                <div className="text-[10.5px] font-bold tracking-[0.14em] text-ink-3 uppercase mb-1.5">SAT бодлого</div>
                <div className="text-[15.5px] leading-relaxed"><Rich text={lesson.question} /></div>
              </div>
            )}
            <div className="mt-4 flex items-center gap-3">
              <Bar value={progress} tone="teal" h={7} />
              <span className="text-[12px] text-ink-3 tnum shrink-0">{Math.max(0, Math.min(step + (complete ? 1 : 0), lesson.steps.length))}/{lesson.steps.length}</span>
            </div>
          </div>

          {/* Suu */}
          <div className="card p-5">
            <div className="flex gap-3.5 items-start">
              <div className={mood === 'think' ? 'anim-tilt' : mood === 'happy' ? 'anim-bounce-cat' : ''}><CatHead size={62} mood={mood} /></div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2"><span className="font-display font-extrabold text-[14px]">Суу</span><span className="text-[11px] text-ink-3">AI багш · демо</span></div>
                <div className="mt-1 text-[14.5px] leading-relaxed" aria-live="polite"><Rich text={say} /></div>
              </div>
            </div>
            {tutorText && (
              <div className="mt-3 rounded-xl bg-sage px-4 py-3 text-[13.5px] anim-rise">
                {tutorText === '…' ? <span className="inline-flex gap-1"><span className="typing-dot">●</span><span className="typing-dot">●</span><span className="typing-dot">●</span></span> : <Rich text={tutorText} />}
              </div>
            )}
            {feedback && (
              <div className={`mt-3 rounded-xl px-4 py-3 text-[13.5px] anim-rise flex gap-2 ${feedback.tone === 'good' ? 'bg-sage text-leaf-2' : feedback.tone === 'bad' ? 'bg-rose-soft text-ink' : 'bg-amber-soft text-ink'}`}>
                {feedback.tone === 'good' && <LuCheck className="shrink-0 mt-0.5" />}
                <Rich text={feedback.text} />
              </div>
            )}

            {/* step-specific controls */}
            {step < 0 && (
              <Button className="mt-4 w-full" size="lg" onClick={() => { setStep(0); setFeedback(null); }} icon={<LuPlay />} id="start-lesson">Эхлэх</Button>
            )}
            {cur?.type === 'read' && <Button className="mt-4 w-full" onClick={() => advance()} id="read-next">{cur.cta || 'Үргэлжлүүлэх'}</Button>}
            {cur?.type === 'answer' && (
              <div className="mt-4">
                <label htmlFor="dans" className="text-[12px] text-ink-3 font-semibold"><Rich text={cur.prompt} /></label>
                <div className="mt-1.5 flex gap-2">
                  <input id="dans" autoFocus value={answer} onChange={(e) => setAnswer(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && submitAnswer()}
                    placeholder={cur.placeholder || 'Хариу'} autoComplete="off"
                    className="flex-1 min-w-0 h-12 rounded-xl border-2 border-line-2 bg-paper px-4 text-[18px] font-[KaTeX_Main,serif] outline-none focus:border-leaf" />
                  <Button size="lg" onClick={submitAnswer} disabled={!answer.trim()} id="check-answer">Шалгах</Button>
                </div>
              </div>
            )}
            {cur?.type === 'choice' && (
              <div className="mt-4">
                <div className="text-[15px] font-semibold"><Rich text={cur.prompt} /></div>
                <div className="mt-3 grid gap-2">
                  {cur.options.map((o, k) => {
                    const picked = choiceState?.picked === k;
                    return (
                      <button key={k} disabled={choiceState?.ok} onClick={() => {
                        const ok = k === cur.answer;
                        setChoiceState({ picked: k, ok });
                        setFeedback({ tone: ok ? 'good' : 'bad', text: cur.explain });
                        setMood(ok ? 'happy' : 'think');
                      }} className={`text-left rounded-xl border-2 px-4 py-3 text-[14px] ${picked ? (choiceState!.ok ? 'border-leaf bg-sage' : 'border-rose bg-rose-soft') : 'border-line hover:border-line-2 bg-paper'}`}>
                        <Rich text={o} />
                      </button>
                    );
                  })}
                </div>
                {choiceState?.ok && <Button className="mt-3 w-full" onClick={() => advance()} id="choice-next">Үргэлжлүүлэх</Button>}
              </div>
            )}

            {step >= 0 && !complete && (
              <div className="mt-4 pt-4 border-t border-line flex flex-wrap gap-1.5">
                <button onClick={explain} className="h-8 px-3 rounded-full border border-line text-[12.5px] font-semibold hover:border-leaf inline-flex items-center gap-1.5"><LuCircleHelp size={14} /> Надад тайлбарла</button>
                <button onClick={showHint} className="h-8 px-3 rounded-full border border-line text-[12.5px] font-semibold hover:border-leaf inline-flex items-center gap-1.5" id="d-hint"><LuLightbulb size={14} /> Сэжүүр өг</button>
                <button onClick={demo} className="h-8 px-3 rounded-full border border-teal/40 bg-teal-soft text-teal text-[12.5px] font-semibold hover:border-teal inline-flex items-center gap-1.5"><LuSparkles size={14} /> Desmos-оор заа</button>
              </div>
            )}
          </div>

          {/* step tracker */}
          <div className="card p-5">
            <div className="text-[11px] font-bold tracking-[0.14em] text-ink-3 uppercase mb-3">Алхмууд</div>
            <ol className="grid gap-2">
              {lesson.steps.map((st, k) => {
                const state = complete || k < step ? 'done' : k === step ? 'cur' : 'todo';
                return (
                  <li key={k} className={`flex items-start gap-3 text-[13px] ${state === 'todo' ? 'text-ink-3' : ''}`}>
                    <span className={`mt-0.5 h-5 w-5 shrink-0 rounded-full grid place-items-center text-[10px] font-bold ${state === 'done' ? 'bg-teal text-white' : state === 'cur' ? 'border-2 border-teal text-teal' : 'border border-line-2'}`}>{state === 'done' ? <LuCheck size={11} strokeWidth={3} /> : k + 1}</span>
                    <span className={state === 'cur' ? 'font-semibold' : ''}>{stepLabel(st)}</span>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>

        {/* RIGHT: calculator */}
        <div className="relative">
          <div className="h-[560px] xl:h-[calc(100vh-150px)] xl:min-h-[560px]">
            <GraphCalc
              initialRows={lesson.initial}
              height="100%"
              apiRef={api}
              onState={onState}
              onPoi={onPoi}
              onView={onView}
              highlight={highlight}
              initialView={{ cx: lesson.id === 'd6' ? 4 : lesson.id === 'd3' ? 2 : 0, cy: lesson.id === 'd6' ? 8 : lesson.id === 'd3' ? 3 : 0, scale: lesson.id === 'd6' ? 22 : 32 }}
              label="Suprep график · Desmos-маягийн"
            />
          </div>
          {step < 0 && (
            <div className="absolute inset-0 rounded-2xl bg-[color-mix(in_srgb,var(--c-paper)_70%,transparent)] backdrop-blur-[1.5px] grid place-items-center">
              <div className="text-center px-6">
                <CatHead size={70} mood="focus" className="mx-auto" />
                <p className="mt-3 text-[14px] text-ink-2 max-w-xs">Зүүн талд "Эхлэх" товч дармагц тооцоолуур идэвхжинэ.</p>
              </div>
            </div>
          )}
          {complete && <Complete lesson={lesson} onRestart={restart} next={nextLesson} />}
        </div>
      </div>
    </div>
  );
}

function stepLabel(st: DStep) {
  switch (st.type) {
    case 'pan': return 'Графикийг чирж хөдөлгөх';
    case 'zoom': return 'Томруулах';
    case 'enter': return `Бичих: ${st.target}`;
    case 'select': return `Сонгох: ${POI_LABEL[st.kind].toLowerCase()}`;
    case 'slider': return `Слайдер: ${st.name} = ?`;
    case 'regression': return 'Регресс асаах';
    case 'answer': return 'Хариугаа оруулах';
    case 'choice': return st.say;
    case 'read': return 'Ажиглах';
  }
}

function Complete({ lesson, onRestart, next }: { lesson: DLesson; onRestart: () => void; next?: DLesson }) {
  const { go, s } = useStore();
  const badge = lesson.badge ? badgeById(lesson.badge) : null;
  return (
    <div className="absolute inset-0 z-20 rounded-2xl bg-[color-mix(in_srgb,var(--c-paper)_88%,transparent)] backdrop-blur-sm grid place-items-center p-4 anim-rise">
      <div className="card shadow-pop p-7 md:p-9 max-w-md w-full text-center relative overflow-hidden">
        <Confetti />
        <div className="relative mx-auto w-[240px] h-[180px]">
          <Blob className="absolute inset-x-0 bottom-0 h-[110px] w-full" color="var(--c-teal)" />
          <Stars className="absolute -top-2 -right-4 w-28" />
          <div className="absolute left-1/2 -translate-x-1/2 bottom-0 anim-bounce-cat"><CatSitting size={112} mood="happy" /></div>
        </div>
        <div className="eyebrow mt-4" style={{ color: 'var(--c-teal)' }}>Сорилт биеллээ</div>
        <h2 className="font-display font-extrabold text-[24px] mt-1">{lesson.title}</h2>
        <p className="mt-2 text-[14px] text-ink-2"><Rich text={lesson.outro} /></p>
        {lesson.manual && <div className="mt-3 rounded-xl bg-paper-2 px-3 py-2 text-[13px]"><span className="text-ink-3 mr-1">Гараар:</span><Rich text={`$${lesson.manual}$`} /></div>}
        <div className="mt-5 flex items-center justify-center gap-3">
          <div className="rounded-2xl bg-forest text-cream px-5 py-2.5">
            <span className="font-display font-extrabold text-[24px] text-lime tnum">+<CountUp value={lesson.xp} /></span><span className="text-[11px] ml-1 text-cream/70">XP</span>
          </div>
          {badge && s.badges[badge.id] && <div className="flex items-center gap-2 text-left"><BadgeEmblem badge={badge} earned size={52} /><span className="text-[12px] font-semibold leading-tight">{badge.mn}</span></div>}
        </div>
        <div className="mt-6 grid gap-2">
          {next ? <Button size="lg" onClick={() => go({ name: 'desmos', id: next.id })} icon={<LuArrowRight />} className="flex-row-reverse" id="next-desmos">Дараагийн: {next.title}</Button> : null}
          <div className="grid grid-cols-2 gap-2">
            <Button variant="secondary" onClick={() => go({ name: 'dashboard' })} id="to-dashboard">Нүүр хуудас</Button>
            <Button variant="ghost" onClick={onRestart} icon={<LuRotateCcw />}>Дахин</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
