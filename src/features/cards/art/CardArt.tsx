import type { ReactNode } from 'react';
import type { CardArt as ArtKind } from '@/types';

const G = '#22c55e';
const L = '#4ade80';
const M = '#1f4a33';
const I = 'currentColor';
const A = '#f59e0b';

const loop = { dur: '2.4s', repeatCount: 'indefinite' } as const;
const line = { stroke: I, strokeWidth: 3, strokeLinecap: 'round', fill: 'none' } as const;

function Axes() {
  return (
    <g stroke={I} strokeOpacity={0.25} strokeWidth={2}>
      <line x1={14} y1={96} x2={146} y2={96} />
      <line x1={30} y1={10} x2={30} y2={110} />
    </g>
  );
}

function Draw({ d, color = G, width = 4 }: { d: string; color?: string; width?: number }) {
  return (
    <path
      d={d}
      stroke={color}
      strokeWidth={width}
      strokeLinecap="round"
      fill="none"
      pathLength={100}
      strokeDasharray={100}
    >
      <animate attributeName="stroke-dashoffset" values="100;0;0" keyTimes="0;0.6;1" {...loop} />
    </path>
  );
}

function Pulse({ cx, cy, r = 6, color = A }: { cx: number; cy: number; r?: number; color?: string }) {
  return (
    <circle cx={cx} cy={cy} r={r} fill={color}>
      <animate attributeName="r" values={`${r};${r * 1.6};${r}`} {...loop} />
    </circle>
  );
}

function merge() {
  return (
    <>
      <circle cy={60} r={18} fill={G}>
        <animate attributeName="cx" values="38;68;38" {...loop} />
      </circle>
      <circle cy={60} r={18} fill={L} fillOpacity={0.85}>
        <animate attributeName="cx" values="122;92;122" {...loop} />
      </circle>
      <text x={80} y={66} textAnchor="middle" fontSize={20} fontWeight={900} fill={I}>
        +
      </text>
    </>
  );
}

function split() {
  return (
    <>
      <rect x={40} y={44} width={40} height={32} rx={8} fill={G}>
        <animate attributeName="x" values="40;24;40" {...loop} />
      </rect>
      <rect x={80} y={44} width={40} height={32} rx={8} fill={L}>
        <animate attributeName="x" values="80;96;80" {...loop} />
      </rect>
      <text x={80} y={100} textAnchor="middle" fontSize={18} fontWeight={900} fill={I}>
        −
      </text>
    </>
  );
}

function grid(v?: string) {
  const rows = v === '2' ? 2 : 3;
  const cols = 4;
  return (
    <>
      {Array.from({ length: rows * cols }).map((_, i) => (
        <circle
          key={i}
          cx={44 + (i % cols) * 24}
          cy={60 - (rows - 1) * 12 + Math.floor(i / cols) * 24}
          r={8}
          fill={i < cols ? G : L}
        >
          <animate attributeName="opacity" values="0.15;1;1" begin={`${i * 0.12}s`} {...loop} />
        </circle>
      ))}
      <text x={80} y={112} textAnchor="middle" fontSize={13} fontWeight={800} fill={I}>
        {rows} × {cols}
      </text>
    </>
  );
}

function pie(v?: string) {
  return (
    <>
      <circle cx={80} cy={60} r={40} fill={M} />
      <circle
        cx={80}
        cy={60}
        r={20}
        fill="none"
        stroke={G}
        strokeWidth={40}
        pathLength={100}
        strokeDasharray="0 100"
        transform="rotate(-90 80 60)"
      >
        <animate attributeName="stroke-dasharray" values="0 100;25 75;25 75" {...loop} />
      </circle>
      {v === 'pct' && (
        <text x={80} y={66} textAnchor="middle" fontSize={18} fontWeight={900} fill={I}>
          %
        </text>
      )}
      {v === 'ratio' && (
        <text x={80} y={66} textAnchor="middle" fontSize={16} fontWeight={900} fill={I}>
          1:3
        </text>
      )}
    </>
  );
}

function remainder() {
  return (
    <>
      {Array.from({ length: 17 }).map((_, i) => {
        const group = Math.floor(i / 5);
        const left = i >= 15;
        return (
          <circle
            key={i}
            cx={left ? 128 : 22 + group * 34 + (i % 5) * 6}
            cy={left ? 50 + (i - 15) * 18 : 40 + (i % 5) * 9}
            r={left ? 7 : 4}
            fill={left ? A : G}
          >
            {left && <animate attributeName="opacity" values="1;0.3;1" {...loop} />}
          </circle>
        );
      })}
      <text x={56} y={100} textAnchor="middle" fontSize={12} fontWeight={800} fill={I}>
        17 ÷ 5 = 3
      </text>
      <text x={128} y={100} textAnchor="middle" fontSize={12} fontWeight={800} fill={A}>
        r 2
      </text>
    </>
  );
}

function numberline(v?: string) {
  const ticks = [20, 40, 60, 80, 100, 120, 140];
  const open = v === 'lt';
  const toLeft = v === 'le' || v === 'lt' || v === 'max';
  const ray = toLeft ? 'M80 62 L22 62' : 'M80 62 L138 62';
  if (v === 'seq' || v === 'int') {
    return (
      <>
        <line x1={10} y1={70} x2={150} y2={70} {...line} />
        {ticks.map((x, i) => (
          <g key={x}>
            <line x1={x} y1={64} x2={x} y2={76} {...line} strokeWidth={2} />
            <text x={x} y={94} textAnchor="middle" fontSize={11} fill={I} fillOpacity={0.6}>
              {i - 3}
            </text>
            <circle cx={x} cy={70} r={5} fill={v === 'seq' && (i < 2 || i > 4) ? M : G}>
              <animate attributeName="cy" values="70;56;70" begin={`${i * 0.2}s`} {...loop} />
            </circle>
          </g>
        ))}
      </>
    );
  }
  return (
    <>
      <line x1={10} y1={80} x2={150} y2={80} {...line} />
      {ticks.map((x) => (
        <line key={x} x1={x} y1={74} x2={x} y2={86} {...line} strokeWidth={2} />
      ))}
      <Draw d={ray} width={6} />
      <circle cx={80} cy={62} r={7} fill={open ? '#0e1c15' : G} stroke={G} strokeWidth={3} />
      <text x={80} y={40} textAnchor="middle" fontSize={18} fontWeight={900} fill={I}>
        {v === 'ge' ? '≥' : v === 'le' ? '≤' : v === 'lt' ? '<' : 'max'}
      </text>
    </>
  );
}

function perp() {
  return (
    <>
      <line x1={30} y1={96} x2={130} y2={96} {...line} stroke={G} strokeWidth={5} />
      <line x1={80} y1={96} x2={80} y2={16} {...line} stroke={L} strokeWidth={5} />
      <rect x={80} y={80} width={16} height={16} fill="none" stroke={A} strokeWidth={3}>
        <animate attributeName="opacity" values="1;0.2;1" {...loop} />
      </rect>
      <text x={112} y={60} fontSize={14} fontWeight={800} fill={I}>
        90°
      </text>
    </>
  );
}

function circle(v?: string) {
  return (
    <>
      <circle cx={80} cy={60} r={40} fill={v === 'area' ? M : 'none'} stroke={G} strokeWidth={4}>
        {v === 'area' && <animate attributeName="fill-opacity" values="0.2;1;0.2" {...loop} />}
      </circle>
      {v === 'c' && (
        <circle
          cx={80}
          cy={60}
          r={40}
          fill="none"
          stroke={A}
          strokeWidth={5}
          pathLength={100}
          strokeDasharray={100}
          transform="rotate(-90 80 60)"
        >
          <animate attributeName="stroke-dashoffset" values="100;0;0" keyTimes="0;0.7;1" {...loop} />
        </circle>
      )}
      <circle cx={80} cy={60} r={4} fill={I} />
      {v !== 'c' && (
        <line x1={80} y1={60} x2={120} y2={60} stroke={A} strokeWidth={4} strokeLinecap="round">
          <animateTransform
            attributeName="transform"
            type="rotate"
            values="0 80 60;360 80 60"
            dur="4s"
            repeatCount="indefinite"
          />
        </line>
      )}
      {v === 'eq' && (
        <text x={80} y={114} textAnchor="middle" fontSize={11} fontWeight={800} fill={I}>
          (h, k), r
        </text>
      )}
    </>
  );
}

function triangle(v?: string) {
  return (
    <>
      <path d="M30 96 L130 96 L30 24 Z" fill={v === 'area' ? M : 'none'} stroke={G} strokeWidth={4}>
        {v === 'area' && <animate attributeName="fill-opacity" values="0.2;1;0.2" {...loop} />}
      </path>
      <rect x={30} y={82} width={14} height={14} fill="none" stroke={I} strokeWidth={2} />
      <Draw d="M130 96 L30 24" color={A} width={5} />
      {v === '30' ? (
        <>
          <text x={36} y={42} fontSize={11} fontWeight={800} fill={I}>
            60°
          </text>
          <text x={102} y={90} fontSize={11} fontWeight={800} fill={I}>
            30°
          </text>
        </>
      ) : (
        <>
          <text x={16} y={64} fontSize={13} fontWeight={800} fill={I}>
            a
          </text>
          <text x={78} y={112} fontSize={13} fontWeight={800} fill={I}>
            b
          </text>
          <text x={86} y={54} fontSize={13} fontWeight={800} fill={A}>
            c
          </text>
        </>
      )}
    </>
  );
}

function bars(v?: string) {
  const hs = [30, 52, 44, 70, 38];
  return (
    <>
      {hs.map((h, i) => (
        <rect
          key={i}
          x={26 + i * 24}
          y={100 - h}
          width={16}
          height={h}
          rx={4}
          fill={v === 'median' && i === 2 ? A : G}
        >
          <animate attributeName="height" values={`0;${h};${h}`} keyTimes="0;0.5;1" {...loop} />
          <animate attributeName="y" values={`100;${100 - h};${100 - h}`} keyTimes="0;0.5;1" {...loop} />
        </rect>
      ))}
      {v === 'mean' && (
        <line x1={18} y1={53} x2={142} y2={53} stroke={A} strokeWidth={3} strokeDasharray="6 5">
          <animate attributeName="opacity" values="0;0;1" keyTimes="0;0.5;1" {...loop} />
        </line>
      )}
    </>
  );
}

function parabola(v?: string) {
  const touch = v === 'one';
  const d = touch ? 'M34 16 Q80 176 126 16' : 'M30 16 Q80 156 130 16';
  const vy = touch ? 96 : 86;
  return (
    <>
      <Axes />
      <Draw d={d} />
      {v === 'two' && (
        <>
          <Pulse cx={51} cy={96} r={5} />
          <Pulse cx={109} cy={96} r={5} />
        </>
      )}
      {(v === 'vertex' || touch) && <Pulse cx={80} cy={vy} r={5} />}
    </>
  );
}

function cross() {
  return (
    <>
      <Axes />
      <Draw d="M34 100 L130 20" />
      <Draw d="M34 30 L134 92" color={L} />
      <Pulse cx={85} cy={58} />
    </>
  );
}

function dice() {
  const dots = [
    [62, 42],
    [98, 42],
    [80, 60],
    [62, 78],
    [98, 78],
  ];
  return (
    <g>
      <animateTransform
        attributeName="transform"
        type="rotate"
        values="-8 80 60;8 80 60;-8 80 60"
        {...loop}
      />
      <rect x={46} y={26} width={68} height={68} rx={14} fill="#fff" stroke={G} strokeWidth={4} />
      {dots.map(([cx, cy]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={6} fill="#0c1a12" />
      ))}
    </g>
  );
}

function power(v?: string) {
  if (v === 'eq') {
    return (
      <text x={80} y={68} textAnchor="middle" fontSize={20} fontWeight={900} fill={I}>
        2(x+3)
        <tspan fill={A}> ≡ </tspan>
        <tspan fill={G}>2x+6</tspan>
      </text>
    );
  }
  return (
    <>
      <text x={70} y={84} textAnchor="middle" fontSize={56} fontWeight={900} fill={G}>
        2
      </text>
      <text x={100} y={44} textAnchor="middle" fontSize={26} fontWeight={900} fill={A}>
        5
        <animate attributeName="y" values="44;34;44" {...loop} />
      </text>
    </>
  );
}

function solid(v?: string) {
  const bob = <animateTransform attributeName="transform" type="translate" values="0 0;0 -5;0 0" {...loop} />;
  if (v === 'sphere') {
    return (
      <g>
        {bob}
        <circle cx={80} cy={60} r={40} fill={M} stroke={G} strokeWidth={4} />
        <ellipse
          cx={80}
          cy={60}
          rx={40}
          ry={12}
          fill="none"
          stroke={G}
          strokeWidth={2}
          strokeDasharray="5 4"
        />
      </g>
    );
  }
  if (v === 'cone') {
    return (
      <g>
        {bob}
        <path d="M44 92 L80 18 L116 92" fill={M} stroke={G} strokeWidth={4} strokeLinejoin="round" />
        <ellipse cx={80} cy={92} rx={36} ry={10} fill={M} stroke={G} strokeWidth={4} />
      </g>
    );
  }
  return (
    <g>
      {bob}
      <rect x={44} y={28} width={72} height={64} fill={M} />
      <line x1={44} y1={28} x2={44} y2={92} stroke={G} strokeWidth={4} />
      <line x1={116} y1={28} x2={116} y2={92} stroke={G} strokeWidth={4} />
      <ellipse cx={80} cy={92} rx={36} ry={10} fill={M} stroke={G} strokeWidth={4} />
      <ellipse cx={80} cy={28} rx={36} ry={10} fill="#2a6145" stroke={G} strokeWidth={4} />
    </g>
  );
}

function rect() {
  return (
    <>
      <rect x={34} y={30} width={92} height={56} rx={4} fill={M} stroke={G} strokeWidth={4}>
        <animate attributeName="fill-opacity" values="0.2;1;0.2" {...loop} />
      </rect>
      <text x={80} y={104} textAnchor="middle" fontSize={14} fontWeight={800} fill={I}>
        ℓ
      </text>
      <text x={138} y={62} fontSize={14} fontWeight={800} fill={I}>
        w
      </text>
    </>
  );
}

function angle() {
  return (
    <>
      <line x1={40} y1={90} x2={136} y2={90} {...line} stroke={G} strokeWidth={5} />
      <line x1={40} y1={90} x2={130} y2={90} stroke={L} strokeWidth={5} strokeLinecap="round">
        <animateTransform
          attributeName="transform"
          type="rotate"
          values="0 40 90;-60 40 90;-60 40 90"
          keyTimes="0;0.6;1"
          {...loop}
        />
      </line>
      <path d="M72 90 A32 32 0 0 0 56 62" fill="none" stroke={A} strokeWidth={4} strokeLinecap="round" />
      <text x={84} y={74} fontSize={13} fontWeight={800} fill={I}>
        θ
      </text>
    </>
  );
}

function lineArt(v?: string) {
  if (v === 'prop') {
    return (
      <>
        <Axes />
        <Draw d="M30 96 L136 20" />
        <Pulse cx={30} cy={96} r={5} />
        <text x={110} y={58} fontSize={13} fontWeight={800} fill={I}>
          y=kx
        </text>
      </>
    );
  }
  return (
    <>
      <Axes />
      <Draw d="M20 104 L140 24" />
      {v === 'slope' && (
        <>
          <path d="M62 76 L102 76 L102 50" fill="none" stroke={A} strokeWidth={3} strokeDasharray="5 4" />
          <text x={78} y={90} fontSize={11} fontWeight={800} fill={I}>
            run
          </text>
          <text x={106} y={66} fontSize={11} fontWeight={800} fill={I}>
            rise
          </text>
        </>
      )}
      {(v === 'icept' || v === 'const') && <Pulse cx={30} cy={97} />}
      {v === 'coef' && (
        <text x={92} y={100} fontSize={16} fontWeight={900} fill={A}>
          7x
        </text>
      )}
    </>
  );
}

export const ART: Record<ArtKind, (v?: string) => ReactNode> = {
  merge,
  split,
  grid,
  pie,
  remainder,
  line: lineArt,
  numberline,
  perp,
  circle,
  triangle,
  bars,
  parabola,
  cross,
  dice,
  power,
  solid,
  rect,
  angle,
};

export function CardArt({ art, v, className = '' }: { art: ArtKind; v?: string; className?: string }) {
  const draw = ART[art] ?? ART.merge;
  return (
    <svg viewBox="0 0 160 120" className={className} aria-hidden="true" data-art={art}>
      {draw(v)}
    </svg>
  );
}
