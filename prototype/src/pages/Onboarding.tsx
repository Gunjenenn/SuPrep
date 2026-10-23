import { useState } from 'react';
import { LuArrowLeft, LuArrowRight } from 'react-icons/lu';
import { CatHead, CatMood, CatSitting } from '../brand/Cat';
import { Blob, Logo, Stars } from '../brand/Decor';
import { useStore } from '../lib/store';
import { Button } from '../components/ui';

type Opt = { v: string; t: string; d?: string; mood?: CatMood };
const STEPS: { key: string; q: string; say: string; opts?: Opt[] }[] = [
  { key: 'name', q: 'Чамайг хэн гэдэг вэ?', say: 'Мяу! Би Суу. Хамтдаа SAT Math-д бэлдэх болно. Эхлээд танилцъя.' },
  { key: 'confidence', q: 'Математикт хэр итгэлтэй байдаг вэ?', say: 'Үнэнээ хэлээрэй — эндээс л замналыг чинь тохируулна.', opts: [
    { v: '1', t: 'Их эргэлздэг', d: 'Алгебрийн суурь сул', mood: 'think' }, { v: '2', t: 'Дунд зэрэг', d: 'Ихэнхийг ойлгодог', mood: 'idle' },
    { v: '3', t: 'Итгэлтэй', d: 'Сургуульдаа сайн', mood: 'happy' }, { v: '4', t: 'Маш итгэлтэй', d: 'Олимпиадын түвшин', mood: 'wink' } ] },
  { key: 'satExp', q: 'SAT-тай хэр танилцсан бэ?', say: 'SAT-ын асуулт англи хэл дээр байдаг нь олон хүнд хамгийн том саад болдог.', opts: [
    { v: 'none', t: 'Огт үзээгүй' }, { v: 'some', t: 'Хэдэн бодлого бодсон' }, { v: 'practice', t: 'Дадлагын тест өгсөн' }, { v: 'taken', t: 'Жинхэнэ SAT өгсөн' } ] },
  { key: 'desmos', q: 'Desmos тооцоолуур ашиглаж байсан уу?', say: 'Энэ бол Suprep-ийн гол нууц зэвсэг.', opts: [
    { v: 'none', t: 'Сонсож байгаагүй' }, { v: 'heard', t: 'Сонссон, ашиглаагүй' }, { v: 'some', t: 'Заримдаа ашигладаг' }, { v: 'pro', t: 'Чөлөөтэй ашигладаг' } ] },
  { key: 'target', q: 'SAT Math-д ямар оноо зорьж байна?', say: 'Зорилготой бол зам тодорхой.' },
  { key: 'examDate', q: 'Шалгалтаа хэзээ өгөх вэ?', say: 'Өдрөө мэдвэл долоо хоног бүрийн төлөвлөгөө гаргана.' },
];

export default function Onboarding() {
  const { s, go, setProfile } = useStore();
  const [k, setK] = useState(0);
  const [v, setV] = useState<Record<string, string>>({ name: s.profile.name === 'Demo' ? '' : s.profile.name, target: String(s.profile.target), examDate: s.profile.examDate });
  const step = STEPS[k];
  const result = k >= STEPS.length;
  const val = step ? v[step.key] : '';
  const canNext = !!(val && String(val).trim());

  const start = (() => {
    const conf = Number(v.confidence || 2);
    if (conf <= 2 || v.satExp === 'none') return { key: 'english' as const, title: 'Математикийн хэл', why: 'SAT-ын англи бодлогыг ойлгох нь бүх зүйлийн эхлэл. 3 богино хичээлээр суурь үгсээ эзэмшээд, Desmos руу шилжинэ.' };
    if (v.desmos === 'none' || v.desmos === 'heard') return { key: 'desmos' as const, title: 'Desmos Академи', why: 'Математикийн суурь чинь сайн байна. Desmos-ийг эзэмшвэл олон бодлогыг 2–3 дахин хурдан бодно.' };
    return { key: 'foundations' as const, title: 'Математикийн суурь → SAT дасгал', why: 'Суурь, Desmos хоёулаа сайн. Шууд дасгал ба цагтай сорилт руу орж, сул сэдвээ олъё.' };
  })();

  const finish = () => {
    setProfile({ name: v.name.trim() || 'Сурагч', confidence: Number(v.confidence), satExp: v.satExp, desmos: v.desmos, target: Number(v.target), examDate: v.examDate, start: start.key, onboarded: true });
    if (start.key === 'desmos') go({ name: 'desmos' }); else go({ name: 'dashboard' });
  };

  return (
    <div className="min-h-full bg-bg flex flex-col">
      <header className="gutter h-16 flex items-center max-w-[1100px] w-full mx-auto">
        <button onClick={() => go({ name: 'landing' })} aria-label="Нүүр"><Logo /></button>
        <div className="ml-auto flex gap-1.5" aria-label={`Алхам ${Math.min(k + 1, STEPS.length)}/${STEPS.length}`}>
          {STEPS.map((_, j) => <span key={j} className={`h-1.5 w-8 rounded-full ${j <= k ? 'bg-leaf' : 'bg-line'}`} />)}
        </div>
      </header>
      <div className="gutter flex-1 grid place-items-center py-6">
        <div className="w-full max-w-[860px] grid md:grid-cols-[260px_1fr] gap-8 items-center">
          <div className="relative h-[220px] md:h-[300px] hidden sm:block" aria-hidden="true">
            <Blob className="absolute inset-x-0 bottom-0 h-[150px] w-full" />
            <Stars className="absolute top-0 right-0 w-36" />
            <div className="absolute left-1/2 -translate-x-1/2 bottom-0" key={k}><CatSitting size={150} mood={result ? 'happy' : step?.opts?.find((o) => o.v === val)?.mood || (k === 0 ? 'happy' : 'idle')} /></div>
          </div>
          <div className="card p-7 md:p-9 anim-rise" key={k}>
            {!result ? (
              <>
                <div className="flex items-start gap-3 rounded-2xl bg-sage px-4 py-3 text-[14px]">
                  <CatHead size={34} className="sm:hidden" />
                  <span>{step.say}</span>
                </div>
                <h1 className="mt-6 font-display font-extrabold text-[26px] leading-tight">{step.q}</h1>
                <div className="mt-6">
                  {step.key === 'name' && (
                    <input id="ob-name" autoFocus value={v.name} onChange={(e) => setV({ ...v, name: e.target.value })} onKeyDown={(e) => e.key === 'Enter' && canNext && setK(k + 1)} placeholder="Нэрээ бич" autoComplete="given-name"
                      className="w-full h-14 rounded-2xl border-2 border-line-2 bg-paper px-5 text-[18px] outline-none focus:border-leaf" />
                  )}
                  {step.opts && (
                    <div className="grid sm:grid-cols-2 gap-2.5">
                      {step.opts.map((o) => (
                        <button key={o.v} onClick={() => setV({ ...v, [step.key]: o.v })} id={`ob-${step.key}-${o.v}`}
                          className={`text-left rounded-2xl border-2 px-4 py-3.5 ${val === o.v ? 'border-leaf bg-sage/60' : 'border-line bg-paper hover:border-line-2'}`}>
                          <div className="font-semibold text-[15px]">{o.t}</div>
                          {o.d && <div className="text-[12.5px] text-ink-3">{o.d}</div>}
                        </button>
                      ))}
                    </div>
                  )}
                  {step.key === 'target' && (
                    <div>
                      <div className="font-thin text-[64px] leading-none text-leaf tnum">{v.target}</div>
                      <input id="ob-target" type="range" min={500} max={800} step={10} value={v.target} onChange={(e) => setV({ ...v, target: e.target.value })} className="w-full mt-4 accent-[var(--c-leaf)]" aria-label="Зорилтот оноо" />
                      <div className="flex justify-between text-[12px] text-ink-3 tnum"><span>500</span><span>650</span><span>800</span></div>
                    </div>
                  )}
                  {step.key === 'examDate' && (
                    <div>
                      <input id="ob-date" type="date" value={v.examDate} min={new Date().toISOString().slice(0, 10)} onChange={(e) => setV({ ...v, examDate: e.target.value })}
                        className="h-14 rounded-2xl border-2 border-line-2 bg-paper px-5 text-[17px] outline-none focus:border-leaf" />
                      <p className="mt-2 text-[12.5px] text-ink-3">SAT-ын албан ёсны өдрүүдийг satsuite.collegeboard.org дээрээс шалгаарай.</p>
                    </div>
                  )}
                </div>
                <div className="mt-8 flex items-center gap-3">
                  {k > 0 && <Button variant="ghost" onClick={() => setK(k - 1)} icon={<LuArrowLeft />}>Буцах</Button>}
                  <div className="flex-1" />
                  <Button size="lg" disabled={!canNext} onClick={() => setK(k + 1)} icon={<LuArrowRight />} className="flex-row-reverse" id="ob-next">Үргэлжлүүлэх</Button>
                </div>
              </>
            ) : (
              <>
                <div className="eyebrow">Чиний эхлэх цэг</div>
                <h1 className="mt-2 font-display font-extrabold text-[28px] leading-tight">{v.name.trim() || 'Сурагч'}, бид <span className="text-leaf">{start.title}</span>-аас эхэлье.</h1>
                <p className="mt-3 text-ink-2 text-[15px]">{start.why}</p>
                <div className="mt-6 grid grid-cols-3 gap-3 text-center">
                  <div className="rounded-2xl bg-paper-2 py-3"><div className="font-display font-extrabold text-xl tnum">{v.target}</div><div className="text-[11px] text-ink-3">зорилт</div></div>
                  <div className="rounded-2xl bg-paper-2 py-3"><div className="font-display font-extrabold text-xl tnum">{Math.max(0, Math.ceil((new Date(v.examDate + 'T09:00:00').getTime() - Date.now()) / 864e5))}</div><div className="text-[11px] text-ink-3">хоног үлдсэн</div></div>
                  <div className="rounded-2xl bg-paper-2 py-3"><div className="font-display font-extrabold text-xl tnum">≈25</div><div className="text-[11px] text-ink-3">мин / өдөр</div></div>
                </div>
                <div className="mt-8 flex items-center gap-3">
                  <Button variant="ghost" onClick={() => setK(k - 1)} icon={<LuArrowLeft />}>Буцах</Button>
                  <div className="flex-1" />
                  <Button size="lg" onClick={finish} id="ob-finish">Замналаа эхлүүлэх</Button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
