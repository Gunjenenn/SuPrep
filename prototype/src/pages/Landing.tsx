import { useState } from 'react';
import { LuArrowRight, LuCheck, LuCircleHelp, LuLightbulb, LuShuffle, LuSparkles, LuTriangleAlert } from 'react-icons/lu';
import { CatHead, CatPeek, CatSitting } from '../brand/Cat';
import { Blob, Logo, Scribble, Stars, Wordmark } from '../brand/Decor';
import { STAGES } from '../data/curriculum';
import { useStore } from '../lib/store';
import GraphCalc from '../components/GraphCalc';
import { Rich, Tex } from '../components/Math';
import { Button } from '../components/ui';
import Hero3D from '../brand/Hero3D';
import type { Poi } from '../lib/graph';

export default function Landing() {
  const { s, go } = useStore();
  const start = () => go(s.profile.onboarded ? { name: 'dashboard' } : { name: 'onboarding' });
  const [found, setFound] = useState<Poi | null>(null);
  return (
    <div className="min-h-full bg-bg overflow-x-hidden">
      {/* nav */}
      <header className="sticky z-30 bg-bg/90 backdrop-blur border-b border-line/60" style={{ top: 'env(safe-area-inset-top, 0px)' }}>
        <div className="gutter max-w-[1240px] mx-auto h-16 flex items-center gap-6">
          <Logo />
          <nav className="hidden md:flex items-center gap-6 text-[13.5px] font-semibold text-ink-2" aria-label="Хуудасны хэсгүүд">
            <a href="#desmos" className="hover:text-ink">Desmos Академи</a>
            <a href="#journey" className="hover:text-ink">Замнал</a>
            <a href="#tutor" className="hover:text-ink">AI багш Суу</a>
            <a href="#price" className="hover:text-ink">Үнэ</a>
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <div className="hidden sm:block"><Button variant="ghost" size="sm" onClick={() => go({ name: 'dashboard' })} id="demo-student">Демо сурагчаар орох</Button></div>
            <button onClick={() => go({ name: 'dashboard' })} className="sm:hidden text-[12.5px] font-semibold text-ink-2 px-2" id="demo-student-m">Демо</button>
            <Button size="sm" onClick={start} id="landing-start">Эхлэх</Button>
          </div>
        </div>
      </header>

      {/* hero */}
      <section className="relative">
        <Scribble className="absolute inset-0 w-full h-full pointer-events-none" />
        <div className="gutter max-w-[1240px] mx-auto pt-12 md:pt-16 pb-14 grid lg:grid-cols-[1.1fr_1fr] gap-10 items-center relative">
          <div className="anim-rise">
            <div className="eyebrow">SAT Math бэлдэх талбар</div>
            <h1 className="mt-4 font-display font-extrabold text-[36px] sm:text-[50px] lg:text-[60px] leading-[1.02] tracking-[-0.035em] text-ink">
              SAT Math-ийг<br /><span className="relative inline-block">ухаалгаар<svg className="absolute left-0 -bottom-2 w-full h-4" viewBox="0 0 300 16" preserveAspectRatio="none" aria-hidden="true"><path d="M4 11 C80 3 200 3 296 9" stroke="var(--c-lime)" strokeWidth="7" fill="none" strokeLinecap="round" /></svg></span> эзэмш.
            </h1>
            <div className="mt-6 flex items-start gap-6 flex-wrap">
              <div className="border-t-2 border-leaf pt-2 font-slab font-bold text-[19px] leading-[1.35] text-ink">
                Суу ухаан<br />Суу билиг<br />Суу алдар
              </div>
              <p className="max-w-[40ch] text-ink-2 text-[15.5px] pt-2">
                Монгол сурагчдад зориулсан SAT Math платформ. Англи математик хэлээс эхлээд <b className="text-ink">Desmos тооцоолуурыг зөв ашиглах</b> хүртэл — ухаалаг муур багш Суутай хамт.
              </p>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button size="lg" onClick={start} icon={<LuArrowRight />} className="flex-row-reverse" id="hero-start">Суралцаж эхлэх</Button>
              <Button size="lg" variant="secondary" onClick={() => document.getElementById('desmos')?.scrollIntoView({ behavior: 'smooth' })}>Desmos-ийг туршиж үзэх</Button>
            </div>
            <div className="mt-5 font-script text-[26px] text-leaf -rotate-2 inline-block">мяу! SAT-д бэлдье</div>
          </div>
          <div className="relative h-[360px] sm:h-[460px] -mx-4 sm:mx-0">
            <div className="hidden sm:block h-full"><Hero3D /></div>
            <div className="sm:hidden h-full"><Hero3D scale={0.72} /></div>
            <Stars className="absolute top-0 right-2 w-40 sm:w-52 pointer-events-none" />
          </div>
        </div>
      </section>

      {/* desmos */}
      <section id="desmos" className="bg-forest text-cream scroll-mt-16">
        <div className="gutter max-w-[1240px] mx-auto py-14 md:py-20 grid lg:grid-cols-[0.85fr_1.15fr] gap-10 items-center">
          <div>
            <div className="eyebrow" style={{ color: 'var(--c-lime)' }}>Яагаад Suprep?</div>
            <h2 className="mt-3 font-display font-extrabold text-[30px] md:text-[40px] leading-[1.02]">Math хэсэгт Desmos ашиглаж болно.</h2>
            <p className="mt-4 text-cream/75 text-[15.5px] max-w-[48ch]">Digital SAT-д график тооцоолуур бүх асуултад нээлттэй. Гэвч ихэнх сурагч бүгдийг гараар бодож цаг алддаг. Suprep чамд Desmos-ийг <span className="text-lime font-semibold">тэгээс</span> зааж, аль бодлогод ашиглахаа таниулна.</p>
            <ol className="mt-7 grid gap-3">
              {['Тэгшитгэлээ бич', 'Шугам дээр дар', 'Огтлолцлыг уншаад хариул'].map((t, k) => (
                <li key={t} className="flex items-center gap-3">
                  <span className="h-8 w-8 rounded-full border border-lime/50 text-lime grid place-items-center font-display font-bold text-[13px]">{k + 1}</span>
                  <span className="text-[15px]">{t}</span>
                </li>
              ))}
            </ol>
            <div className="mt-7 rounded-2xl bg-white/[0.06] px-5 py-4 flex items-start gap-3 min-h-[72px]" aria-live="polite">
              <CatHead size={42} mood={found ? 'happy' : 'focus'} />
              <div className="text-[14px]">
                {found?.kind === 'intersection' ? <>Мяу, олчихлоо! Огтлолцол <b className="text-lime">({found.x}, {found.y})</b> — энэ бол системийн шийд.</> : found ? <>Энэ бол өөр цэг. Хоёр шулуун <b>уулзах</b> цэгийг ол.</> : <>Баруун талын графикт аль нэг шулуун дээр дараад, саарал <b>огтлолцлын</b> цэгийг дар.</>}
              </div>
            </div>
          </div>
          <div className="h-[440px] text-ink rounded-2xl shadow-pop">
            <GraphCalc initialRows={['y=2x+1', 'y=-x+7']} height="100%" onPoi={setFound} initialView={{ cx: 2, cy: 3, scale: 30 }} listWidth={240} label="Шууд туршаад үз" />
          </div>
        </div>
      </section>

      {/* method */}
      <section className="gutter max-w-[1240px] mx-auto py-16 md:py-20 grid lg:grid-cols-2 gap-10 items-center">
        <div>
          <div className="eyebrow">Заах арга барил</div>
          <h2 className="mt-3 font-display font-extrabold text-[30px] md:text-[38px] leading-[1.02]">Эхлээд асуултаа,<br />дараа нь бодлогоо.</h2>
          <div className="mt-8 grid gap-6">
            <div className="flex gap-5"><span className="font-thin text-[48px] leading-none text-leaf">01</span><div><div className="font-display font-extrabold tracking-[0.12em] text-[15px]">Асуултаа ойлгох</div><p className="text-ink-2 text-[14.5px] mt-1">at most, in terms of, solution… — SAT-ын англи хэлийг математик тэмдэг рүү хөрвүүлнэ.</p></div></div>
            <div className="flex gap-5"><span className="font-thin text-[48px] leading-none text-leaf">02</span><div><div className="font-display font-extrabold tracking-[0.12em] text-[15px]">Бодлогоо ойлгох</div><p className="text-ink-2 text-[14.5px] mt-1">Суурь ойлголт, зөв стратеги, шаардлагатай үед Desmos.</p></div></div>
          </div>
        </div>
        <div className="card p-7 relative">
          <div className="eyebrow">Жишээ</div>
          <div className="mt-2 text-[19px]"><Rich text="If $3x+5\le 20$, what is the greatest possible value of $x$?" /></div>
          <div className="text-right font-script text-leaf text-[22px] mt-1">greatest = хамгийн их!</div>
          <div className="mt-4 border-t border-line pt-4 grid gap-3 text-[14px]">
            <div><div className="text-[11px] font-bold tracking-[0.14em] text-ink-3">1 · АСУУЛТ</div><div className="mt-1">x-ийн хамгийн их боломжит утгыг ол.</div></div>
            <div><div className="text-[11px] font-bold tracking-[0.14em] text-ink-3">2 · БОДОЛТ</div><div className="mt-1 math-lg"><Tex tex="3x\le 15\ \rightarrow\ x\le 5" /></div></div>
          </div>
          <div className="mt-4 font-thin text-[54px] text-leaf leading-none"><Tex tex="x=5" /></div>
          <div className="absolute -right-4 -bottom-6 hidden sm:block"><CatSitting size={110} /></div>
        </div>
      </section>

      {/* journey */}
      <section id="journey" className="bg-paper border-y border-line scroll-mt-16">
        <div className="gutter max-w-[1240px] mx-auto py-16 md:py-20">
          <div className="eyebrow">Сургалтын замнал</div>
          <h2 className="mt-3 font-display font-extrabold text-[30px] md:text-[38px] leading-[1.02] max-w-3xl">Ойлгох → Сурах → Дадлага → Эзэмших → Хэрэглэх</h2>
          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {STAGES.map((st) => (
              <div key={st.id} className={`rounded-2xl p-5 border ${st.id === 's3' ? 'bg-forest text-cream border-forest' : 'bg-bg border-line'}`}>
                <div className={`font-thin text-[40px] leading-none ${st.id === 's3' ? 'text-lime' : 'text-leaf'}`}>{String(st.no).padStart(2, '0')}</div>
                <div className="mt-4 font-display font-extrabold text-[15px] leading-tight">{st.title}</div>
                <div className={`text-[11.5px] mt-0.5 ${st.id === 's3' ? 'text-cream/60' : 'text-ink-3'}`}>{st.en}</div>
                <p className={`mt-3 text-[13px] ${st.id === 's3' ? 'text-cream/80' : 'text-ink-2'}`}>{st.blurb}</p>
              </div>
            ))}
          </div>
          <p className="mt-6 text-[13.5px] text-ink-3">Хичээл бүр шалгалтаар төгсөнө: 5 асуултаас 4-ийг зөв бодвол дараагийн алхам нээгдэнэ. Оролдлого хязгааргүй.</p>
        </div>
      </section>

      {/* tutor */}
      <section id="tutor" className="gutter max-w-[1240px] mx-auto py-16 md:py-20 grid lg:grid-cols-[1fr_1fr] gap-10 items-center scroll-mt-16">
        <div className="order-2 lg:order-1 card p-5 grid gap-3">
          <div className="flex justify-end"><div className="rounded-2xl rounded-br-md bg-forest text-cream px-4 py-2.5 text-[14px] max-w-[80%]">Яагаад 20% биш вэ?</div></div>
          <div className="flex gap-2.5">
            <CatHead size={34} className="shrink-0" />
            <div className="rounded-2xl rounded-bl-md bg-paper-2 px-4 py-3 text-[14px] max-w-[85%]"><Rich text="Чи $\frac{10}{50}$ гэж **шинэ** үнээр хуваасан байна. Хувийн өөрчлөлтийг **анхны** үнээр хуваана: $\frac{10}{40}=25\%$. Одоо төстэй нэг бодлого туршаад үзэх үү?" /></div>
          </div>
          <div className="flex flex-wrap gap-1.5 pl-11">
            {[[<LuCircleHelp key="a" size={14} />, 'Надад тайлбарла'], [<LuLightbulb key="b" size={14} />, 'Сэжүүр өг'], [<LuSparkles key="c" size={14} />, 'Desmos-оор заа'], [<LuTriangleAlert key="d" size={14} />, 'Алдааг минь тайлбарла'], [<LuShuffle key="e" size={14} />, 'Төстэй бодлого өг']].map(([i, t]) => (
              <span key={t as string} className="h-8 px-3 rounded-full border border-line text-[12.5px] font-semibold inline-flex items-center gap-1.5">{i}{t}</span>
            ))}
          </div>
        </div>
        <div className="order-1 lg:order-2">
          <div className="eyebrow">AI багш</div>
          <h2 className="mt-3 font-display font-extrabold text-[30px] md:text-[38px] leading-[1.02]">Хариуг биш,<br />бодох аргыг заана.</h2>
          <p className="mt-4 text-ink-2 text-[15.5px] max-w-[48ch]">Суу чиний алдааны шалтгааныг олж, дутуу ойлголтыг монголоор тайлбарлана. Сэжүүр өгнө, Desmos-оор үзүүлнэ, дараагийн алхмыг чамаар хийлгэнэ. Gemini загвар дээр суурилан хөгжүүлж байна.</p>
          <ul className="mt-6 grid gap-2 text-[14.5px]">
            {['SAT Math ба Desmos-д төрөлжсөн', 'Монгол тайлбар, англи нэр томъёо', 'Чиний яг одоогийн бодлогыг мэднэ'].map((t) => <li key={t} className="flex items-center gap-2.5"><LuCheck className="text-leaf" /> {t}</li>)}
          </ul>
        </div>
      </section>

      {/* price */}
      <section id="price" className="bg-paper border-y border-line scroll-mt-16">
        <div className="gutter max-w-[1240px] mx-auto py-16 md:py-20 grid lg:grid-cols-[1fr_1fr] gap-10 items-center">
          <div>
            <div className="eyebrow">Үнэ · 1 сар</div>
            <div className="mt-2 font-thin text-[72px] md:text-[96px] leading-none tnum">18,000₮</div>
            <div className="mt-8 grid gap-3 max-w-md">
              <div className="text-[13px] text-ink-2">Сургалтын төв</div>
              <div className="bg-ink text-paper font-display font-bold text-[20px] px-4 py-2 tnum">500,000–550,000₮</div>
              <div className="text-[13px] text-ink-2 mt-2">Suprep</div>
              <div className="flex items-center gap-3"><span className="h-9 w-20 bg-leaf" /><span className="font-display font-extrabold text-[28px] text-leaf tnum">18,000₮</span></div>
            </div>
            <div className="mt-4 font-script text-[28px] text-leaf -rotate-2 inline-block">≈10 дахин хямд!</div>
          </div>
          <div className="relative rounded-3xl bg-sage p-8 md:p-10 overflow-visible">
            <div className="absolute -top-[86px] right-8"><CatPeek size={130} /></div>
            <div className="eyebrow">Шийдэл</div>
            <div className="mt-3 font-display font-extrabold text-[34px] md:text-[44px] leading-[0.98]">Хаанаас ч,<br />хэзээ ч.</div>
            <div className="mt-3 font-slab font-black text-[56px] text-leaf leading-none">24/7</div>
            <p className="mt-4 text-ink-2 text-[14.5px] max-w-[44ch]">Хөдөө орон нутгийн болон төлбөрийн боломж хязгаарлагдмал сурагчид ч Улаанбаатарт ирэлгүйгээр, өөрийн цагаар бэлдэнэ.</p>
          </div>
        </div>
      </section>

      {/* closing */}
      <section className="relative overflow-hidden">
        <Scribble className="absolute inset-0 w-full h-full pointer-events-none" />
        <div className="gutter max-w-[1240px] mx-auto py-16 md:py-24 grid md:grid-cols-[1fr_auto] gap-8 items-center relative">
          <div>
            <Wordmark className="text-[44px] md:text-[64px] leading-none" />
            <div className="mt-4 font-script text-[44px] md:text-[56px] text-leaf leading-none">Суу бас суралц.</div>
            <Button size="lg" className="mt-8 flex-row-reverse" onClick={start} icon={<LuArrowRight />} id="footer-start">Үнэгүй эхлэх</Button>
          </div>
          <div className="relative w-[280px] h-[220px] mx-auto" aria-hidden="true">
            <Blob className="absolute inset-x-0 bottom-0 h-[150px] w-full" />
            <div className="absolute left-1/2 -translate-x-1/2 bottom-0"><CatHead size={200} mood="wink" /></div>
          </div>
        </div>
        <footer className="gutter max-w-[1240px] mx-auto py-6 border-t border-line flex flex-wrap items-center gap-4 text-[12px] text-ink-3">
          <Logo compact /> <span>Suprep · SAT Math · Хакатоны прототип</span>
          <span className="ml-auto">SAT нь College Board-ын бүртгэлтэй тэмдэг. Desmos нь Desmos Studio-ийн тэмдэг. Suprep тэдэнтэй холбоогүй.</span>
        </footer>
      </section>
    </div>
  );
}
