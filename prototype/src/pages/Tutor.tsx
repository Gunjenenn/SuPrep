import { useEffect, useRef, useState } from 'react';
import { LuArrowUp, LuCircleHelp, LuLightbulb, LuMessageCircle, LuRefreshCw, LuShuffle, LuSparkles, LuTrash2, LuTriangleAlert } from 'react-icons/lu';
import { CatHead } from '../brand/Cat';
import { qById } from '../data/questions';
import { useStore, TutorCtx } from '../lib/store';
import { MODE_LABEL, SUU_SYSTEM_PROMPT, TutorMode, getTutor } from '../services/tutor';
import GraphCalc from '../components/GraphCalc';
import { toGraphInit } from '../data/questions';
import { Rich } from '../components/Math';
import { Button, Pill } from '../components/ui';

const MODES: { m: TutorMode; icon: JSX.Element }[] = [
  { m: 'explain', icon: <LuCircleHelp size={15} /> },
  { m: 'hint', icon: <LuLightbulb size={15} /> },
  { m: 'desmos', icon: <LuSparkles size={15} /> },
  { m: 'mistake', icon: <LuTriangleAlert size={15} /> },
  { m: 'similar', icon: <LuShuffle size={15} /> },
];

const SUGGEST = ['"at least" ба "at most"-ийн ялгаа юу вэ?', 'Огтлолцлыг Desmos-оор яаж олох вэ?', 'Язгуур гэж юу вэ?', 'Энэ бодлогод гацлаа'];

export default function Tutor() {
  const { s, addChat, clearChat, setCtx, go } = useStore();
  const tutor = getTutor();
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [similar, setSimilar] = useState<string | null>(null);
  const end = useRef<HTMLDivElement>(null);
  const ctx = s.ctx;
  const q = ctx.qid ? qById(ctx.qid) : null;

  useEffect(() => {
    if (!s.chat.length) {
      addChat({ role: 'suu', at: Date.now(), text: q
        ? `Мяу! **${q.skill}** бодлого дээр хамтдаа ажиллая. Хариуг шууд хэлэхгүй — харин чамайг өөрөө олоход нь туслана. Юунаас эхлэх вэ?`
        : `Сайн уу, ${s.profile.name}! Би Суу — чиний SAT Math-ийн багш. Асуулт асуу, эсвэл доорх товчнуудаас сонго. Би **${ctx.title}** сэдвийн хүрээнд байна.` });
    }
  }, []); // eslint-disable-line
  useEffect(() => { end.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }); }, [s.chat.length, busy]);

  const send = async (mode: TutorMode, message?: string) => {
    if (busy) return;
    addChat({ role: 'user', at: Date.now(), text: message || MODE_LABEL[mode], mode });
    setText('');
    setBusy(true);
    try {
      const r = await tutor.reply({ mode, message, ctx, history: s.chat });
      const extra = r.similarQid ? `\n\n**Төстэй бодлого:** ${qById(r.similarQid).prompt}` : '';
      addChat({ role: 'suu', at: Date.now(), text: r.text + extra, graph: r.graph });
      if (r.similarQid) setSimilar(r.similarQid);
    } catch {
      addChat({ role: 'suu', at: Date.now(), text: 'Холболт тасарлаа. Дахин оролдоорой.' });
    } finally { setBusy(false); }
  };

  const contexts: TutorCtx[] = [
    { kind: 'general', title: 'Ерөнхий' },
    { kind: 'desmos', title: 'Огтлолцол олох', skill: 'Intersections' },
    { kind: 'desmos', title: 'Язгуур олох', skill: 'Roots' },
    { kind: 'lesson', title: 'Математикийн хэл', skill: 'Mathematical English' },
    ...s.mistakes.filter((m) => !m.resolved).slice(0, 3).map((m) => ({ kind: 'mistake' as const, title: qById(m.qid).skill, qid: m.qid, chosen: m.chosen })),
  ];

  return (
    <div className="gutter py-6 md:py-8 max-w-[1240px] mx-auto grid lg:grid-cols-[1fr_320px] gap-5">
      <section className="card flex flex-col min-h-[calc(100vh-150px)] overflow-hidden">
        <header className="px-5 py-4 border-b border-line flex items-center gap-3">
          <CatHead size={44} mood={busy ? 'think' : 'idle'} />
          <div className="min-w-0">
            <div className="font-display font-extrabold">AI багш Суу</div>
            <div className="text-[12px] text-ink-3 flex items-center gap-1.5"><span className={`h-2 w-2 rounded-full ${tutor.live ? 'bg-leaf' : 'bg-amber'}`} />{tutor.label}</div>
          </div>
          <button onClick={clearChat} className="ml-auto h-9 px-3 rounded-lg text-[12.5px] text-ink-3 hover:text-ink hover:bg-paper-2 inline-flex items-center gap-1.5" aria-label="Яриаг цэвэрлэх"><LuTrash2 size={14} /> Цэвэрлэх</button>
        </header>

        {/* context */}
        <div className="px-5 py-3 border-b border-line bg-paper-2/50 flex items-start gap-3">
          <Pill tone={ctx.kind === 'desmos' ? 'teal' : ctx.kind === 'mistake' ? 'rose' : 'leaf'}>Сэдэв</Pill>
          <div className="min-w-0 text-[13.5px]">
            <div className="font-semibold">{ctx.title}</div>
            {q && <div className="text-ink-2 mt-0.5 line-clamp-2"><Rich text={q.prompt} /></div>}
            {!q && ctx.problem && <div className="text-ink-2 mt-0.5"><Rich text={ctx.problem} /></div>}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto scroll-thin px-5 py-5 grid content-start gap-4" aria-live="polite">
          {s.chat.map((m, k) => (
            <div key={k} className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : ''} anim-rise`}>
              {m.role === 'suu' && <CatHead size={34} className="shrink-0 mt-1" />}
              <div className={`max-w-[85%] min-w-0 rounded-2xl px-4 py-3 text-[14.5px] leading-relaxed ${m.role === 'user' ? 'bg-forest text-cream rounded-br-md' : 'bg-paper-2 rounded-bl-md'}`}>
                <Rich text={m.text} />
                {m.graph && (
                  <div className="mt-3 h-[300px] rounded-xl overflow-hidden">
                    <GraphCalc initialRows={toGraphInit(m.graph)} height="100%" label="Суугийн үзүүлэн" listWidth={220} />
                  </div>
                )}
              </div>
            </div>
          ))}
          {busy && (
            <div className="flex gap-3"><CatHead size={34} mood="think" /><div className="rounded-2xl bg-paper-2 px-4 py-3 text-ink-3 inline-flex gap-1"><span className="typing-dot">●</span><span className="typing-dot">●</span><span className="typing-dot">●</span></div></div>
          )}
          {similar && !busy && (
            <div className="flex justify-start pl-11">
              <Button size="sm" variant="soft" onClick={() => go({ name: 'practice', ids: [similar], title: 'Төстэй бодлого' })}>Төстэй бодлогыг бодох →</Button>
            </div>
          )}
          <div ref={end} />
        </div>

        <div className="border-t border-line p-4 grid gap-3">
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
            {MODES.map(({ m, icon }) => (
              <button key={m} disabled={busy} onClick={() => send(m)} id={`mode-${m}`}
                className={`shrink-0 h-9 px-3.5 rounded-full border text-[13px] font-semibold inline-flex items-center gap-1.5 ${m === 'desmos' ? 'border-teal/40 bg-teal-soft text-teal' : 'border-line bg-paper hover:border-leaf'}`}>
                {icon}{MODE_LABEL[m]}
              </button>
            ))}
          </div>
          {s.chat.length <= 1 && (
            <div className="flex flex-wrap gap-1.5">
              {SUGGEST.map((p) => <button key={p} onClick={() => send('free', p)} className="text-[12.5px] px-3 py-1.5 rounded-lg bg-paper-2 hover:bg-sage text-ink-2">{p}</button>)}
            </div>
          )}
          <form onSubmit={(e) => { e.preventDefault(); text.trim() && send('free', text.trim()); }} className="flex gap-2">
            <input id="tutor-input" value={text} onChange={(e) => setText(e.target.value)} placeholder="Суугаас асуух… (монголоор эсвэл англиар)" autoComplete="off"
              className="flex-1 min-w-0 h-12 rounded-xl border border-line-2 bg-paper px-4 text-[14.5px] outline-none focus:border-leaf" />
            <Button type="submit" size="lg" disabled={!text.trim() || busy} aria-label="Илгээх" className="!px-4"><LuArrowUp size={18} /></Button>
          </form>
        </div>
      </section>

      <aside className="grid gap-4 content-start">
        <div className="card p-5">
          <div className="eyebrow">Сэдэв сонгох</div>
          <div className="mt-3 grid gap-1.5">
            {contexts.map((c, k) => {
              const on = c.title === ctx.title && c.qid === ctx.qid;
              return (
                <button key={k} onClick={() => { setCtx(c); clearChat(); setSimilar(null); setTimeout(() => addChat({ role: 'suu', at: Date.now(), text: `Сэдвээ **${c.title}** болгож солилоо. Асуух зүйлээ бичээрэй.` }), 10); }}
                  className={`text-left rounded-xl px-3 py-2.5 text-[13px] border ${on ? 'border-leaf bg-sage/60 font-semibold' : 'border-transparent hover:bg-paper-2'}`}>
                  <span className="text-[10.5px] uppercase tracking-wider text-ink-3 block">{c.kind === 'mistake' ? 'Алдаа' : c.kind === 'desmos' ? 'Desmos' : c.kind === 'lesson' ? 'Хичээл' : 'Ерөнхий'}</span>
                  {c.title}
                </button>
              );
            })}
          </div>
        </div>
        <div className="card p-5">
          <div className="eyebrow">Суу хэрхэн заадаг вэ</div>
          <ol className="mt-3 grid gap-2 text-[13px] text-ink-2 list-decimal pl-4">
            <li>Чи юуг ойлгосныг тодруулна</li>
            <li>Буруу ойлголтыг нэрлэнэ</li>
            <li>Дутуу санааг тайлбарлана</li>
            <li>Нэг сэжүүр өгнө</li>
            <li>Тохиромжтой бол Desmos-оор үзүүлнэ</li>
            <li>Дараагийн алхмыг чамаар хийлгэнэ</li>
          </ol>
          <details className="mt-4 text-[12px] text-ink-3">
            <summary className="cursor-pointer font-semibold">Gemini холболтын тухай</summary>
            <p className="mt-2 leading-relaxed">Энэ прототипт Суу урьдчилан бэлдсэн, сэдэвт тохирсон хариулт өгнө. Бодит хувилбарт хариулт нь backend proxy-оор дамжин Gemini загвараас ирнэ (API түлхүүр хөтөч дээр хадгалагдахгүй). Системийн заавар:</p>
            <pre className="mt-2 whitespace-pre-wrap bg-paper-2 rounded-lg p-2 text-[11px] max-h-40 overflow-y-auto">{SUU_SYSTEM_PROMPT}</pre>
          </details>
        </div>
      </aside>
    </div>
  );
}
