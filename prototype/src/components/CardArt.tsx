// Animated mini illustrations for flashcards (Hippocards gives every card an animated picture;
// ours draw the math idea itself). Pure SVG + CSS keyframes, theme tokens only.
import type { Art } from '../data/cards';

const INK = 'var(--c-ink)';
const A = 'var(--c-leaf)';
const B = 'var(--c-rose)';
const C = 'var(--c-teal)';
const D = 'var(--c-amber)';
const SOFT = 'var(--c-line-2)';

function Block({ x, y, c, d = 0, cls = 'art-pop' }: { x: number; y: number; c: string; d?: number; cls?: string }) {
  return <rect x={x} y={y} width={18} height={18} rx={5} fill={c} className={cls} style={{ animationDelay: `${d}s` }} />;
}

export default function CardArt({ art, v, size = 200 }: { art: Art; v?: string; size?: number }) {
  return (
    <svg viewBox="0 0 200 140" width={size} height={size * 0.7} className="art" aria-hidden="true">
      {render(art, v)}
    </svg>
  );
}

function render(art: Art, v?: string) {
  switch (art) {
    case 'merge':
      return (
        <g>
          {[0, 1].map((i) => <Block key={'a' + i} x={30 + i * 22} y={60} c={A} cls="art-in-l" d={i * 0.1} />)}
          {[0, 1, 2].map((i) => <Block key={'b' + i} x={110 + i * 22} y={60} c={C} cls="art-in-r" d={0.2 + i * 0.1} />)}
          <text x={93} y={75} fontSize={22} fontWeight={800} fill={INK} textAnchor="middle" className="art-pop" style={{ animationDelay: '.5s' }}>+</text>
          <path d="M30 100 Q100 128 172 100" stroke={SOFT} strokeWidth={3} fill="none" strokeDasharray="4 5" className="art-draw" />
          <text x={100} y={130} fontSize={14} fontWeight={700} fill={INK} textAnchor="middle" className="art-pop" style={{ animationDelay: '.9s' }}>2 + 3 = 5</text>
        </g>
      );
    case 'split':
      return (
        <g>
          {[0, 1, 2, 3, 4].map((i) => <Block key={i} x={44 + i * 24} y={52} c={i > 2 ? B : A} cls={i > 2 ? 'art-out' : ''} d={0.6} />)}
          <text x={100} y={112} fontSize={14} fontWeight={700} fill={INK} textAnchor="middle">5 − 2 = 3</text>
        </g>
      );
    case 'grid': {
      const cols = v === '2' ? 2 : 4, rows = 3;
      return (
        <g>
          {Array.from({ length: rows * cols }).map((_, i) => (
            <circle key={i} cx={100 - (cols - 1) * 12 + (i % cols) * 24} cy={38 + Math.floor(i / cols) * 24} r={8} fill={i % 2 ? A : C} className="art-pop" style={{ animationDelay: `${i * 0.05}s` }} />
          ))}
          <text x={100} y={128} fontSize={14} fontWeight={700} fill={INK} textAnchor="middle">{rows} × {cols} = {rows * cols}</text>
        </g>
      );
    }
    case 'pie': {
      const label = v === 'pct' ? '25%' : v === 'ratio' ? '3 : 2' : '12 ÷ 4';
      const slices = v === 'ratio' ? 5 : 4;
      return (
        <g transform="translate(100 64)">
          {Array.from({ length: slices }).map((_, i) => {
            const a0 = (i / slices) * Math.PI * 2 - Math.PI / 2, a1 = ((i + 1) / slices) * Math.PI * 2 - Math.PI / 2;
            const r = 44;
            const on = v === 'pct' ? i === 0 : v === 'ratio' ? i < 3 : true;
            const fill = on ? (v === 'ratio' ? A : [A, C, D, B][i % 4]) : v === 'ratio' ? B : SOFT;
            return (
              <path key={i} d={`M0 0 L${r * Math.cos(a0)} ${r * Math.sin(a0)} A${r} ${r} 0 0 1 ${r * Math.cos(a1)} ${r * Math.sin(a1)} Z`}
                fill={fill} stroke="var(--c-paper)" strokeWidth={3} className="art-explode" style={{ ['--dx' as any]: `${Math.cos((a0 + a1) / 2) * 7}px`, ['--dy' as any]: `${Math.sin((a0 + a1) / 2) * 7}px`, animationDelay: `${i * 0.08}s` }} />
            );
          })}
          <text x={0} y={70} fontSize={14} fontWeight={700} fill={INK} textAnchor="middle">{label}</text>
        </g>
      );
    }
    case 'remainder':
      return (
        <g>
          {[0, 1, 2].map((g) => (
            <g key={g} className="art-pop" style={{ animationDelay: `${g * 0.15}s` }}>
              <rect x={14 + g * 52} y={40} width={46} height={46} rx={10} fill="none" stroke={SOFT} strokeWidth={2} />
              {Array.from({ length: 5 }).map((_, i) => <circle key={i} cx={26 + g * 52 + (i % 3) * 11} cy={54 + Math.floor(i / 3) * 16} r={4.5} fill={A} />)}
            </g>
          ))}
          {[0, 1].map((i) => <circle key={i} cx={176 + i * 0} cy={52 + i * 18} r={6} fill={B} className="art-bob" style={{ animationDelay: `${i * 0.2}s` }} />)}
          <text x={100} y={120} fontSize={13.5} fontWeight={700} fill={INK} textAnchor="middle">17 = 3·5 + 2</text>
        </g>
      );
    case 'numberline': {
      const ticks = [-2, -1, 0, 1, 2, 3, 4, 5, 6];
      const X = (n: number) => 22 + (n + 2) * 19.5;
      const mark = v === 'seq' ? null : 3;
      return (
        <g>
          <path d="M14 80 H188" stroke={INK} strokeWidth={2} />
          {ticks.map((t) => (
            <g key={t}>
              <path d={`M${X(t)} 74 V86`} stroke={INK} strokeWidth={1.5} />
              <text x={X(t)} y={104} fontSize={11} fill="var(--c-ink-3)" textAnchor="middle">{t}</text>
            </g>
          ))}
          {v === 'int' && ticks.map((t, i) => <circle key={t} cx={X(t)} cy={80} r={5} fill={A} className="art-pop" style={{ animationDelay: `${i * 0.06}s` }} />)}
          {v === 'seq' && [1, 2, 3].map((t, i) => (
            <g key={t} className="art-pop" style={{ animationDelay: `${i * 0.25}s` }}>
              <circle cx={X(t)} cy={80} r={7} fill={A} />
              {i > 0 && <path d={`M${X(t - 1) + 4} 62 Q${(X(t) + X(t - 1)) / 2} 44 ${X(t) - 4} 62`} stroke={C} strokeWidth={2.5} fill="none" />}
              <text x={X(t)} y={36} fontSize={11} fontWeight={700} fill={INK} textAnchor="middle">{['n', 'n+1', 'n+2'][i]}</text>
            </g>
          ))}
          {(v === 'ge' || v === 'le' || v === 'max' || v === 'lt') && mark !== null && (
            <g>
              <path d={v === 'ge' ? `M${X(mark)} 80 H186` : `M${X(mark)} 80 H16`} stroke={v === 'ge' ? A : C} strokeWidth={7} strokeLinecap="round" className="art-draw" style={{ ['--len' as any]: 200 }} />
              <circle cx={X(mark)} cy={80} r={8} fill={v === 'lt' ? 'var(--c-paper)' : v === 'ge' ? A : C} stroke={v === 'ge' ? A : C} strokeWidth={3} />
              <text x={100} y={40} fontSize={15} fontWeight={800} fill={INK} textAnchor="middle">{v === 'ge' ? 'x ≥ 3' : v === 'lt' ? 'x < 3' : 'x ≤ 3'}</text>
              {v === 'max' && <text x={X(mark)} y={62} fontSize={11} fontWeight={800} fill={B} textAnchor="middle" className="art-bob">max</text>}
            </g>
          )}
        </g>
      );
    }
    case 'line': {
      const axes = <path d="M20 120 H186 M40 132 V12" stroke={INK} strokeWidth={1.6} />;
      if (v === 'const' || v === 'coef') {
        return (
          <g>
            <text x={100} y={78} fontSize={34} fontWeight={800} fill={INK} textAnchor="middle" fontFamily="KaTeX_Main, serif">
              <tspan fill={v === 'coef' ? A : INK} className={v === 'coef' ? 'art-bob' : ''}>7</tspan><tspan fontStyle="italic">x</tspan> + <tspan fill={v === 'const' ? B : INK} className={v === 'const' ? 'art-bob' : ''}>5</tspan>
            </text>
            <path d={v === 'coef' ? 'M62 92 h18' : 'M128 92 h20'} stroke={v === 'coef' ? A : B} strokeWidth={4} strokeLinecap="round" className="art-draw" />
          </g>
        );
      }
      return (
        <g>
          {axes}
          <path d="M40 112 L176 24" stroke={A} strokeWidth={4} strokeLinecap="round" className="art-draw" style={{ ['--len' as any]: 170 }} />
          {v === 'slope' && (
            <g className="art-pop" style={{ animationDelay: '.8s' }}>
              <path d="M90 80 H136 V50" stroke={B} strokeWidth={3} fill="none" strokeDasharray="5 4" />
              <text x={112} y={94} fontSize={11} fontWeight={700} fill={B} textAnchor="middle">run</text>
              <text x={150} y={68} fontSize={11} fontWeight={700} fill={B}>rise</text>
            </g>
          )}
          {v === 'icept' && <circle cx={40} cy={112} r={7} fill={B} className="art-pulse" />}
          {v === 'prop' && <circle cx={40} cy={112} r={6} fill={INK} />}
          {v === 'prop' && <text x={150} y={44} fontSize={12} fontWeight={800} fill={INK}>y = kx</text>}
        </g>
      );
    }
    case 'perp':
      return (
        <g>
          <path d="M30 110 L170 30" stroke={A} strokeWidth={4} strokeLinecap="round" className="art-draw" />
          <path d="M60 20 L140 120" stroke={C} strokeWidth={4} strokeLinecap="round" className="art-draw" style={{ animationDelay: '.3s' }} />
          <path d="M103 77 l9 -5 l5 8 l-9 5 z" fill="none" stroke={B} strokeWidth={2.5} className="art-pop" style={{ animationDelay: '.9s' }} />
          <text x={150} y={110} fontSize={14} fontWeight={800} fill={B}>90°</text>
        </g>
      );
    case 'circle':
      return (
        <g transform="translate(100 66)">
          <circle r={46} fill={v === 'area' ? 'color-mix(in srgb, var(--c-leaf) 25%, transparent)' : 'none'} stroke={v === 'c' ? A : INK} strokeWidth={v === 'c' ? 5 : 2.5} className={v === 'c' ? 'art-draw' : ''} style={{ ['--len' as any]: 300 }} />
          <circle r={4} fill={INK} />
          <g className="art-sweep"><path d="M0 0 H46" stroke={B} strokeWidth={4} strokeLinecap="round" /><circle cx={46} r={5} fill={B} /></g>
          <text x={14} y={-8} fontSize={13} fontWeight={800} fill={B}>r</text>
          {v === 'eq' && <text x={-34} y={66} fontSize={11.5} fontWeight={700} fill={INK}>төв (h, k)</text>}
        </g>
      );
    case 'triangle':
      return (
        <g>
          <path d="M40 116 H150 V30 Z" fill={v === 'area' ? 'color-mix(in srgb, var(--c-amber) 25%, transparent)' : 'none'} stroke={INK} strokeWidth={2.5} strokeLinejoin="round" />
          <path d="M140 116 V106 H150" stroke={INK} strokeWidth={2} fill="none" />
          <path d="M40 116 L150 30" stroke={B} strokeWidth={5} strokeLinecap="round" className="art-draw" style={{ ['--len' as any]: 150 }} />
          <text x={92} y={132} fontSize={12} fontWeight={700} fill={INK} textAnchor="middle">{v === '30' ? 'x√3' : v === 'area' ? 'b' : 'a = 8'}</text>
          <text x={158} y={78} fontSize={12} fontWeight={700} fill={INK}>{v === '30' ? 'x' : v === 'area' ? 'h' : 'b = 6'}</text>
          <text x={74} y={66} fontSize={12} fontWeight={800} fill={B} className="art-pop" style={{ animationDelay: '.9s' }}>{v === '30' ? '2x' : v === 'area' ? '' : 'c = 10'}</text>
        </g>
      );
    case 'bars': {
      const vals = v === 'median' ? [3, 7, 8, 12, 15] : [2, 4, 9];
      const max = 15;
      const bw = v === 'median' ? 22 : 30;
      const start = 100 - (vals.length * (bw + 8)) / 2;
      return (
        <g>
          <path d="M20 118 H184" stroke={INK} strokeWidth={1.6} />
          {vals.map((x, i) => {
            const h = (x / max) * 86;
            const hl = v === 'median' ? i === 2 : false;
            return <rect key={i} x={start + i * (bw + 8)} y={118 - h} width={bw} height={h} rx={5} fill={hl ? B : A} className="art-grow" style={{ animationDelay: `${i * 0.1}s` }} />;
          })}
          {v === 'mean' && <path d="M22 89 H182" stroke={B} strokeWidth={3} strokeDasharray="6 5" className="art-draw" style={{ animationDelay: '.7s' }} />}
          {v === 'mean' && <text x={180} y={82} fontSize={12} fontWeight={800} fill={B} textAnchor="end">mean = 5</text>}
          {v === 'median' && <text x={100} y={22} fontSize={12} fontWeight={800} fill={B} textAnchor="middle">median = 8</text>}
        </g>
      );
    }
    case 'parabola': {
      const shift = v === 'one' ? 18 : 0;
      return (
        <g>
          <path d="M14 104 H186" stroke={INK} strokeWidth={1.6} />
          <path d={`M40 ${12 + shift} Q100 ${v === 'one' ? 196 : 176} 160 ${12 + shift}`} stroke={A} strokeWidth={4} fill="none" strokeLinecap="round" className="art-draw" style={{ ['--len' as any]: 260 }} />
          {(v === 'two' || !v) && [70, 130].map((x, i) => <circle key={x} cx={x} cy={104} r={6} fill={B} className="art-pop" style={{ animationDelay: `${0.8 + i * 0.15}s` }} />)}
          {v === 'one' && <circle cx={100} cy={104} r={7} fill={B} className="art-pulse" />}
          {v === 'vertex' && <><circle cx={100} cy={94} r={7} fill={B} className="art-pulse" /><text x={112} y={124} fontSize={12} fontWeight={800} fill={B}>vertex</text></>}
        </g>
      );
    }
    case 'cross':
      return (
        <g>
          <path d="M30 120 L170 20" stroke={A} strokeWidth={4} strokeLinecap="round" className="art-draw" />
          <path d="M20 40 L180 112" stroke={B} strokeWidth={4} strokeLinecap="round" className="art-draw" style={{ animationDelay: '.25s' }} />
          <circle cx={88} cy={70} r={8} fill="var(--c-paper)" stroke={INK} strokeWidth={3} className="art-pulse" style={{ animationDelay: '.9s' }} />
          <rect x={96} y={42} width={50} height={20} rx={6} fill={INK} className="art-pop" style={{ animationDelay: '1s' }} />
          <text x={121} y={56} fontSize={11.5} fontWeight={800} fill="var(--c-paper)" textAnchor="middle" className="art-pop" style={{ animationDelay: '1s' }}>(2, 5)</text>
        </g>
      );
    case 'dice':
      return (
        <g>
          {[A, A, A, A, A, C, C, C, C, C, C, B, B, B, B].map((c, i) => (
            <circle key={i} cx={34 + (i % 5) * 33} cy={30 + Math.floor(i / 5) * 32} r={11} fill={c} opacity={c === A ? 1 : 0.45} className="art-pop" style={{ animationDelay: `${i * 0.03}s` }} />
          ))}
          <text x={100} y={132} fontSize={13.5} fontWeight={800} fill={INK} textAnchor="middle">P = 5 / 15</text>
        </g>
      );
    case 'power':
      return (
        <g>
          {v === 'eq' ? (
            <g fontFamily="KaTeX_Main, serif" fontSize={22} fill={INK}>
              <text x={100} y={56} textAnchor="middle">2(x + 3)</text>
              <text x={100} y={84} textAnchor="middle" fontSize={20} className="art-bob" fill={A}>≡</text>
              <text x={100} y={114} textAnchor="middle">2x + 6</text>
            </g>
          ) : (
            <g>
              <text x={80} y={96} fontSize={64} fontWeight={700} fill={INK} textAnchor="middle" fontFamily="KaTeX_Main, serif">2</text>
              <text x={112} y={58} fontSize={34} fontWeight={800} fill={A} textAnchor="middle" fontFamily="KaTeX_Main, serif" className="art-bob">5</text>
              <text x={150} y={96} fontSize={18} fontWeight={700} fill="var(--c-ink-3)">= 32</text>
            </g>
          )}
        </g>
      );
    case 'solid':
      if (v === 'sphere') return (
        <g transform="translate(100 66)">
          <circle r={48} fill="color-mix(in srgb, var(--c-teal) 25%, transparent)" stroke={INK} strokeWidth={2.5} />
          <ellipse rx={48} ry={14} fill="none" stroke={INK} strokeWidth={1.5} strokeDasharray="5 5" className="art-spin-y" />
          <path d="M0 0 H48" stroke={B} strokeWidth={3.5} /><text x={18} y={-6} fontSize={12} fontWeight={800} fill={B}>r</text>
        </g>
      );
      if (v === 'cone') return (
        <g>
          <path d="M100 18 L54 112 M100 18 L146 112" stroke={INK} strokeWidth={2.5} />
          <ellipse cx={100} cy={112} rx={46} ry={13} fill="color-mix(in srgb, var(--c-amber) 30%, transparent)" stroke={INK} strokeWidth={2.5} />
          <path d="M100 18 V112" stroke={B} strokeWidth={3} strokeDasharray="5 4" className="art-draw" /><text x={106} y={70} fontSize={12} fontWeight={800} fill={B}>h</text>
        </g>
      );
      return (
        <g>
          <ellipse cx={100} cy={30} rx={46} ry={13} fill="color-mix(in srgb, var(--c-leaf) 30%, transparent)" stroke={INK} strokeWidth={2.5} />
          <path d="M54 30 V110 M146 30 V110" stroke={INK} strokeWidth={2.5} />
          <path d="M54 110 A46 13 0 0 0 146 110" stroke={INK} strokeWidth={2.5} fill="none" />
          <rect x={56} y={72} width={88} height={38} fill="color-mix(in srgb, var(--c-teal) 30%, transparent)" className="art-grow" />
          <text x={152} y={76} fontSize={12} fontWeight={800} fill={B}>h</text>
        </g>
      );
    case 'rect':
      return (
        <g>
          {Array.from({ length: 24 }).map((_, i) => (
            <rect key={i} x={40 + (i % 8) * 15} y={30 + Math.floor(i / 8) * 15} width={13} height={13} rx={3} fill={A} opacity={0.85} className="art-pop" style={{ animationDelay: `${i * 0.02}s` }} />
          ))}
          <text x={100} y={102} fontSize={12} fontWeight={700} fill={INK} textAnchor="middle">ℓ = 8</text>
          <text x={168} y={56} fontSize={12} fontWeight={700} fill={INK}>w = 3</text>
          <text x={100} y={126} fontSize={13} fontWeight={800} fill={B} textAnchor="middle">A = 24</text>
        </g>
      );
    case 'angle':
      return (
        <g transform="translate(70 104)">
          <path d="M0 0 H110" stroke={INK} strokeWidth={2.5} />
          <g className="art-swing"><path d="M0 0 L80 -64" stroke={INK} strokeWidth={2.5} /></g>
          <path d="M40 0 A40 40 0 0 0 31 -25" stroke={B} strokeWidth={4} fill="none" className="art-draw" />
          <text x={50} y={-12} fontSize={12} fontWeight={800} fill={B}>θ</text>
          <text x={0} y={22} fontSize={12} fontWeight={700} fill={INK}>π рад = 180°</text>
        </g>
      );
  }
}
