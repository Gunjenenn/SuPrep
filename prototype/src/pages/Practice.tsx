import { useEffect, useMemo, useState } from 'react';
import { LuArrowLeft, LuArrowRight, LuBookmark, LuBookmarkCheck, LuCheck, LuClock, LuLightbulb, LuMessageCircle, LuSpline, LuX } from 'react-icons/lu';
import { CatHead } from '../brand/Cat';
import { DOMAINS, Question, checkAnswer, qById, toGraphInit } from '../data/questions';
import { useStore } from '../lib/store';
import GraphCalc from '../components/GraphCalc';
import { Rich } from '../components/Math';
import { Button, CountUp, Pill } from '../components/ui';
import { Dots } from './Bank';

export const mmss = (sec: number) => `${Math.floor(sec / 60)}:${String(Math.max(0, sec) % 60).padStart(2, '0')}`;

export default function Practice({ ids, timed, title, nodeId }: { ids: string[]; timed?: number; title: string; nodeId?: string }) {
  const { s, go, recordAnswer, award, completeNode, toggleSave, setCtx, giveBadge } = useStore();
  const qs = useMemo(() => ids.map(qById).filter(Boolean) as Question[], [ids]);
  const [i, setI] = useState(0);
  const [given, setGiven] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [left, setLeft] = useState(timed ?? 0);
  const [elapsed, setElapsed] = useState(0);
  const [done, setDone] = useState(false);
  const [calc, setCalc] = useState(false);
  const [calcKey, setCalcKey] = useState(0);
  const [calcRows, setCalcRows] = useState<any[]>(['']);
  const [hint, setHint] = useState(false);
  const q = qs[i];

  useEffect(() => {
    if (done) return;
    const t = setInterval(() => { setElapsed((e) => e + 1); if (timed) setLeft((l) => l - 1); }, 1000);
    return () => clearInterval(t);
  }, [done, timed]);
  useEffect(() => { if (timed && left <= 0 && !done) finish(); }, [left]); // eslint-disable-line
  useEffect(() => { setHint(false); if (q) setCtx({ kind: 'question', title: q.skill, qid: q.id, chosen: given[q.id] }); }, [i]); // eslint-disable-line

  const submit = () => {
    if (!q || given[q.id] === undefined || given[q.id] === '') return;
    if (timed) { if (i + 1 < qs.length) setI(i + 1); return; }
    const val = q.choices ? Number(given[q.id]) : given[q.id];
    const ok = checkAnswer(q, val);
    setChecked((c) => ({ ...c, [q.id]: ok }));
    recordAnswer(q.id, ok, given[q.id], title);
    setCtx({ kind: 'question', title: q.skill, qid: q.id, chosen: given[q.id] });
  };

  const finish = () => {
    // grade unanswered in timed mode
    let correct = 0;
    qs.forEach((x) => {
      if (checked[x.id] !== undefined) { if (checked[x.id]) correct++; return; }
      if (given[x.id] !== undefined && given[x.id] !== '') {
        const ok = checkAnswer(x, x.choices ? Number(given[x.id]) : given[x.id]);
        recordAnswer(x.id, ok, given[x.id], title);
        if (ok) correct++;
        setChecked((c) => ({ ...c, [x.id]: ok }));
      }
    });
    setDone(true);
    const xp = correct * 5 + (nodeId && !s.done[nodeId] ? 40 : 0) + (timed ? 20 : 0);
    if (xp) award(xp, timed ? `Цагтай сорилт · ${correct}/${qs.length}` : `Дасгал · ${correct}/${qs.length}`);
    if (nodeId) completeNode(nodeId, correct);
    if (timed) setTimeout(() => giveBadge('sat-strategist'), 800);
  };

  if (!q) return null;
  if (done) return <Summary qs={qs} checked={checked} given={given} elapsed={elapsed} title={title} />;

  const isChecked = checked[q.id] !== undefined && !timed;
  const ok = checked[q.id];
  const answeredCount = qs.filter((x) => given[x.id] !== undefined && given[x.id] !== '').length;

  return (
    <div className="gutter py-5 max-w-[1320px] mx-auto">
      <div className="flex flex-wrap items-center gap-3">
        <button onClick={() => go({ name: 'bank' })} className="h-9 px-2.5 inline-flex items-center gap-1.5 rounded-xl hover:bg-paper-2 text-ink-2 text-[13px] font-semibold"><LuX /> Гарах</button>
        <div className="font-display font-extrabold text-[15px] truncate">{title}</div>
        <div className="ml-auto flex items-center gap-2">
          {timed ? (
            <div className={`h-9 px-3.5 rounded-xl inline-flex items-center gap-2 font-bold tnum text-[14px] ${left < 60 ? 'bg-rose-soft text-rose' : 'bg-forest text-cream'}`} aria-live="off"><LuClock size={15} /> {mmss(left)}</div>
          ) : (
            <div className="h-9 px-3 rounded-xl inline-flex items-center gap-2 text-ink-3 tnum text-[13px] border border-line"><LuClock size={14} /> {mmss(elapsed)}</div>
          )}
          <Button size="sm" variant={calc ? 'dark' : 'secondary'} onClick={() => setCalc((c) => !c)} icon={<LuSpline />} id="toggle-calc">Тооцоолуур</Button>
        </div>
      </div>

      {/* navigator */}
      <div className="mt-4 flex flex-wrap gap-1.5" aria-label="Асуултууд">
        {qs.map((x, k) => {
          const c = checked[x.id];
          const a = given[x.id] !== undefined && given[x.id] !== '';
          return (
            <button key={x.id} onClick={() => setI(k)} aria-current={k === i ? 'step' : undefined}
              className={`h-9 min-w-9 px-2 rounded-lg text-[13px] font-bold tnum border-2 relative ${k === i ? 'border-ink' : 'border-transparent'} ${!timed && c !== undefined ? (c ? 'bg-sage text-leaf-2' : 'bg-rose-soft text-rose') : a ? 'bg-forest text-cream' : 'bg-paper-2 text-ink-2'}`}>
              {k + 1}
              {s.saved.includes(x.id) && <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-rose" />}
            </button>
          );
        })}
        <div className="ml-auto text-[12.5px] text-ink-3 self-center">{answeredCount}/{qs.length} хариулсан</div>
      </div>

      <div className={`mt-4 grid gap-5 ${calc ? 'xl:grid-cols-[1fr_1fr]' : ''}`}>
        <div className="card p-6 md:p-8 min-w-0" key={q.id}>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[12px] font-bold text-ink-3">Асуулт {i + 1}</span>
            <Pill>{DOMAINS[q.domain].en}</Pill>
            <span className="inline-flex items-center gap-1 text-[11.5px] text-ink-3"><Dots n={q.difficulty} /></span>
            {q.desmos && <Pill tone="teal"><LuSpline size={11} /> Desmos тохиромжтой</Pill>}
            <button onClick={() => toggleSave(q.id)} className={`ml-auto h-9 px-2.5 inline-flex items-center gap-1.5 rounded-lg text-[12.5px] font-semibold ${s.saved.includes(q.id) ? 'text-rose' : 'text-ink-3 hover:text-ink'}`} id="bookmark">
              {s.saved.includes(q.id) ? <LuBookmarkCheck size={17} /> : <LuBookmark size={17} />} Тэмдэглэх
            </button>
          </div>
          <div className="mt-4 text-[17px] leading-relaxed"><Rich text={q.prompt} /></div>
          {q.mn && <div className="mt-2 font-script text-leaf text-[20px]">{q.mn}</div>}

          {q.choices ? (
            <div className="mt-6 grid gap-2.5">
              {q.choices.map((c, k) => {
                const picked = given[q.id] === String(k);
                const correctOpt = isChecked && k === q.answer;
                const wrongPick = isChecked && picked && !ok;
                return (
                  <button key={k} disabled={isChecked} onClick={() => setGiven((g) => ({ ...g, [q.id]: String(k) }))} id={`choice-${k}`}
                    className={`flex items-center gap-4 rounded-2xl border-2 px-4 py-3 text-left text-[16px] ${correctOpt ? 'border-leaf bg-sage' : wrongPick ? 'border-rose bg-rose-soft' : picked ? 'border-forest bg-paper-2' : 'border-line bg-paper hover:border-line-2'}`}>
                    <span className={`h-8 w-8 rounded-full grid place-items-center text-[13px] font-bold border-2 ${picked ? 'bg-forest text-cream border-forest' : 'border-line-2 text-ink-3'}`}>{'ABCD'[k]}</span>
                    <Rich text={c} />
                    {correctOpt && <LuCheck className="ml-auto text-leaf" />}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="mt-6">
              <label htmlFor="grid-in" className="text-[12px] font-semibold text-ink-3">Хариугаа бич (бутархай бол 3/4 гэх мэт)</label>
              <input id="grid-in" value={given[q.id] || ''} disabled={isChecked} onChange={(e) => setGiven((g) => ({ ...g, [q.id]: e.target.value }))} onKeyDown={(e) => e.key === 'Enter' && submit()} autoComplete="off"
                className={`mt-1.5 block w-48 h-14 rounded-2xl border-2 bg-paper px-5 text-[22px] font-[KaTeX_Main,serif] outline-none ${isChecked ? (ok ? 'border-leaf bg-sage' : 'border-rose bg-rose-soft') : 'border-line-2 focus:border-leaf'}`} />
            </div>
          )}

          {hint && !isChecked && (
            <div className="mt-5 flex gap-3 items-start rounded-2xl bg-sage px-4 py-3 anim-rise">
              <CatHead size={40} mood="think" />
              <div className="text-[14px]"><Rich text={q.hint} /></div>
            </div>
          )}

          {isChecked && (
            <div className={`mt-6 rounded-2xl p-5 anim-rise ${ok ? 'bg-sage' : 'bg-rose-soft'}`}>
              <div className="flex items-center gap-3">
                <CatHead size={46} mood={ok ? 'happy' : 'think'} />
                <div className={`font-display font-extrabold ${ok ? 'text-leaf-2' : 'text-rose'}`}>{ok ? 'Зөв! +5 XP' : 'Алдаа — Алдааны дэвтэрт хадгаллаа'}</div>
              </div>
              {!ok && q.why && given[q.id] !== undefined && q.why[Number(given[q.id])] && (
                <p className="mt-3 text-[14px]"><b>Яагаад?</b> <Rich text={q.why[Number(given[q.id])]} /></p>
              )}
              <p className="mt-2 text-[14px] text-ink-2"><Rich text={q.explain} /></p>
              {q.desmos && (
                <div className="mt-3 rounded-xl bg-paper/70 px-4 py-3 text-[13.5px] flex gap-2 items-start">
                  <LuSpline className="text-teal shrink-0 mt-0.5" />
                  <div><b className="text-teal">Desmos арга:</b> <Rich text={q.desmos.tip} />
                    <button className="block mt-1.5 text-[12.5px] font-semibold text-teal underline" onClick={() => { setCalcRows(toGraphInit(q.desmos!.rows)); setCalcKey((k) => k + 1); setCalc(true); }}>Тооцоолуурт харуулах →</button>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="mt-7 flex flex-wrap items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setI(Math.max(0, i - 1))} disabled={i === 0} icon={<LuArrowLeft />}>Өмнөх</Button>
            {!isChecked && !timed && <Button variant="ghost" size="sm" onClick={() => setHint(true)} icon={<LuLightbulb />} id="q-hint">Сэжүүр</Button>}
            <Button variant="ghost" size="sm" onClick={() => { setCtx({ kind: 'question', title: q.skill, qid: q.id, chosen: given[q.id] }); go({ name: 'tutor' }); }} icon={<LuMessageCircle />}>Суугаас асуух</Button>
            <div className="flex-1" />
            {!isChecked ? (
              timed && i === qs.length - 1 ? (
                <Button onClick={finish} id="finish-timed">Дуусгах</Button>
              ) : (
                <Button onClick={submit} disabled={given[q.id] === undefined || given[q.id] === ''} id="submit-q">{timed ? 'Хадгалаад дараагийн' : 'Шалгах'}</Button>
              )
            ) : i + 1 < qs.length ? (
              <Button onClick={() => setI(i + 1)} icon={<LuArrowRight />} className="flex-row-reverse" id="next-q">Дараагийн</Button>
            ) : (
              <Button onClick={finish} id="finish-practice">Дүн харах</Button>
            )}
          </div>
          {timed && <div className="mt-3 text-right"><button onClick={finish} className="text-[12.5px] text-ink-3 underline">Одоо дуусгах</button></div>}
        </div>

        {calc && (
          <div className="h-[520px] xl:h-auto xl:min-h-[560px] anim-rise">
            <GraphCalc key={calcKey} initialRows={calcRows} height="100%" label="Тооцоолуур" />
          </div>
        )}
      </div>
    </div>
  );
}

function Summary({ qs, checked, given, elapsed, title }: { qs: Question[]; checked: Record<string, boolean>; given: Record<string, string>; elapsed: number; title: string }) {
  const { go } = useStore();
  const correct = qs.filter((q) => checked[q.id]).length;
  const pct = correct / qs.length;
  return (
    <div className="gutter py-8 max-w-[860px] mx-auto">
      <div className="card p-7 md:p-9 anim-rise">
        <div className="flex flex-wrap items-center gap-6">
          <CatHead size={84} mood={pct >= 0.8 ? 'happy' : pct >= 0.5 ? 'idle' : 'think'} />
          <div className="flex-1 min-w-[200px]">
            <div className="eyebrow">{title} · дүн</div>
            <h1 className="font-display font-extrabold text-[30px] mt-1"><CountUp value={correct} />/{qs.length} зөв</h1>
            <p className="text-ink-2 text-[14px] mt-1">{pct >= 0.8 ? 'Гайхалтай нарийвчлал!' : pct >= 0.5 ? 'Сайн байна. Алдсан бодлогуудаа давтаарай.' : 'Санаа зовох хэрэггүй — алдаа бол хамгийн сайн багш. Хамтдаа давтъя.'} · {mmss(elapsed)}</p>
          </div>
        </div>
        <div className="mt-6 grid gap-2">
          {qs.map((q, k) => (
            <div key={q.id} className="flex items-center gap-3 rounded-xl border border-line px-4 py-3">
              <span className={`h-7 w-7 rounded-full grid place-items-center text-[12px] font-bold ${checked[q.id] ? 'bg-leaf text-white' : checked[q.id] === false ? 'bg-rose text-white' : 'bg-paper-2 text-ink-3'}`}>{checked[q.id] ? <LuCheck size={14} /> : k + 1}</span>
              <span className="text-[13.5px] flex-1 min-w-0 truncate">{q.skill}</span>
              <span className="text-[12px] text-ink-3">{checked[q.id] === undefined ? 'Хариулаагүй' : checked[q.id] ? 'Зөв' : 'Алдаа → дэвтэрт'}</span>
            </div>
          ))}
        </div>
        <div className="mt-7 flex flex-wrap gap-3">
          <Button onClick={() => go({ name: 'mistakes' })}>Алдаагаа давтах</Button>
          <Button variant="secondary" onClick={() => go({ name: 'bank' })}>Асуултын сан</Button>
          <Button variant="ghost" onClick={() => go({ name: 'dashboard' })}>Нүүр</Button>
        </div>
      </div>
    </div>
  );
}
