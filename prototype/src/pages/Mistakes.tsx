import { useState } from 'react';
import { LuCheck, LuMessageCircle, LuRotateCcw, LuSpline } from 'react-icons/lu';
import { CatHead } from '../brand/Cat';
import { DOMAINS, checkAnswer, qById } from '../data/questions';
import { Mistake, REVIEW_GAPS, mnDate, useStore } from '../lib/store';
import { Rich } from '../components/Math';
import { Button, Empty, PageHeader, Pill } from '../components/ui';

const DAY = 864e5;
const whenLabel = (due: number) => {
  const d = Math.ceil((due - Date.now()) / DAY);
  return d <= 0 ? 'Өнөөдөр' : d === 1 ? 'Маргааш' : `${d} хоногийн дараа`;
};

export default function Mistakes() {
  const { s } = useStore();
  const [tab, setTab] = useState<'due' | 'later' | 'done'>('due');
  const open = s.mistakes.filter((m) => !m.resolved);
  const due = open.filter((m) => (m.due ?? 0) <= Date.now());
  const later = open.filter((m) => (m.due ?? 0) > Date.now()).sort((a, b) => (a.due ?? 0) - (b.due ?? 0));
  const week = open.filter((m) => (m.due ?? 0) <= Date.now() + 7 * DAY).length;
  const done = s.mistakes.filter((m) => m.resolved);
  const list = tab === 'due' ? due : tab === 'later' ? later : done;
  const boxes = [0, 1, 2].map((b) => open.filter((m) => (m.box ?? 0) === b).length);

  return (
    <div className="gutter py-6 md:py-8 max-w-[1080px] mx-auto">
      <PageHeader eyebrow="Дасгал · Алдааны дэвтэр" title="Алдаа бол хамгийн сайн багш"
        sub="Буруу бодсон асуулт 1, 3, 7 хоногийн дараа дахин ирнэ. Гурван удаа зөв бодвол дэвтрээс гарч, эзэмшсэнд тооцогдоно." />

      <div className="grid grid-cols-3 gap-3 md:gap-4">
        {[
          { n: due.length, l: 'Өнөөдөр давтах', tone: 'var(--c-leaf)', fg: '#fff' },
          { n: week, l: 'Энэ долоо хоногт', tone: 'var(--c-paper)', fg: 'var(--c-ink)' },
          { n: done.length, l: 'Сурч дуусгасан', tone: 'var(--c-forest-2)', fg: 'var(--c-on-forest)' },
        ].map((t) => (
          <div key={t.l} className="coin rounded-3xl p-4 md:p-5 border-[1.5px] border-line" style={{ ['--face' as any]: t.tone, ['--edge' as any]: 'var(--c-edge)', color: t.fg }}>
            <div className="font-display font-extrabold text-[30px] md:text-[40px] leading-none tnum">{t.n}</div>
            <div className="mt-2 text-[12px] md:text-[13px] font-semibold opacity-85">{t.l}</div>
          </div>
        ))}
      </div>

      {/* spaced-repetition ladder */}
      <section className="card mt-6 p-5 md:p-6">
        <div className="eyebrow">Давталтын шат</div>
        <div className="mt-4 grid grid-cols-4 gap-2 items-end" aria-label="Давталтын шат">
          {[...REVIEW_GAPS.map((g, i) => ({ l: `${i + 1}-р давталт`, sub: `${g} хоногийн дараа`, n: boxes[i], h: 54 + i * 26 })), { l: 'Эзэмшсэн', sub: 'дэвтрээс гарсан', n: done.length, h: 54 + 3 * 26 }].map((st, i) => (
            <div key={st.l} className="flex flex-col items-center gap-2">
              <span className="font-display font-bold text-[20px] tnum">{st.n}</span>
              <div className="w-full rounded-t-2xl rounded-b-md grid place-items-center text-[11px] font-bold"
                style={{ height: st.h, background: i === 3 ? 'var(--c-forest-2)' : `color-mix(in srgb, var(--c-leaf) ${35 + i * 22}%, var(--c-paper))`, color: i >= 2 ? '#fff' : 'var(--c-ink)', boxShadow: '0 5px 0 var(--c-edge)' }}>
                {i === 3 ? <LuCheck size={18} strokeWidth={3} /> : `+${REVIEW_GAPS[i]}д`}
              </div>
              <div className="text-center">
                <div className="text-[12px] font-semibold leading-tight">{st.l}</div>
                <div className="text-[11px] text-ink-3">{st.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="inline-flex rounded-2xl bg-paper-2 p-1 my-6 border border-line">
        {([['due', `Өнөөдөр (${due.length})`], ['later', `Дараа (${later.length})`], ['done', `Эзэмшсэн (${done.length})`]] as const).map(([t, l]) => (
          <button key={t} onClick={() => setTab(t)} className={`h-10 px-4 rounded-xl text-[13px] font-bold ${tab === t ? 'bg-paper shadow-card text-ink' : 'text-ink-3'}`}>{l}</button>
        ))}
      </div>
      {list.length === 0 ? (
        <Empty title={tab === 'due' ? 'Өнөөдрийн давталт дууслаа' : tab === 'later' ? 'Хүлээгдэж буй давталт алга' : 'Одоохондоо эзэмшсэн алдаа алга'}
          sub={tab === 'due' ? 'Мяу! Маргааш дахиад шалгая. Хүсвэл "Дараа" табаас эрт давтаж болно.' : 'Алдаагаа гурван удаа зөв бодох бүрт энд нэмэгдэнэ.'} />
      ) : (
        <div className="grid gap-4">{list.map((m) => <MistakeCard key={m.id} m={m} early={tab === 'later'} />)}</div>
      )}
    </div>
  );
}

function MistakeCard({ m, early }: { m: Mistake; early: boolean }) {
  const { go, reviewMistake, setCtx } = useStore();
  const q = qById(m.qid);
  const [open, setOpen] = useState(false);
  const [review, setReview] = useState(false);
  const [pick, setPick] = useState('');
  const [res, setRes] = useState<boolean | null>(null);
  const chosenText = q.choices ? q.choices[Number(m.chosen)] : m.chosen;
  const why = q.why?.[Number(m.chosen)];
  const box = m.box ?? 0;
  const check = () => {
    const ok = checkAnswer(q, q.choices ? Number(pick) : pick);
    setRes(ok);
    if (ok) setTimeout(() => reviewMistake(m.id), 900);
  };
  return (
    <article className="card p-5 md:p-6">
      <div className="flex items-center gap-2 flex-wrap">
        <Pill>{DOMAINS[q.domain].en}</Pill>
        <span className="text-[12.5px] font-semibold">{q.skill}</span>
        <span className="ml-auto flex items-center gap-2">
          {!m.resolved && (
            <span className="flex gap-1" aria-label={`${box}/3 давталт`}>
              {[0, 1, 2].map((k) => <span key={k} className={`h-2.5 w-6 rounded-full ${k < box ? 'bg-leaf' : 'bg-line-2'}`} />)}
            </span>
          )}
          {m.resolved ? <Pill tone="leaf"><LuCheck size={11} /> Эзэмшсэн</Pill>
            : <Pill tone={(m.due ?? 0) <= Date.now() ? 'leaf' : 'neutral'}>{box + 1}-р давталт · {whenLabel(m.due ?? 0)}</Pill>}
        </span>
      </div>
      <div className="mt-3 text-[15.5px] leading-relaxed"><Rich text={q.prompt} /></div>
      <div className="mt-1 text-[11.5px] text-ink-3">{mnDate(m.at)} · {m.source}</div>
      <div className="mt-3 flex flex-wrap gap-2 text-[13px]">
        <span className="rounded-xl bg-rose-soft px-3 py-1.5">Миний хариу: <b><Rich text={chosenText || '—'} /></b></span>
        {(open || m.resolved) && <span className="rounded-xl bg-sage px-3 py-1.5">Зөв: <b><Rich text={typeof q.answer === 'number' ? q.choices![q.answer] : q.answer[0]} /></b></span>}
      </div>
      {open && (
        <div className="mt-4 flex gap-3 rounded-2xl bg-paper-2 p-4 anim-rise">
          <CatHead size={42} mood="think" className="shrink-0" />
          <div className="text-[14px] grid gap-1.5">
            {why && <p><b>Алдааны шалтгаан:</b> <Rich text={why} /></p>}
            <p><Rich text={q.explain} /></p>
            {q.desmos && <p className="text-teal"><LuSpline className="inline mr-1" /><Rich text={q.desmos.tip} /></p>}
          </div>
        </div>
      )}
      {review && !m.resolved && (
        <div className="mt-4 rounded-2xl border-2 border-dashed border-line-2 p-4 anim-rise">
          <div className="eyebrow">Дахин бод · {box + 1}/3</div>
          {q.choices ? (
            <div className="mt-3 grid sm:grid-cols-2 gap-2">
              {q.choices.map((c, k) => (
                <button key={k} disabled={res === true} onClick={() => { setPick(String(k)); setRes(null); }}
                  className={`rounded-xl border-2 px-3 py-2.5 text-left text-[14px] ${pick === String(k) ? (res === null ? 'border-ink' : res ? 'border-leaf bg-sage' : 'border-rose bg-rose-soft') : 'border-line bg-paper'}`}><Rich text={c} /></button>
              ))}
            </div>
          ) : (
            <input id={`rev-${m.id}`} value={pick} onChange={(e) => { setPick(e.target.value); setRes(null); }} onKeyDown={(e) => e.key === 'Enter' && check()} placeholder="Хариу"
              className="mt-3 h-12 w-44 rounded-xl border-2 border-line-2 bg-paper px-3 font-mono text-[18px] outline-none focus:border-leaf" />
          )}
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <Button size="sm" onClick={check} disabled={!pick || res === true}>Шалгах</Button>
            {res === true && <span className="text-[13px] text-leaf-2 font-semibold">{box + 1 >= 3 ? 'Эзэмшлээ! Дэвтрээс гарлаа · +30 XP' : `Зөв! Дараагийн давталт ${REVIEW_GAPS[box + 1]} хоногийн дараа · +15 XP`}</span>}
            {res === false && <span className="text-[13px] text-rose">Дахин оролдоорой — {q.hint}</span>}
          </div>
        </div>
      )}
      <div className="mt-4 flex flex-wrap gap-2">
        {!m.resolved && <Button size="sm" variant={early ? 'secondary' : 'primary'} onClick={() => setReview(true)} icon={<LuRotateCcw size={14} />} id={`retry-${m.id}`}>{early ? 'Эрт давтах' : 'Давтах'}</Button>}
        <Button size="sm" variant="secondary" onClick={() => setOpen((o) => !o)}>{open ? 'Тайлбарыг хаах' : 'Тайлбар'}</Button>
        <Button size="sm" variant="ghost" onClick={() => { setCtx({ kind: 'mistake', title: q.skill, qid: q.id, chosen: m.chosen }); go({ name: 'tutor' }); }} icon={<LuMessageCircle size={14} />}>Суугаас асуух</Button>
      </div>
    </article>
  );
}
