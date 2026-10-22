import { LuSpline, LuTriangleAlert } from 'react-icons/lu';
import { LEVELS, STAGES, levelFor } from '../data/curriculum';
import { DESMOS } from '../data/desmos';
import { BADGES } from '../data/meta';
import { DOMAINS, Domain, qById } from '../data/questions';
import { dayKey, desmosNodeId, useStore } from '../lib/store';
import BadgeEmblem from '../components/Badge';
import { Bar, CountUp, PageHeader, Pill, Ring, SectionTitle } from '../components/ui';

const WD = ['Ня', 'Да', 'Мя', 'Лх', 'Пү', 'Ба', 'Бя'];

export default function Progress() {
  const { s, go } = useStore();
  const lv = levelFor(s.xp);
  const days = Array.from({ length: 7 }).map((_, k) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - k));
    const key = dayKey(d);
    return { key, label: WD[d.getDay()], xp: s.xpLog.filter((l) => l.day === key).reduce((a, b) => a + b.amount, 0), today: k === 6 };
  });
  const week = days.reduce((a, d) => a + d.xp, 0);
  const max = Math.max(100, ...days.map((d) => d.xp));
  const top = Math.ceil(max / 50) * 50;
  const doneCount = Object.keys(s.done).length;
  const answered = Object.values(s.answered);
  const acc = answered.length ? answered.filter((a) => a.ok).length / answered.length : 0;
  const domains = (Object.keys(DOMAINS) as Domain[]).map((d) => ({ d, v: s.skill[d] ?? 0 }));
  const weak = [...domains].sort((a, b) => a.v - b.v).slice(0, 2);
  const mistakeSkills = Object.entries(
    s.mistakes.filter((m) => !m.resolved).reduce<Record<string, number>>((acc, m) => { const k = qById(m.qid).skill; acc[k] = (acc[k] || 0) + 1; return acc; }, {})
  );
  const desmosSkills = DESMOS.map((d) => ({ d, done: !!s.done[desmosNodeId(d.id)] }));
  const desmosPct = desmosSkills.filter((x) => x.done).length / DESMOS.length;

  const W = 560, H = 200, pad = { l: 34, r: 10, t: 14, b: 28 };
  const bw = (W - pad.l - pad.r) / 7;

  return (
    <div className="gutter py-6 md:py-8 max-w-[1240px] mx-auto">
      <PageHeader eyebrow="Миний ахиц" title="Ахиц ба эзэмшил" sub="Түвшин нь хичээл зүтгэлийг, эзэмшил нь мэдлэгийг хэмждэг. Хоёуланг нь тусад нь харцгаая." />

      <div className="grid lg:grid-cols-[360px_1fr] gap-5">
        <section className="card p-6">
          <div className="flex items-center gap-5">
            <Ring value={lv.pct} size={96} stroke={9}><div className="text-center"><div className="font-display font-extrabold text-[30px] leading-none">{lv.n}</div><div className="text-[10px] text-ink-3 uppercase tracking-wider">түвшин</div></div></Ring>
            <div>
              <div className="font-display font-extrabold text-[18px]">{lv.mn}</div>
              <div className="text-[12.5px] text-ink-3">{lv.en}</div>
              <div className="mt-2 font-thin text-[30px] leading-none tnum text-leaf"><CountUp value={s.xp} /> <span className="font-sans text-[12px] font-bold text-ink-3">XP</span></div>
            </div>
          </div>
          <ol className="mt-6 grid gap-1.5">
            {LEVELS.map((l) => (
              <li key={l.n} className={`flex items-center gap-3 rounded-lg px-2.5 py-1.5 text-[13px] ${l.n === lv.n ? 'bg-sage font-semibold' : l.n < lv.n ? 'text-ink-2' : 'text-ink-3'}`}>
                <span className={`h-6 w-6 rounded-full grid place-items-center text-[11px] font-bold ${l.n <= lv.n ? 'bg-forest text-lime' : 'border border-line-2'}`}>{l.n}</span>
                <span className="flex-1">{l.mn} <span className="text-ink-3 font-normal">· {l.en}</span></span>
                <span className="tnum text-[11.5px] text-ink-3">{l.xp}</span>
              </li>
            ))}
          </ol>
        </section>

        <section className="card p-6 min-w-0">
          <SectionTitle eyebrow="Сүүлийн 7 хоног" title={<>XP · <span className="tnum">{week}</span></>} right={<div className="flex gap-2"><Pill tone="rose">{s.streak.count} өдөр дараалсан</Pill><Pill>{doneCount} алхам дууссан</Pill></div>} />
          <div className="mt-4 overflow-x-auto">
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full min-w-[420px] h-auto" role="img" aria-label="Өдөр бүрийн XP">
              {[0, top / 2, top].map((v) => {
                const y = pad.t + (H - pad.t - pad.b) * (1 - v / top);
                return (
                  <g key={v}>
                    <line x1={pad.l} x2={W - pad.r} y1={y} y2={y} stroke="var(--c-line)" strokeDasharray={v ? '3 4' : undefined} />
                    <text x={pad.l - 6} y={y + 4} textAnchor="end" fontSize={11} fill="var(--c-ink-3)" className="tnum">{v}</text>
                  </g>
                );
              })}
              {days.map((d, k) => {
                const h = ((H - pad.t - pad.b) * d.xp) / top;
                const x = pad.l + k * bw + bw * 0.2;
                const y = H - pad.b - h;
                return (
                  <g key={d.key}>
                    <rect x={x} y={y} width={bw * 0.6} height={Math.max(h, d.xp ? 2 : 0)} rx={6} fill={d.today ? 'var(--c-leaf)' : 'var(--c-moss)'} opacity={d.today ? 1 : 0.75} />
                    {d.xp > 0 && <text x={x + bw * 0.3} y={y - 5} textAnchor="middle" fontSize={11} fontWeight={700} fill="var(--c-ink-2)" className="tnum">{d.xp}</text>}
                    <text x={x + bw * 0.3} y={H - 9} textAnchor="middle" fontSize={11} fill={d.today ? 'var(--c-ink)' : 'var(--c-ink-3)'} fontWeight={d.today ? 700 : 400}>{d.today ? 'Өнөөдөр' : d.label}</text>
                  </g>
                );
              })}
            </svg>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-3 text-center">
            <div className="rounded-xl bg-paper-2 py-3"><div className="font-display font-extrabold text-xl tnum">{answered.length}</div><div className="text-[11px] text-ink-3">бодсон бодлого</div></div>
            <div className="rounded-xl bg-paper-2 py-3"><div className="font-display font-extrabold text-xl tnum">{Math.round(acc * 100)}%</div><div className="text-[11px] text-ink-3">нарийвчлал</div></div>
            <div className="rounded-xl bg-paper-2 py-3"><div className="font-display font-extrabold text-xl tnum">{s.words.length}</div><div className="text-[11px] text-ink-3">сурсан үг</div></div>
          </div>
        </section>
      </div>

      <div className="mt-5 grid lg:grid-cols-3 gap-5">
        <section className="card p-6">
          <SectionTitle eyebrow="SAT агуулга" title="Ур чадварын эзэмшил" />
          <div className="mt-5 grid gap-4">
            {domains.map(({ d, v }) => (
              <div key={d}>
                <div className="flex justify-between text-[13px]"><span className="font-semibold">{DOMAINS[d].en}</span><span className="tnum text-ink-3">{v}%</span></div>
                <div className="text-[11.5px] text-ink-3 mb-1.5">{DOMAINS[d].mn}</div>
                <Bar value={v / 100} tone={v < 35 ? 'rose' : v < 60 ? 'amber' : 'leaf'} />
              </div>
            ))}
            <div className="pt-2 border-t border-line grid gap-3">
              {STAGES.slice(0, 2).map((st) => {
                const v = s.skill[st.id === 's1' ? 'english' : 'foundations'] ?? 0;
                return (<div key={st.id}><div className="flex justify-between text-[13px]"><span className="font-semibold">{st.title}</span><span className="tnum text-ink-3">{v}%</span></div><Bar value={v / 100} tone="moss" className="mt-1.5" /></div>);
              })}
            </div>
          </div>
        </section>

        <section className="card p-6">
          <SectionTitle eyebrow="Desmos" title="Desmos-ийн чадвар" right={<span className="font-thin text-[28px] text-teal tnum leading-none">{Math.round(desmosPct * 100)}%</span>} />
          <ul className="mt-5 grid gap-2">
            {desmosSkills.map(({ d, done }) => (
              <li key={d.id}>
                <button onClick={() => go({ name: 'desmos', id: d.id })} className="w-full flex items-center gap-3 rounded-xl px-2 py-1.5 hover:bg-paper-2 text-left">
                  <span className={`h-7 w-7 rounded-lg grid place-items-center ${done ? 'bg-teal text-white' : 'bg-paper-2 text-ink-3'}`}><LuSpline size={14} /></span>
                  <span className="text-[13px] flex-1 min-w-0 truncate">{d.skill} <span className="text-ink-3">· {d.title}</span></span>
                  <span className={`text-[11.5px] font-semibold ${done ? 'text-teal' : 'text-ink-3'}`}>{done ? 'Эзэмшсэн' : 'Эхлээгүй'}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section className="card p-6">
          <SectionTitle eyebrow="Анхаарах" title="Сул сэдвүүд" />
          <div className="mt-5 grid gap-3">
            {weak.map(({ d, v }) => (
              <button key={d} onClick={() => go({ name: 'bank' })} className="text-left rounded-2xl bg-rose-soft px-4 py-3">
                <div className="flex items-center gap-2"><LuTriangleAlert className="text-rose" /><span className="font-semibold text-[14px]">{DOMAINS[d].en}</span><span className="ml-auto tnum text-[12px] text-rose font-bold">{v}%</span></div>
                <div className="text-[12.5px] text-ink-2 mt-1">{DOMAINS[d].mn} — 5 дасгал бодоход ≈ +20%</div>
              </button>
            ))}
            {mistakeSkills.map(([k, n]) => (
              <button key={k} onClick={() => go({ name: 'mistakes' })} className="text-left rounded-xl border border-line px-4 py-2.5 text-[13px] flex items-center">
                <span className="flex-1">{k}</span><span className="text-ink-3 tnum">{n} алдаа</span>
              </button>
            ))}
          </div>
        </section>
      </div>

      <section className="card p-6 mt-5">
        <SectionTitle eyebrow="Амжилтууд" title={`${Object.keys(s.badges).length}/${BADGES.length} тэмдэг`} right={<button onClick={() => go({ name: 'achievements' })} className="text-[13px] font-semibold text-leaf hover:underline">Бүгдийг харах →</button>} />
        <div className="mt-4 flex gap-4 overflow-x-auto no-scrollbar pb-1">
          {BADGES.map((b) => <div key={b.id} className="shrink-0 text-center w-[86px]"><BadgeEmblem badge={b} earned={!!s.badges[b.id]} size={72} /><div className={`text-[11px] mt-1 leading-tight ${s.badges[b.id] ? 'font-semibold' : 'text-ink-3'}`}>{b.mn}</div></div>)}
        </div>
      </section>
    </div>
  );
}
