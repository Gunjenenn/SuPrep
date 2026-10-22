// Graph model: turns typed rows into plottable objects, finds points of interest
// (roots, y-intercepts, extrema, intersections) and checks equivalence for lessons.
import { Env, Node, RelOp, evaluate, fmt, parseExpr, splitRelation, toTex, vars, REL_TEX } from './expr';

export type Row =
  | { id: string; kind: 'expr'; text: string; color: string; hidden?: boolean }
  | { id: string; kind: 'table'; xs: string[]; ys: string[]; color: string; regression?: boolean; hidden?: boolean };

export type Parsed =
  | { kind: 'empty' }
  | { kind: 'error'; message: string }
  | { kind: 'func'; f: (x: number, env: Env) => number; rel: RelOp; tex: string; deps: Set<string> }
  | { kind: 'vline'; c: (env: Env) => number; rel: RelOp; tex: string; deps: Set<string> }
  | { kind: 'implicit'; F: (x: number, y: number, env: Env) => number; tex: string; deps: Set<string> }
  | { kind: 'point'; px: Node; py: Node; tex: string; deps: Set<string> }
  | { kind: 'slider'; name: string; value: number; tex: string }
  | { kind: 'value'; n: Node; tex: string; deps: Set<string> }
  | { kind: 'table'; points: [number, number][]; reg?: { m: number; b: number; r2: number } };

export const PALETTE = ['#2f8a3e', '#c8513f', '#2878a0', '#7a55c7', '#c98a22', '#56605a'];
const RESERVED = new Set(['x', 'y']);

const flip: Record<RelOp, RelOp> = { '=': '=', '<': '>', '>': '<', '<=': '>=', '>=': '<=' };

export function parseRow(row: Row): Parsed {
  if (row.kind === 'table') return parseTable(row);
  const text = row.text.trim();
  if (!text) return { kind: 'empty' };
  try {
    // point (a, b)
    const pm = text.replace(/\s/g, '').match(/^\((.+),(.+)\)$/);
    if (pm && !/[=<>]/.test(text)) {
      const px = parseExpr(pm[1]), py = parseExpr(pm[2]);
      const deps = new Set([...vars(px), ...vars(py)]);
      return { kind: 'point', px, py, tex: `\\left(${toTex(px)},\\ ${toTex(py)}\\right)`, deps };
    }
    const rel = splitRelation(text);
    if (!rel) {
      const n = parseExpr(text);
      const deps = vars(n);
      if (deps.has('y')) return { kind: 'error', message: 'y-тэй илэрхийлэлд "=" тэмдэг хэрэгтэй' };
      if (!deps.has('x')) {
        return { kind: 'value', n, tex: toTex(n), deps };
      }
      deps.delete('x');
      return { kind: 'func', f: (x, env) => evaluate(n, { ...env, x }), rel: '=', tex: `y=${toTex(n)}`, deps };
    }
    let { lhs, op, rhs } = rel;
    const L = parseExpr(lhs), R = parseExpr(rhs);
    const lv = vars(L), rv = vars(R);
    const tex = `${toTex(L)}${REL_TEX[op]}${toTex(R)}`;
    // slider definition a = 3
    if (op === '=' && L.t === 'var' && !RESERVED.has(L.name) && rv.size === 0) {
      return { kind: 'slider', name: L.name, value: evaluate(R, {}), tex };
    }
    // f(x) = … style
    const fx = lhs.match(/^[a-wz]\(x\)$/);
    if (fx && op === '=' && !rv.has('y')) {
      const deps = new Set(rv); deps.delete('x');
      return { kind: 'func', f: (x, env) => evaluate(R, { ...env, x }), rel: '=', tex: `${lhs[0]}\\left(x\\right)=${toTex(R)}`, deps };
    }
    // y = f(x)
    if (L.t === 'var' && L.name === 'y' && !rv.has('y')) {
      const deps = new Set(rv); deps.delete('x');
      return { kind: 'func', f: (x, env) => evaluate(R, { ...env, x }), rel: op, tex, deps };
    }
    if (R.t === 'var' && R.name === 'y' && !lv.has('y')) {
      const deps = new Set(lv); deps.delete('x');
      return { kind: 'func', f: (x, env) => evaluate(L, { ...env, x }), rel: flip[op], tex, deps };
    }
    // x = c
    if (L.t === 'var' && L.name === 'x' && !rv.has('x') && !rv.has('y')) {
      return { kind: 'vline', c: (env) => evaluate(R, env), rel: op, tex, deps: rv };
    }
    const all = new Set([...lv, ...rv]);
    const F = (x: number, y: number, env: Env) => evaluate(L, { ...env, x, y }) - evaluate(R, { ...env, x, y });
    const deps = new Set(all); deps.delete('x'); deps.delete('y');
    if (!all.has('x') && !all.has('y')) {
      return { kind: 'error', message: 'Энэ тэгшитгэлд x эсвэл y алга' };
    }
    // linear in y → solve for y (handles 3x + 2y = 16, x − y = 2 …)
    if (all.has('y')) {
      const probe = { a: 1, b: 1, c: 1, m: 1, k: 1 } as Env;
      let linear = true, coefConst = true;
      let c0 = NaN;
      for (const x of [-2.3, 0.7, 3.1]) {
        const f0 = F(x, 0, probe), f1 = F(x, 1, probe), f2 = F(x, 2, probe), f5 = F(x, -5, probe);
        if (Math.abs(f2 - f1 - (f1 - f0)) > 1e-7 || Math.abs((f0 - f5) / 5 - (f1 - f0)) > 1e-7) linear = false;
        const c = f1 - f0;
        if (!Number.isNaN(c0) && Math.abs(c - c0) > 1e-9) coefConst = false;
        c0 = c;
      }
      if (linear && coefConst && Math.abs(c0) > 1e-12) {
        const f = (x: number, env: Env) => {
          const f0 = F(x, 0, env), c = F(x, 1, env) - f0;
          return -f0 / c;
        };
        // dividing by a negative y-coefficient flips the inequality
        const sign = c0 > 0 ? 1 : -1;
        const r: RelOp = sign > 0 ? op : flip[op];
        // F < 0  ⇔  c·y + f0 < 0  ⇔  y < −f0/c (c>0)
        return { kind: 'func', f, rel: r, tex, deps };
      }
      if (op !== '=') return { kind: 'error', message: 'Энэ тэнцэтгэл бишийг y-ээр бодож бичээрэй' };
      return { kind: 'implicit', F, tex, deps };
    }
    // only x: vertical line(s); support linear in x
    const g = (x: number, env: Env) => F(x, 0, env);
    const p = { a: 1, b: 1, c: 1 } as Env;
    const d1 = g(1, p) - g(0, p), d2 = g(2, p) - g(1, p);
    if (Math.abs(d1 - d2) < 1e-9 && Math.abs(d1) > 1e-12) {
      const sign = d1 > 0 ? 1 : -1;
      return { kind: 'vline', c: (env) => -g(0, env) / (g(1, env) - g(0, env)), rel: sign > 0 ? op : flip[op], tex, deps };
    }
    return { kind: 'implicit', F, tex, deps };
  } catch (e: any) {
    return { kind: 'error', message: e?.message || 'Ойлгосонгүй' };
  }
}

function parseTable(row: Extract<Row, { kind: 'table' }>): Parsed {
  const points: [number, number][] = [];
  row.xs.forEach((xs, i) => {
    const x = parseFloat(xs), y = parseFloat(row.ys[i]);
    if (Number.isFinite(x) && Number.isFinite(y)) points.push([x, y]);
  });
  let reg: { m: number; b: number; r2: number } | undefined;
  if (row.regression && points.length >= 2) {
    const n = points.length;
    const mx = points.reduce((s, p) => s + p[0], 0) / n;
    const my = points.reduce((s, p) => s + p[1], 0) / n;
    let sxy = 0, sxx = 0, syy = 0;
    for (const [x, y] of points) { sxy += (x - mx) * (y - my); sxx += (x - mx) ** 2; syy += (y - my) ** 2; }
    if (sxx > 0) {
      const m = sxy / sxx, b = my - m * mx;
      const r2 = syy === 0 ? 1 : (sxy * sxy) / (sxx * syy);
      reg = { m, b, r2 };
    }
  }
  return { kind: 'table', points, reg };
}

/** Evaluate slider values and constant rows in order. */
export function buildEnv(parsed: Parsed[]): Env {
  const env: Env = {};
  parsed.forEach((p) => { if (p.kind === 'slider') env[p.name] = p.value; });
  return env;
}

export function missingSliders(parsed: Parsed[], env: Env): string[] {
  const miss = new Set<string>();
  parsed.forEach((p) => {
    if ('deps' in p && p.deps) p.deps.forEach((d) => { if (!(d in env) && d !== 'x' && d !== 'y') miss.add(d); });
  });
  return [...miss];
}

// ———— points of interest ————
export type PoiKind = 'root' | 'yint' | 'max' | 'min' | 'intersection' | 'point';
export type Poi = { x: number; y: number; kind: PoiKind; rows: string[] };

function bisect(h: (x: number) => number, a: number, b: number) {
  let fa = h(a);
  for (let i = 0; i < 60; i++) {
    const m = (a + b) / 2, fm = h(m);
    if (fa * fm <= 0) b = m; else { a = m; fa = fm; }
  }
  return (a + b) / 2;
}

function zeros(h: (x: number) => number, x0: number, x1: number, N = 600): number[] {
  const out: number[] = [];
  const dx = (x1 - x0) / N;
  let px = x0, pv = h(x0);
  for (let i = 1; i <= N; i++) {
    const x = x0 + i * dx, v = h(x);
    if (Number.isFinite(pv) && Number.isFinite(v)) {
      if (pv === 0) out.push(px);
      else if (pv * v < 0) {
        const r = bisect(h, px, x);
        // reject asymptote sign flips
        if (Math.abs(h(r)) < 1e-6 * (1 + Math.abs(pv) + Math.abs(v))) out.push(r);
      }
    }
    px = x; pv = v;
  }
  // tangential zeros (double roots such as x² = 0)
  for (let i = 1; i < N; i++) {
    const a = h(x0 + (i - 1) * dx), b = h(x0 + i * dx), c = h(x0 + (i + 1) * dx);
    if ([a, b, c].every(Number.isFinite) && Math.abs(b) < Math.abs(a) && Math.abs(b) < Math.abs(c) && a * c > 0 && Math.sign(a) === Math.sign(b)) {
      const xm = golden((x) => Math.abs(h(x)), x0 + (i - 1) * dx, x0 + (i + 1) * dx);
      if (Math.abs(h(xm)) < 1e-7) out.push(xm);
    }
  }
  return dedupe(out);
}

function golden(f: (x: number) => number, a: number, b: number) {
  const g = (Math.sqrt(5) - 1) / 2;
  let c = b - g * (b - a), d = a + g * (b - a);
  for (let i = 0; i < 80; i++) {
    if (f(c) < f(d)) b = d; else a = c;
    c = b - g * (b - a); d = a + g * (b - a);
  }
  return (a + b) / 2;
}

function dedupe(xs: number[]) {
  const s = xs.sort((a, b) => a - b);
  return s.filter((v, i) => i === 0 || Math.abs(v - s[i - 1]) > 1e-5);
}

function snap(v: number) {
  const r = Math.round(v * 1e6) / 1e6;
  const i = Math.round(r);
  return Math.abs(r - i) < 1e-6 ? i : r;
}

export function findPois(rows: Row[], parsed: Parsed[], env: Env, x0: number, x1: number): Poi[] {
  const pois: Poi[] = [];
  const funcs: { id: string; f: (x: number) => number }[] = [];
  const vls: { id: string; c: number }[] = [];
  rows.forEach((r, i) => {
    const p = parsed[i];
    if (r.hidden) return;
    if (p.kind === 'func') funcs.push({ id: r.id, f: (x) => p.f(x, env) });
    if (p.kind === 'vline') { const c = p.c(env); if (Number.isFinite(c)) vls.push({ id: r.id, c }); }
    if (p.kind === 'point') {
      const x = evaluate(p.px, env), y = evaluate(p.py, env);
      if (Number.isFinite(x) && Number.isFinite(y)) pois.push({ x, y, kind: 'point', rows: [r.id] });
    }
  });
  const pad = (x1 - x0) * 0.1;
  const a = x0 - pad, b = x1 + pad;
  for (const { id, f } of funcs) {
    const y0 = f(0);
    if (Number.isFinite(y0) && 0 >= a && 0 <= b) pois.push({ x: 0, y: snap(y0), kind: 'yint', rows: [id] });
    for (const r of zeros(f, a, b)) pois.push({ x: snap(r), y: 0, kind: 'root', rows: [id] });
    // extrema via derivative sign change
    const N = 500, dx = (b - a) / N;
    for (let i = 1; i < N; i++) {
      const xa = a + (i - 1) * dx, xb = a + i * dx, xc = a + (i + 1) * dx;
      const fa = f(xa), fb = f(xb), fc = f(xc);
      if (![fa, fb, fc].every(Number.isFinite)) continue;
      if (fb > fa && fb > fc) { const xm = golden((x) => -f(x), xa, xc); pois.push({ x: snap(xm), y: snap(f(xm)), kind: 'max', rows: [id] }); }
      if (fb < fa && fb < fc) { const xm = golden((x) => f(x), xa, xc); pois.push({ x: snap(xm), y: snap(f(xm)), kind: 'min', rows: [id] }); }
    }
  }
  for (let i = 0; i < funcs.length; i++)
    for (let j = i + 1; j < funcs.length; j++) {
      const h = (x: number) => funcs[i].f(x) - funcs[j].f(x);
      for (const r of zeros(h, a, b)) pois.push({ x: snap(r), y: snap(funcs[i].f(r)), kind: 'intersection', rows: [funcs[i].id, funcs[j].id] });
    }
  for (const v of vls) {
    for (const fn of funcs) {
      const y = fn.f(v.c);
      if (Number.isFinite(y)) pois.push({ x: snap(v.c), y: snap(y), kind: 'intersection', rows: [v.id, fn.id] });
    }
    pois.push({ x: snap(v.c), y: 0, kind: 'root', rows: [v.id] });
  }
  return pois.filter((p) => Number.isFinite(p.x) && Number.isFinite(p.y));
}

export const POI_LABEL: Record<PoiKind, string> = {
  root: 'x тэнхлэгийг огтлох цэг (язгуур)',
  yint: 'y тэнхлэгийг огтлох цэг',
  max: 'Хамгийн их утга',
  min: 'Хамгийн бага утга',
  intersection: 'Огтлолцлын цэг',
  point: 'Цэг',
};

export const fmtPoint = (x: number, y: number) => `(${fmt(x)}, ${fmt(y)})`;

// ———— equivalence for lesson validation ————
const SAMPLE_X = [-3.7, -1.2, 0.5, 2.3, 4.1];

/** Does any visible row graph the same relation as `target` (e.g. "y = 2x + 1")? */
export function hasEquivalent(rows: Row[], parsed: Parsed[], env: Env, target: string): boolean {
  const t = parseRow({ id: 't', kind: 'expr', text: target, color: '' });
  return parsed.some((p, i) => !rows[i].hidden && equivalent(p, t, env));
}

export function equivalent(p: Parsed, t: Parsed, env: Env): boolean {
  if (p.kind === 'func' && t.kind === 'func') {
    if (p.rel !== t.rel) return false;
    return SAMPLE_X.every((x) => {
      const a = p.f(x, env), b = t.f(x, env);
      return Number.isFinite(a) && Number.isFinite(b) && Math.abs(a - b) < 1e-6 * (1 + Math.abs(b));
    });
  }
  if (p.kind === 'vline' && t.kind === 'vline') return Math.abs(p.c(env) - t.c(env)) < 1e-6 && p.rel === t.rel;
  return false;
}
