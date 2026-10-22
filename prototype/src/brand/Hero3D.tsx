// Isometric 3D study stack for the landing hero: graph slab → formula slab → XP chip, Суу on top.
import { CatHead } from './Cat';
import { Tex } from '../components/Math';
import { Tilt } from '../components/ui';

const BILLBOARD = 'rotateZ(38deg) rotateX(-54deg)'; // undo the stage rotation so Суу faces the viewer

export default function Hero3D({ scale = 1 }: { scale?: number }) {
  return (
    <Tilt max={10} className="relative h-full w-full">
      <div className="absolute inset-0 grid place-items-center pointer-events-none" aria-hidden="true">
        <div className="glow w-[520px] h-[520px] max-w-full" />
      </div>
      <div className="absolute left-1/2 top-[54%]" style={{ transform: `translate(-50%, -50%) scale(${scale})`, transformStyle: 'preserve-3d' }} aria-hidden="true">
        <div className="iso relative w-[320px] h-[320px]">
          {/* floor shadow */}
          <div className="absolute -inset-8 rounded-[48px]" style={{ background: 'color-mix(in srgb, var(--c-leaf) 22%, transparent)', transform: 'translateZ(-30px)' }} />
          {/* slab 1 — graph */}
          <div className="slab absolute inset-0 overflow-hidden" style={{ transform: 'translateZ(0px)' }}>
            <svg viewBox="0 0 320 320" className="w-full h-full">
              <g stroke="var(--c-graph-grid-2)">{Array.from({ length: 17 }).map((_, i) => <path key={i} d={`M${i * 20} 0V320M0 ${i * 20}H320`} />)}</g>
              <path d="M160 0V320M0 160H320" stroke="var(--c-graph-axis)" strokeWidth={2} />
              <path d="M40 320 L260 0" stroke="#2f8a3e" strokeWidth={6} strokeLinecap="round" className="draw-path" style={{ ['--len' as any]: 400 }} />
              <path d="M10 60 L310 300" stroke="#c8513f" strokeWidth={6} strokeLinecap="round" className="draw-path" style={{ ['--len' as any]: 400, animationDelay: '.3s' }} />
              <circle cx={163} cy={137} r={11} fill="var(--c-paper)" stroke="var(--c-ink)" strokeWidth={4} className="anim-pop" style={{ animationDelay: '1.3s' }} />
            </svg>
          </div>
          {/* slab 2 — formula card */}
          <div className="slab absolute left-[-46px] top-[188px] w-[210px] px-5 py-4" style={{ transform: 'translateZ(70px)' }}>
            <div className="font-mono text-[10px] font-bold tracking-[0.14em] text-leaf-2">GREATEST = ХАМГИЙН ИХ</div>
            <div className="mt-1.5 text-[17px]"><Tex tex="3x+5\le 20" /></div>
            <div className="text-[20px] font-bold text-leaf-2"><Tex tex="x\le 5" /></div>
          </div>
          {/* slab 3 — intersection label */}
          <div className="slab absolute left-[178px] top-[40px] px-4 py-2.5" style={{ transform: 'translateZ(110px)', background: 'var(--c-forest-2)', borderColor: 'var(--c-forest-2)', color: 'var(--c-on-forest)' }}>
            <div className="font-display font-bold text-[18px] tnum">(2, 5)</div>
          </div>
          {/* XP coin */}
          <div className="absolute left-[236px] top-[230px] h-[74px] w-[74px] rounded-full coin grid place-items-center text-[#0c1a12] font-display font-extrabold text-[15px]"
            style={{ ['--face' as any]: 'var(--c-gold)', ['--edge' as any]: '#a37b10', transform: 'translateZ(60px)' }}>+40</div>
          {/* Суу standing on the graph slab */}
          <div className="absolute left-[70px] top-[40px]" style={{ transform: 'translateZ(2px)', transformStyle: 'preserve-3d' }}>
            <div style={{ transform: BILLBOARD, transformOrigin: '50% 100%' }}>
              <div className="anim-floaty"><CatHead size={150} mood="happy" /></div>
            </div>
          </div>
        </div>
      </div>
    </Tilt>
  );
}
