// Суу — the SuuPrep black cat. Redrawn from the pitch deck: round wide head,
// tall pointed ears with dark-green inner ears, lime almond eyes with slit pupils,
// tiny pink nose, white ω mouth, long whiskers and faint hatch texture.
import { CSSProperties } from 'react';

export type CatMood = 'idle' | 'happy' | 'think' | 'wow' | 'sleep' | 'wink' | 'focus';

const CAT = 'var(--c-cat)';
const RIM = 'var(--c-cat-rim)';
const EAR = '#2f5e2b';
const EYE = '#8fc53b';
const EYE_EDGE = '#4f7d1f';
const PUPIL = '#101a08';
const NOSE = '#efb3aa';

const EYES = { l: { cx: 64, cy: 108, rot: 7 }, r: { cx: 136, cy: 108, rot: -7 } };

function Eyes({ mood, look = 0 }: { mood: CatMood; look?: number }) {
  if (mood === 'happy' || mood === 'sleep') {
    const d = mood === 'happy' ? 'M46 110 Q64 92 82 110 M118 110 Q136 92 154 110' : 'M46 106 Q64 118 82 106 M118 106 Q136 118 154 106';
    return <path d={d} stroke={EYE} strokeWidth={5.5} strokeLinecap="round" fill="none" />;
  }
  if (mood === 'wink') {
    return (
      <g>
        <Eye {...EYES.l} look={look} />
        <path d="M118 108 Q136 92 154 108" stroke={EYE} strokeWidth={5.5} strokeLinecap="round" fill="none" />
      </g>
    );
  }
  const round = mood === 'wow';
  const narrow = mood === 'focus';
  const dy = mood === 'think' ? -4 : 0;
  const dx = mood === 'think' ? 5 : look;
  return (
    <g>
      <Eye {...EYES.l} look={dx} lookY={dy} round={round} narrow={narrow} />
      <Eye {...EYES.r} look={dx} lookY={dy} round={round} narrow={narrow} />
    </g>
  );
}

function Eye({ cx, cy, rot, look = 0, lookY = 0, round, narrow }: { cx: number; cy: number; rot: number; look?: number; lookY?: number; round?: boolean; narrow?: boolean }) {
  const ry = narrow ? 9 : 14;
  return (
    <g transform={`rotate(${rot} ${cx} ${cy})`}>
      <g className="cat-eye">
        <ellipse cx={cx} cy={cy} rx={20} ry={ry} fill={EYE} stroke={EYE_EDGE} strokeWidth={1.3} />
        {round ? (
          <ellipse cx={cx + look} cy={cy + lookY} rx={8} ry={9} fill={PUPIL} />
        ) : (
          <ellipse cx={cx + look} cy={cy + lookY} rx={3.2} ry={narrow ? 8 : 12} fill={PUPIL} />
        )}
        <circle cx={cx + look + 5} cy={cy + lookY - 5} r={2.8} fill="#fff" />
      </g>
    </g>
  );
}

function Head({ mood, look }: { mood: CatMood; look?: number }) {
  const ivory = '#f4efe4';
  const mouth =
    mood === 'wow'
      ? <ellipse cx={100} cy={141} rx={4} ry={4.5} fill="none" stroke={ivory} strokeWidth={2} />
      : mood === 'happy' || mood === 'wink'
        ? <path d="M90 136 Q95 144 100 137 Q105 144 110 136" stroke={ivory} strokeWidth={2.2} fill="none" strokeLinecap="round" />
        : <path d="M92 137 Q96 142 100 137 Q104 142 108 137" stroke={ivory} strokeWidth={2} fill="none" strokeLinecap="round" />;
  return (
    <g>
      {/* ears */}
      <path d="M22 92 C22 62 32 34 42 14 Q45 8 50 12 C64 24 80 36 96 50 Z" fill={CAT} stroke={RIM} strokeWidth={2} strokeLinejoin="round" />
      <path d="M178 92 C178 62 168 34 158 14 Q155 8 150 12 C136 24 120 36 104 50 Z" fill={CAT} stroke={RIM} strokeWidth={2} strokeLinejoin="round" />
      {/* head */}
      <path d="M16 106 C14 64 52 44 100 44 C148 44 186 64 184 106 C183 148 148 172 100 172 C52 172 17 148 16 106 Z" fill={CAT} stroke={RIM} strokeWidth={2} />
      {/* inner ears */}
      <path d="M44 24 C54 34 68 44 80 52 C68 54 56 58 46 66 C46 52 44 38 44 24 Z" fill={EAR} />
      <path d="M156 24 C146 34 132 44 120 52 C132 54 144 58 154 66 C154 52 156 38 156 24 Z" fill={EAR} />
      {/* hatch texture */}
      <g stroke="#ffffff" strokeOpacity={0.12} strokeWidth={1.2} strokeLinecap="round">
        <path d="M58 66 L72 58" /><path d="M86 62 L100 54" /><path d="M122 64 L136 56" /><path d="M146 76 L158 69" />
        <path d="M34 128 L46 120" /><path d="M156 132 L168 124" /><path d="M64 156 L78 148" /><path d="M116 158 L130 150" />
        <path d="M160 96 L170 90" /><path d="M30 96 L40 90" /><path d="M92 84 L104 77" />
      </g>
      <Eyes mood={mood} look={look} />
      {/* nose + mouth */}
      <path d="M95 128 Q100 125 105 128 Q102 134 100 134 Q98 134 95 128 Z" fill={NOSE} />
      {mouth}
      {/* whiskers */}
      <g stroke="var(--c-whisker)" strokeWidth={1.2} strokeLinecap="round" fill="none">
        <path d="M60 134 Q30 130 0 131" /><path d="M60 140 Q32 142 4 148" /><path d="M62 146 Q40 154 14 164" />
        <path d="M140 134 Q170 130 200 131" /><path d="M140 140 Q168 142 196 148" /><path d="M138 146 Q160 154 186 164" />
      </g>
    </g>
  );
}

export function CatHead({ size = 96, mood = 'idle', look = 0, className = '', style }: { size?: number; mood?: CatMood; look?: number; className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 200 175" width={size} height={size * 0.875} className={className} style={style} role="img" aria-label="Суу муур">
      <Head mood={mood} look={look} />
    </svg>
  );
}

/** Seated full-body Суу with green scarf (as in the deck's intro & method slides). */
export function CatSitting({ size = 140, mood = 'idle', scarf = true, className = '', style }: { size?: number; mood?: CatMood; scarf?: boolean; className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 220 300" width={size} height={size * (300 / 220)} className={className} style={style} role="img" aria-label="Суу муур">
      {/* tail */}
      <path d="M150 268 C196 268 214 236 200 206 C192 190 176 192 180 206 C186 226 176 250 146 252 Z" fill={CAT} stroke={RIM} strokeWidth={2} />
      {/* body */}
      <path d="M62 150 C44 196 40 250 52 276 C60 292 160 292 168 276 C180 250 176 196 158 150 Z" fill={CAT} stroke={RIM} strokeWidth={2} />
      {/* front legs */}
      <path d="M84 200 L82 284" stroke="#2a2a2a" strokeWidth={2} strokeOpacity={0.7} />
      <path d="M136 200 L138 284" stroke="#2a2a2a" strokeWidth={2} strokeOpacity={0.7} />
      <ellipse cx={86} cy={284} rx={16} ry={7} fill={CAT} />
      <ellipse cx={134} cy={284} rx={16} ry={7} fill={CAT} />
      <g stroke="#ffffff" strokeOpacity={0.12} strokeWidth={1.2} strokeLinecap="round">
        <path d="M70 220 L82 212" /><path d="M130 236 L144 228" /><path d="M100 258 L112 250" />
      </g>
      <g transform="translate(10 0)">
        <Head mood={mood} />
      </g>
      {scarf && (
        <g>
          <path d="M60 160 Q110 182 162 160 L164 176 Q110 198 58 176 Z" fill="var(--c-leaf)" />
          <path d="M126 176 L138 222 L120 220 L114 180 Z" fill="var(--c-leaf)" />
          <path d="M60 166 Q110 186 160 166" stroke="#ffffff" strokeOpacity={0.25} strokeWidth={1.5} fill="none" />
        </g>
      )}
    </svg>
  );
}

/** Suu peeking over an edge (pricing slide). */
export function CatPeek({ size = 120, mood = 'idle', className = '' }: { size?: number; mood?: CatMood; className?: string }) {
  return (
    <svg viewBox="0 0 200 150" width={size} height={size * 0.75} className={className} role="img" aria-label="Суу муур">
      <g transform="translate(0 -10)"><Head mood={mood} /></g>
      <rect x={0} y={138} width={200} height={14} fill="var(--c-paper)" />
      <ellipse cx={62} cy={140} rx={18} ry={9} fill={CAT} />
      <ellipse cx={138} cy={140} rx={18} ry={9} fill={CAT} />
      <g stroke="var(--c-whisker)" strokeWidth={1}><path d="M56 136 L56 144" /><path d="M64 136 L64 144" /><path d="M132 136 L132 144" /><path d="M140 136 L140 144" /></g>
    </svg>
  );
}

/** Curled sleeping Суу (rest/empty states). */
export function CatSleeping({ size = 120, className = '' }: { size?: number; className?: string }) {
  return (
    <svg viewBox="0 0 220 120" width={size} height={size * (120 / 220)} className={className} role="img" aria-label="Унтаж буй Суу">
      <path d="M20 100 C10 50 70 18 130 22 C186 26 214 64 204 96 C200 110 30 112 20 100 Z" fill={CAT} stroke={RIM} strokeWidth={2} />
      <path d="M40 98 C70 84 120 92 160 96" stroke="#ffffff" strokeOpacity={0.12} strokeWidth={2} fill="none" />
      <path d="M150 40 L158 14 L170 36 Z" fill={CAT} />
      <path d="M176 44 L190 22 L194 50 Z" fill={CAT} />
      <path d="M156 62 Q164 68 172 62" stroke={EYE} strokeWidth={3} strokeLinecap="round" fill="none" />
      <path d="M180 64 Q188 70 194 64" stroke={EYE} strokeWidth={3} strokeLinecap="round" fill="none" />
      <text x={178} y={18} fontFamily="var(--font-display)" fontWeight={700} fontSize={14} fill="var(--c-ink-3)">z</text>
      <text x={192} y={8} fontFamily="var(--font-display)" fontWeight={700} fontSize={10} fill="var(--c-ink-3)">z</text>
    </svg>
  );
}
