// H2b · Template question generator for fine-tuning data.
// Each template picks random numbers (seeded, so output is reproducible), computes the answer in code,
// and writes Mongolian hint / step-by-step explanation / wrong-choice reasons. Math is never typed by hand,
// so it can't be wrong. Run: `bun ai/pipeline/generate.ts` (prints a sample).
import type { Domain, Question } from '../../src/types';

// ——— seeded random ———
export type Rng = () => number;
export function mulberry32(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const int = (r: Rng, lo: number, hi: number) => lo + Math.floor(r() * (hi - lo + 1));
const pick = <T>(r: Rng, xs: readonly T[]): T => xs[Math.floor(r() * xs.length)] as T;
const nonZero = (r: Rng, lo: number, hi: number) => {
  let v = 0;
  while (v === 0) v = int(r, lo, hi);
  return v;
};
function shuffle<T>(r: Rng, xs: T[]): T[] {
  const a = [...xs];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [a[i], a[j]] = [a[j] as T, a[i] as T];
  }
  return a;
}

// ——— math formatting ———
const gcd = (a: number, b: number): number => (b === 0 ? Math.abs(a) : gcd(b, a % b));
/** Reduced fraction as TeX (no $), integers stay integers. */
export function frac(n: number, d: number): string {
  if (d < 0) return frac(-n, -d);
  const g = gcd(n, d) || 1;
  const [a, b] = [n / g, d / g];
  if (b === 1) return String(a);
  return a < 0 ? `-\\frac{${-a}}{${b}}` : `\\frac{${a}}{${b}}`;
}
/** "+ 5" / "- 5" for the term after the first one. */
const term = (b: number) => (b < 0 ? `- ${-b}` : `+ ${b}`);
/** Coefficient in front of a variable: 1x → x, -1x → -x. */
const coef = (a: number, v = 'x') => (a === 1 ? v : a === -1 ? `-${v}` : `${a}${v}`);
/** mx + b, dropping zero parts. */
const lin = (m: number, b: number, v = 'x') => (b === 0 ? coef(m, v) : `${coef(m, v)} ${term(b)}`);
/** Wrap negatives in parentheses for substitution: (-3). */
const par = (n: number) => (n < 0 ? `(${n})` : String(n));
const num = (n: number) => (Number.isInteger(n) ? String(n) : String(Number(n.toFixed(2))));

// ——— multiple choice builder ———
type Option = { tex: string; why?: string };
/** Shuffles correct + distractors. Returns null if options collide (caller retries). */
function mcq(r: Rng, correct: string, distractors: Option[]) {
  const seen = new Set([correct]);
  const ds = distractors.filter((d) => !seen.has(d.tex) && seen.add(d.tex));
  if (ds.length < 3) return null;
  const opts = shuffle(r, [{ tex: correct, why: undefined }, ...ds.slice(0, 3)]);
  const why: Record<number, string> = {};
  opts.forEach((o, i) => {
    if (o.why) why[i] = o.why;
  });
  return {
    choices: opts.map((o) => `$${o.tex}$`),
    answer: opts.findIndex((o) => o.tex === correct),
    why: Object.keys(why).length ? why : undefined,
  };
}

type Draft = Omit<Question, 'id' | 'domain' | 'skill' | 'difficulty'> & { difficulty?: 1 | 2 | 3 };
type Template = {
  key: string;
  domain: Domain;
  skill: string;
  difficulty: 1 | 2 | 3;
  make: (r: Rng) => Draft | null;
};

const WRONG_SIGN = 'Тэмдэг алдсан байна — хасах/нэмэхээ дахин шалга.';

// ——— templates ———
export const TEMPLATES: Template[] = [
  // ——— Algebra ———
  {
    key: 'lin-eq',
    domain: 'alg',
    skill: 'Linear equations',
    difficulty: 1,
    make: (r) => {
      const a = int(r, 2, 9);
      const x = int(r, -8, 12);
      const b = nonZero(r, -15, 15);
      const c = a * x + b;
      const step = b > 0 ? `Хоёр талаас $${b}$-г хас` : `Хоёр талд $${-b}$-г нэм`;
      return {
        prompt: `If $${lin(a, b)} = ${c}$, what is the value of $x$?`,
        answer: [String(x)],
        explain: `${step}: $${a}x = ${c - b}$. Одоо хоёр талыг $${a}$-д хуваа: $x = ${x}$.`,
        hint: '$x$-тэй гишүүнийг ганцааранг нь үлдээ, дараа нь коэффициентэд нь хуваа.',
        mn: 'value = утга',
        vocab: ['value'],
      };
    },
  },
  {
    key: 'lin-paren',
    domain: 'alg',
    skill: 'Linear equations',
    difficulty: 2,
    make: (r) => {
      const a = int(r, 2, 7);
      const b = nonZero(r, -9, 9);
      const x = int(r, -6, 10);
      const c = a * (x + b);
      return {
        prompt: `What value of $x$ satisfies the equation $${a}(x ${term(b)}) = ${c}$?`,
        answer: [String(x)],
        explain: `Хоёр талыг $${a}$-д хуваа: $x ${term(b)} = ${c / a}$. Тэгвэл $x = ${c / a} ${term(-b)} = ${x}$.`,
        hint: `Хаалтыг задлахын оронд эхлээд хоёр талыг $${a}$-д хуваавал амар.`,
        mn: 'satisfies = хангах (тэгшитгэлийг үнэн болгох)',
        vocab: ['satisfies', 'equation'],
      };
    },
  },
  {
    key: 'ineq',
    domain: 'alg',
    skill: 'Linear inequalities',
    difficulty: 1,
    make: (r) => {
      const a = int(r, 2, 8);
      const x = int(r, 1, 15);
      const b = int(r, 1, 20);
      if (r() < 0.5) {
        const c = a * x + b;
        return {
          prompt: `If $${a}x + ${b} \\le ${c}$, what is the greatest possible value of $x$?`,
          answer: [String(x)],
          explain: `$${b}$-г хас: $${a}x \\le ${c - b}$. $${a}$-д хуваа: $x \\le ${x}$. Хамгийн их утга нь $${x}$.`,
          hint: `Тэгшитгэл шиг бод: эхлээд $${b}$-г хас, дараа нь $${a}$-д хуваа.`,
          mn: 'greatest = хамгийн их',
          vocab: ['greatest', 'possible'],
        };
      }
      const c = a * x - b;
      return {
        prompt: `If $${a}x - ${b} \\ge ${c}$, what is the least possible value of $x$?`,
        answer: [String(x)],
        explain: `Хоёр талд $${b}$-г нэм: $${a}x \\ge ${c + b}$. $${a}$-д хуваа: $x \\ge ${x}$. Хамгийн бага утга нь $${x}$.`,
        hint: `Эхлээд $${b}$-г нэм, дараа нь $${a}$-д хуваа. Эерэг тоонд хуваахад тэмдэг өөрчлөгдөхгүй.`,
        mn: 'least = хамгийн бага',
        vocab: ['least', 'possible'],
      };
    },
  },
  {
    key: 'system',
    domain: 'alg',
    skill: 'Systems of linear equations',
    difficulty: 2,
    make: (r) => {
      const x = int(r, -4, 6);
      const y = int(r, -5, 9);
      const m1 = nonZero(r, -4, 5);
      let m2 = nonZero(r, -4, 5);
      if (m2 === m1) m2 = m1 + 1 === 0 ? m1 + 2 : m1 + 1;
      const b1 = y - m1 * x;
      const b2 = y - m2 * x;
      const q = mcq(r, String(x), [
        { tex: String(y), why: `$${y}$ бол $y$-ийн утга. Асуулт $x$-ийг асууж байна!` },
        { tex: String(x + y), why: `Асуулт $x+y$ биш — зөвхөн $x$.` },
        { tex: String(-x), why: WRONG_SIGN },
        { tex: String(x + 1), why: 'Тооцоогоо дахин шалга.' },
      ]);
      if (!q) return null;
      return {
        prompt: `$y = ${lin(m1, b1)}$ and $y = ${lin(m2, b2)}$. What is the value of $x$ for the solution $(x, y)$ of the system?`,
        ...q,
        explain: `Хоёр $y$-ийг тэнцүүл: $${lin(m1, b1)} = ${lin(m2, b2)}$ → $${m1 - m2}x = ${b2 - b1}$ → $x = ${x}$ (мөн $y = ${y}$).`,
        hint: 'Хоёр тэгшитгэл хоёулаа $y = …$ хэлбэртэй. Баруун талуудыг нь тэнцүүлээд үз.',
        desmos: {
          rows: [`y=${lin(m1, b1).replace(/ /g, '')}`, `y=${lin(m2, b2).replace(/ /g, '')}`],
          tip: `Хоёр шулууныг зур. Огтлолцлын цэг $(${x}, ${y})$.`,
        },
        mn: 'system = систем (хамт бодох тэгшитгэлүүд), solution = шийд',
        vocab: ['system', 'solution'],
      };
    },
  },
  {
    key: 'slope',
    domain: 'alg',
    skill: 'Linear functions',
    difficulty: 1,
    make: (r) => {
      const x1 = int(r, -5, 5);
      const y1 = int(r, -6, 8);
      const dx = int(r, 2, 6);
      const m = nonZero(r, -4, 5);
      const [x2, y2] = [x1 + dx, y1 + m * dx];
      const q = mcq(r, String(m), [
        {
          tex: String(m * dx),
          why: `$${m * dx}$ бол зөвхөн $y$-ийн өөрчлөлт. $x$-ийн өөрчлөлт болох $${dx}$-д хуваах ёстой.`,
        },
        {
          tex: frac(dx, m * dx),
          why: 'Харьцааг урвуу авсан: налуу = ($y$-ийн өөрчлөлт) / ($x$-ийн өөрчлөлт).',
        },
        { tex: String(-m), why: WRONG_SIGN },
        { tex: String(m + 1), why: 'Тооцоогоо дахин шалга.' },
      ]);
      if (!q) return null;
      return {
        prompt: `A line passes through the points $(${x1}, ${y1})$ and $(${x2}, ${y2})$. What is the slope of the line?`,
        ...q,
        explain: `Налуу $= \\frac{${y2} - ${par(y1)}}{${x2} - ${par(x1)}} = \\frac{${m * dx}}{${dx}} = ${m}$.`,
        hint: 'Налуу = ($y$-ийн өөрчлөлт) / ($x$-ийн өөрчлөлт). Хоёр цэгийн $y$-үүдийг хас, $x$-үүдийг хас.',
        mn: 'slope = налуу, passes through = дайрч өнгөрөх',
        vocab: ['slope', 'passes through'],
      };
    },
  },
  {
    key: 'fee-rate',
    domain: 'alg',
    skill: 'Linear equations in context',
    difficulty: 1,
    make: (r) => {
      const ctx = pick(r, [
        {
          s: 'A gym charges a one-time fee of FEE dollars plus RATE dollars per class. Maya paid TOTAL dollars in total. How many classes did she take?',
          u: 'хичээл',
        },
        {
          s: 'A taxi ride costs FEE dollars plus RATE dollars per mile. A ride cost TOTAL dollars. How many miles was the ride?',
          u: 'миль',
        },
        {
          s: 'A phone plan costs FEE dollars per month plus RATE dollars for each gigabyte of data used. One month the bill was TOTAL dollars. How many gigabytes were used?',
          u: 'гигабайт',
        },
      ] as const);
      const fee = 5 * int(r, 2, 12);
      const rate = int(r, 2, 15);
      const n = int(r, 2, 20);
      const total = fee + rate * n;
      return {
        prompt: ctx.s
          .replace('FEE', String(fee))
          .replace('RATE', String(rate))
          .replace('TOTAL', String(total)),
        answer: [String(n)],
        explain: `Тоо ширхэгийг $n$ гэвэл: $${fee} + ${rate}n = ${total}$ → $${rate}n = ${total - fee}$ → $n = ${n}$ ${ctx.u}.`,
        hint: `Тогтмол төлбөр ($${fee}$) нэг л удаа нэмэгдэнэ, $${rate}$ нь ${ctx.u} тус бүрд. Тэгшитгэл зохио.`,
        mn: 'one-time fee = нэг удаагийн төлбөр, per = тус бүрд, in total = нийт',
        vocab: ['per', 'in total'],
      };
    },
  },
  {
    key: 'intercept',
    domain: 'alg',
    skill: 'Linear equations in two variables',
    difficulty: 2,
    make: (r) => {
      const a = int(r, 2, 8);
      const b = nonZero(r, -9, 9);
      const xi = nonZero(r, -9, 9);
      const c = a * xi;
      return {
        prompt: `The graph of $${a}x ${term(b)}y = ${c}$ crosses the $x$-axis at the point $(k, 0)$. What is the value of $k$?`,
        answer: [String(xi)],
        explain: `$x$ тэнхлэг дээр $y = 0$. Орлуул: $${a}x = ${c}$ → $x = ${xi}$. Тэгэхээр $k = ${xi}$.`,
        hint: '$x$ тэнхлэгийг огтлох цэг дээр $y$ хэд байдаг вэ? Түүнийг орлуулаад үз.',
        mn: 'crosses the x-axis = x тэнхлэгийг огтлох',
        vocab: ['crosses', 'axis'],
      };
    },
  },
  // ——— Advanced Math ———
  {
    key: 'f-eval',
    domain: 'adv',
    skill: 'Function notation',
    difficulty: 1,
    make: (r) => {
      const a = nonZero(r, -3, 4);
      const b = int(r, -6, 6);
      const c = int(r, -9, 9);
      const k = nonZero(r, -3, 4);
      const v = a * k * k + b * k + c;
      const poly = `${coef(a, 'x^2')}${
        b
          ? ` ${term(b)
              .replace(/(\d+)$/, '$1x')
              .replace(/ 1x$/, ' x')}`
          : ''
      }${c ? ` ${term(c)}` : ''}`;
      return {
        prompt: `The function $f$ is defined by $f(x) = ${poly}$. What is the value of $f(${k})$?`,
        answer: [String(v)],
        explain: `$x$-ийн оронд $${k}$-г орлуул: $f(${k}) = ${a === 1 ? '' : a === -1 ? '-' : `${a}\\cdot`}${par(k)}^2 ${term(b)}\\cdot${par(k)} ${term(c)} = ${a * k * k} ${term(b * k)} ${term(c)} = ${v}$.`,
        hint: `$f(${k})$ гэдэг нь томьёоны $x$ бүрийн оронд $${k}$ тавина гэсэн үг. Сөрөг тоог хаалтанд хий.`,
        mn: 'defined by = ...-ээр тодорхойлогдсон',
        vocab: ['function', 'defined'],
      };
    },
  },
  {
    key: 'quad-roots',
    domain: 'adv',
    skill: 'Quadratic equations',
    difficulty: 2,
    make: (r) => {
      const r1 = nonZero(r, -6, 8);
      let r2 = nonZero(r, -6, 8);
      if (r2 === r1) r2 = -r1;
      if (r2 === r1) return null;
      const p = -(r1 + r2);
      const q = r1 * r2;
      const eq = `x^2${
        p
          ? ` ${term(p)
              .replace(/(\d+)$/, '$1x')
              .replace(/ 1x$/, ' x')}`
          : ''
      }${q ? ` ${term(q)}` : ''} = 0`;
      const factored = `(x ${term(-r1)})(x ${term(-r2)}) = 0`;
      return {
        prompt: `What is the sum of the solutions to the equation $${eq}$?`,
        answer: [String(r1 + r2)],
        explain: `Үржигдэхүүнд задал: $${factored}$. Шийдүүд нь $x = ${r1}$ ба $x = ${r2}$. Нийлбэр: $${r1} + ${par(r2)} = ${r1 + r2}$.`,
        hint: `Үржигдэхүүнд задлахыг оролд: үржвэр нь $${q}$ болох хоёр тоо хай. (Эсвэл: $x^2 + bx + c = 0$-ийн шийдүүдийн нийлбэр $= -b$.)`,
        mn: 'sum = нийлбэр, solutions = шийдүүд',
        vocab: ['sum', 'solutions'],
      };
    },
  },
  {
    key: 'exponents',
    domain: 'adv',
    skill: 'Exponent rules',
    difficulty: 1,
    make: (r) => {
      const a = int(r, 2, 9);
      const b = int(r, 2, 9);
      if (r() < 0.5) {
        return {
          prompt: `If $x^{${a}} \\cdot x^{${b}} = x^n$ for all positive values of $x$, what is the value of $n$?`,
          answer: [String(a + b)],
          explain: `Ижил суурьтай зэргүүдийг үржүүлэхэд зэргүүд нэмэгдэнэ: $x^{${a}} \\cdot x^{${b}} = x^{${a}+${b}} = x^{${a + b}}$. Тэгэхээр $n = ${a + b}$.`,
          hint: 'Ижил суурьтай зэргийг үржүүлэхэд зэргүүдэд юу болдог вэ — нэмэх үү, үржүүлэх үү?',
          mn: 'for all positive values = бүх эерэг утгад',
          vocab: ['positive', 'value'],
        };
      }
      return {
        prompt: `If $(x^{${a}})^{${b}} = x^n$ for all positive values of $x$, what is the value of $n$?`,
        answer: [String(a * b)],
        explain: `Зэргийг зэрэгт дэвшүүлэхэд зэргүүд үржигдэнэ: $(x^{${a}})^{${b}} = x^{${a}\\cdot${b}} = x^{${a * b}}$. Тэгэхээр $n = ${a * b}$.`,
        hint: 'Зэргийг дахин зэрэгт дэвшүүлэхэд зэргүүд үржигдэнэ үү, нэмэгдэнэ үү?',
        mn: 'for all positive values = бүх эерэг утгад',
        vocab: ['positive', 'value'],
      };
    },
  },
  {
    key: 'vertex-min',
    domain: 'adv',
    skill: 'Quadratic functions',
    difficulty: 2,
    make: (r) => {
      const a = int(r, 1, 4);
      const h = nonZero(r, -6, 6);
      const k = nonZero(r, -9, 9);
      const q = mcq(r, String(k), [
        {
          tex: String(h),
          why: `$${h}$ бол оройн $x$ координат. Асуулт $y$-ийн хамгийн бага утгыг асууж байна.`,
        },
        {
          tex: String(-h),
          why: `Хаалтан доторх тоо ба оройн $x$-ийг андуурсан байна — гэхдээ асуулт $y$-ийг асууж байна.`,
        },
        { tex: String(-k), why: WRONG_SIGN },
        { tex: String(k + a), why: '$x = h$ үед хаалт $0$ болно — $a$ нэмэгдэхгүй.' },
      ]);
      if (!q) return null;
      return {
        prompt: `What is the minimum value of the function $y = ${a === 1 ? '' : a}(x ${term(-h)})^2 ${term(k)}$?`,
        ...q,
        explain: `$(x ${term(-h)})^2 \\ge 0$, хамгийн бага нь $0$ ($x = ${h}$ үед). Тэгвэл $y = ${a}\\cdot 0 ${term(k)} = ${k}$. Оройн цэг $(${h}, ${k})$.`,
        hint: 'Квадрат хэзээ ч сөрөг болохгүй. Хаалт доторх илэрхийлэл $0$ болоход $y$ хэд вэ?',
        desmos: {
          rows: [`y=${a === 1 ? '' : a}(x${term(-h).replace(' ', '')})^2${term(k).replace(' ', '')}`],
          tip: `Параболын хамгийн доод цэг (орой) дээр дар: $(${h}, ${k})$.`,
        },
        mn: 'minimum value = хамгийн бага утга',
        vocab: ['minimum', 'value'],
      };
    },
  },
  {
    key: 'exp-growth',
    domain: 'adv',
    skill: 'Exponential growth',
    difficulty: 2,
    make: (r) => {
      const p0 = pick(r, [50, 100, 200, 300, 500] as const);
      const f = pick(r, [2, 3] as const);
      const t = int(r, 2, 4);
      const word = f === 2 ? 'doubles' : 'triples';
      const v = p0 * f ** t;
      return {
        prompt: `A population of bacteria starts at ${p0} and ${word} every hour. What will the population be after ${t} hours?`,
        answer: [String(v)],
        explain: `Цаг бүр $${f}$ дахин өснө: $${p0} \\cdot ${f}^{${t}} = ${p0} \\cdot ${f ** t} = ${v}$.`,
        hint: `"${word}" = ${f === 2 ? '2 дахин' : '3 дахин'} өсөх. ${t} цагийн дараа хэдэн удаа үржих вэ?`,
        mn: `${word} = ${f === 2 ? '2 дахин өсөх' : '3 дахин өсөх'}`,
        vocab: [word, 'population'],
      };
    },
  },
  // ——— Problem-Solving & Data Analysis ———
  {
    key: 'pct-of',
    domain: 'psda',
    skill: 'Percentages',
    difficulty: 1,
    make: (r) => {
      const p = pick(r, [10, 15, 20, 25, 30, 40, 60, 75] as const);
      const unit = 100 / gcd(p, 100);
      const n = unit * int(r, 2, 12);
      const v = (p * n) / 100;
      return {
        prompt: `What is ${p}% of ${n}?`,
        answer: [String(v)],
        explain: `${p}% $= ${p / 100}$. Тэгвэл $${p / 100} \\cdot ${n} = ${v}$.`,
        hint: 'Хувийг 100-д хуваагаад аравтын бутархай болго, дараа нь тоогоор үржүүл.',
        mn: 'of = -ын (үржүүлэх гэсэн үг)',
        vocab: ['percent', 'of'],
      };
    },
  },
  {
    key: 'pct-change',
    domain: 'psda',
    skill: 'Percent change',
    difficulty: 2,
    make: (r) => {
      const p = pick(r, [10, 20, 25, 50] as const);
      const unit = 100 / gcd(p, 100);
      const old = unit * int(r, 2, 10);
      const diff = (old * p) / 100;
      const nu = old + diff;
      const wrongNew = (diff / nu) * 100;
      const q = mcq(r, `${p}\\%`, [
        {
          tex: `${num(wrongNew)}\\%`,
          why: `Өөрчлөлтийг шинэ үнэд ($${nu}$) хуваасан байна. Анхны үнэ $${old}$-д хуваах ёстой.`,
        },
        { tex: `${100 + p}\\%`, why: `Энэ бол шинэ үнэ анхныхаа хэдэн хувь вэ гэдэг. Өсөлт нь $${p}\\%$.` },
        { tex: `${diff}\\%`, why: `$${diff}$ бол өөрчлөлтийн хэмжээ (доллар), хувь биш.` },
        { tex: `${p * 2}\\%`, why: 'Тооцоогоо дахин шалга.' },
      ]);
      if (!q) return null;
      return {
        prompt: `The price of a jacket increased from ${old} dollars to ${nu} dollars. By what percent did the price increase?`,
        ...q,
        explain: `Өөрчлөлт: $${nu} - ${old} = ${diff}$. Хувь $= \\frac{${diff}}{${old}} \\cdot 100\\% = ${p}\\%$.`,
        hint: 'Хувийн өөрчлөлт = (өөрчлөлт) / (АНХНЫ утга) · 100%.',
        mn: 'increased from … to … = …-аас …болж өссөн',
        vocab: ['increase', 'percent'],
      };
    },
  },
  {
    key: 'mean-missing',
    domain: 'psda',
    skill: 'Mean',
    difficulty: 2,
    make: (r) => {
      const mean = int(r, 10, 40);
      const four = Array.from({ length: 4 }, () => int(r, Math.max(1, mean - 12), mean + 12));
      const fifth = 5 * mean - four.reduce((s, v) => s + v, 0);
      if (fifth <= 0) return null;
      return {
        prompt: `The mean of five numbers is ${mean}. Four of the numbers are ${four.join(', ')}. What is the fifth number?`,
        answer: [String(fifth)],
        explain: `Тав тооны нийлбэр $= 5 \\cdot ${mean} = ${5 * mean}$. Дөрвийнх нь нийлбэр $${four.join(' + ')} = ${5 * mean - fifth}$. Тав дахь тоо $= ${5 * mean} - ${5 * mean - fifth} = ${fifth}$.`,
        hint: 'Дундаж × тооны тоо = нийлбэр. Эхлээд таван тооны нийлбэрийг ол.',
        mn: 'mean = дундаж',
        vocab: ['mean'],
      };
    },
  },
  {
    key: 'median',
    domain: 'psda',
    skill: 'Median',
    difficulty: 1,
    make: (r) => {
      const n = pick(r, [5, 7] as const);
      const xs = Array.from({ length: n }, () => int(r, 1, 50));
      const sorted = [...xs].sort((a, b) => a - b);
      const med = sorted[(n - 1) / 2] as number;
      return {
        prompt: `What is the median of the data set ${xs.join(', ')}?`,
        answer: [String(med)],
        explain: `Эхлээд эрэмбэл: ${sorted.join(', ')}. ${n} тоо байгаа тул голын (${(n + 1) / 2}-р) тоо нь $${med}$.`,
        hint: 'Медиан олохын өмнө тоонуудыг багаас их рүү эрэмбэлэх хэрэгтэй.',
        mn: 'median = медиан (эрэмбэлсний дараах голын тоо), data set = өгөгдлийн олонлог',
        vocab: ['median', 'data set'],
      };
    },
  },
  {
    key: 'unit-price',
    domain: 'psda',
    skill: 'Ratios and rates',
    difficulty: 1,
    make: (r) => {
      const u = int(r, 2, 12);
      const k = int(r, 3, 9);
      let m = int(r, 4, 20);
      if (m === k) m += 1;
      const item = pick(r, ['notebooks', 'apples', 'pens', 'tickets'] as const);
      return {
        prompt: `If ${k} ${item} cost ${k * u} dollars, how many dollars do ${m} ${item} cost at the same rate?`,
        answer: [String(m * u)],
        explain: `Нэгийнх нь үнэ: $${k * u} \\div ${k} = ${u}$ доллар. Тэгвэл ${m} ширхэг: $${m} \\cdot ${u} = ${m * u}$ доллар.`,
        hint: 'Эхлээд нэг ширхэгийн үнийг ол.',
        mn: 'at the same rate = ижил үнээр (харьцаагаар)',
        vocab: ['rate', 'cost'],
      };
    },
  },
  {
    key: 'speed',
    domain: 'psda',
    skill: 'Ratios and rates',
    difficulty: 1,
    make: (r) => {
      const s = 5 * int(r, 6, 16);
      const t = int(r, 2, 6);
      return {
        prompt: `A car travels ${s * t} miles in ${t} hours at a constant speed. What is the car's speed, in miles per hour?`,
        answer: [String(s)],
        explain: `Хурд = зам / хугацаа $= \\frac{${s * t}}{${t}} = ${s}$ миль/цаг.`,
        hint: 'Хурд = зам ÷ хугацаа.',
        mn: 'constant speed = тогтмол хурд, miles per hour = миль/цаг',
        vocab: ['constant', 'per'],
      };
    },
  },
  // ——— Geometry & Trigonometry ———
  {
    key: 'pythag',
    domain: 'geo',
    skill: 'Right triangles',
    difficulty: 1,
    make: (r) => {
      const [a, b, c] = pick(r, [
        [3, 4, 5],
        [5, 12, 13],
        [8, 15, 17],
        [7, 24, 25],
      ] as const);
      const k = int(r, 1, 4);
      const [A, B, C] = [a * k, b * k, c * k];
      if (r() < 0.5) {
        return {
          prompt: `A right triangle has legs of length ${A} and ${B}. What is the length of the hypotenuse?`,
          answer: [String(C)],
          explain: `Пифагорын теорем: $c^2 = ${A}^2 + ${B}^2 = ${A * A} + ${B * B} = ${C * C}$. Тэгвэл $c = \\sqrt{${C * C}} = ${C}$.`,
          hint: 'Пифагорын теорем: $a^2 + b^2 = c^2$, энд $c$ нь гипотенуз.',
          mn: 'legs = катетууд, hypotenuse = гипотенуз (тэгш өнцгийн эсрэг тал)',
          vocab: ['legs', 'hypotenuse'],
        };
      }
      return {
        prompt: `A right triangle has a hypotenuse of length ${C} and one leg of length ${A}. What is the length of the other leg?`,
        answer: [String(B)],
        explain: `$b^2 = ${C}^2 - ${A}^2 = ${C * C} - ${A * A} = ${B * B}$. Тэгвэл $b = ${B}$.`,
        hint: '$a^2 + b^2 = c^2$ — үл мэдэгдэх катетыг олохын тулд гипотенузын квадратаас хас.',
        mn: 'leg = катет, hypotenuse = гипотенуз',
        vocab: ['leg', 'hypotenuse'],
      };
    },
  },
  {
    key: 'circle-radius',
    domain: 'geo',
    skill: 'Circles',
    difficulty: 2,
    make: (r) => {
      const h = nonZero(r, -6, 6);
      const k = nonZero(r, -6, 6);
      const rad = int(r, 2, 9);
      const q = mcq(r, String(rad), [
        { tex: String(rad * rad), why: `$${rad * rad}$ бол $r^2$. Радиус нь түүний язгуур: $${rad}$.` },
        { tex: String(2 * rad), why: `$${2 * rad}$ бол диаметр. Радиус нь хагас нь.` },
        { tex: String(Math.abs(h)), why: 'Энэ бол төвийн координат, радиус биш.' },
        { tex: String(rad + 1), why: 'Тооцоогоо дахин шалга.' },
      ]);
      if (!q) return null;
      return {
        prompt: `The equation of a circle in the $xy$-plane is $(x ${term(-h)})^2 + (y ${term(-k)})^2 = ${rad * rad}$. What is the radius of the circle?`,
        ...q,
        explain: `Тойргийн тэгшитгэл $(x-h)^2 + (y-k)^2 = r^2$. Энд $r^2 = ${rad * rad}$ тул $r = ${rad}$. Төв нь $(${h}, ${k})$.`,
        hint: 'Тэгшитгэлийн баруун тал нь $r$ биш, $r^2$ гэдгийг санаарай.',
        mn: 'radius = радиус, xy-plane = координатын хавтгай',
        vocab: ['radius', 'equation'],
      };
    },
  },
  {
    key: 'tri-angle',
    domain: 'geo',
    skill: 'Angles in triangles',
    difficulty: 1,
    make: (r) => {
      const A = int(r, 25, 90);
      const B = int(r, 20, 160 - A);
      const C = 180 - A - B;
      return {
        prompt: `In triangle $ABC$, the measure of angle $A$ is $${A}^\\circ$ and the measure of angle $B$ is $${B}^\\circ$. What is the measure, in degrees, of angle $C$?`,
        answer: [String(C)],
        explain: `Гурвалжны өнцгүүдийн нийлбэр $180^\\circ$. $C = 180 - ${A} - ${B} = ${C}$.`,
        hint: 'Гурвалжны гурван өнцгийн нийлбэр хэд байдаг вэ?',
        mn: 'measure of angle = өнцгийн хэмжээ',
        vocab: ['measure', 'degrees'],
      };
    },
  },
  {
    key: 'rect-area',
    domain: 'geo',
    skill: 'Area and perimeter',
    difficulty: 2,
    make: (r) => {
      const L = int(r, 5, 20);
      const W = int(r, 2, L - 1);
      const P = 2 * (L + W);
      return {
        prompt: `A rectangle has a perimeter of ${P} centimeters and a length of ${L} centimeters. What is the area of the rectangle, in square centimeters?`,
        answer: [String(L * W)],
        explain: `Периметр $= 2(L + W)$: $${P} = 2(${L} + W)$ → $${P / 2} = ${L} + W$ → $W = ${W}$. Талбай $= ${L} \\cdot ${W} = ${L * W}$.`,
        hint: 'Эхлээд периметрээс өргөнийг ол. Дараа нь талбай = урт × өргөн.',
        mn: 'perimeter = периметр, area = талбай, length = урт',
        vocab: ['perimeter', 'area'],
      };
    },
  },
  {
    key: 'trig-ratio',
    domain: 'geo',
    skill: 'Right triangle trigonometry',
    difficulty: 2,
    make: (r) => {
      const [a, b, c] = pick(r, [
        [3, 4, 5],
        [5, 12, 13],
        [8, 15, 17],
        [7, 24, 25],
      ] as const);
      const k = int(r, 1, 3);
      const fn = pick(r, ['sin', 'cos'] as const);
      const correct = fn === 'sin' ? frac(a, c) : frac(b, c);
      const q = mcq(r, correct, [
        {
          tex: fn === 'sin' ? frac(b, c) : frac(a, c),
          why:
            fn === 'sin'
              ? 'Энэ бол $\\cos$ — зэргэлдээ тал / гипотенуз.'
              : 'Энэ бол $\\sin$ — эсрэг тал / гипотенуз.',
        },
        { tex: frac(a, b), why: 'Энэ бол $\\tan$ — эсрэг тал / зэргэлдээ тал.' },
        {
          tex: fn === 'sin' ? frac(c, a) : frac(c, b),
          why: 'Харьцааг урвуу авсан байна — гипотенуз хуваарьт байх ёстой.',
        },
        { tex: frac(b, a), why: 'Энэ бол урвуу $\\tan$.' },
      ]);
      if (!q) return null;
      return {
        prompt: `In right triangle $PQR$, angle $R$ is a right angle, $PR = ${b * k}$, $QR = ${a * k}$, and $PQ = ${c * k}$. What is the value of $\\${fn} P$?`,
        ...q,
        explain:
          fn === 'sin'
            ? `$P$ өнцгийн эсрэг тал нь $QR = ${a * k}$, гипотенуз нь $PQ = ${c * k}$. $\\sin P = \\frac{${a * k}}{${c * k}} = ${frac(a, c)}$.`
            : `$P$ өнцгийн зэргэлдээ тал нь $PR = ${b * k}$, гипотенуз нь $PQ = ${c * k}$. $\\cos P = \\frac{${b * k}}{${c * k}} = ${frac(b, c)}$.`,
        hint: 'SOH-CAH-TOA: $\\sin$ = эсрэг/гипотенуз, $\\cos$ = зэргэлдээ/гипотенуз. $P$ өнцгийн эсрэг тал аль нь вэ?',
        mn: 'right angle = тэгш өнцөг',
        vocab: ['right angle', 'value'],
      };
    },
  },
  {
    key: 'similar-tri',
    domain: 'geo',
    skill: 'Similar triangles',
    difficulty: 2,
    make: (r) => {
      const s = int(r, 2, 9);
      const t = int(r, 2, 12);
      const k = int(r, 2, 5);
      if (s === t) return null;
      return {
        prompt: `Triangle $ABC$ is similar to triangle $DEF$, where $A$ corresponds to $D$ and $B$ corresponds to $E$. If $AB = ${s}$, $DE = ${s * k}$, and $BC = ${t}$, what is the length of $EF$?`,
        answer: [String(t * k)],
        explain: `Төсөөтэй гурвалжны харгалзах талууд пропорциональ. Масштаб $= \\frac{DE}{AB} = \\frac{${s * k}}{${s}} = ${k}$. Тэгвэл $EF = ${k} \\cdot ${t} = ${t * k}$.`,
        hint: '$DE$ нь $AB$-ээс хэд дахин урт вэ? $EF$ ч мөн $BC$-ээс тэр хэмжээгээр урт.',
        mn: 'similar = төсөөтэй, corresponds to = харгалзах',
        vocab: ['similar', 'corresponds'],
      };
    },
  },
];

/** The plain final answer (choice text without $ for MCQ). */
export function finalAnswer(q: Pick<Question, 'answer' | 'choices'>): string {
  if (Array.isArray(q.answer)) return q.answer[0] ?? '';
  return (q.choices?.[q.answer] ?? '').replace(/\$/g, '');
}

/** True if `text` contains the final answer as a standalone value (2 does not match 12). */
export function mentionsAnswer(q: Pick<Question, 'answer' | 'choices'>, text: string): boolean {
  const a = finalAnswer(q).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return a !== '' && new RegExp(`(^|[^\\d.])${a}($|[^\\d])`).test(text);
}

/** True if the hint contains the final answer — even by coincidence. */
export function hintMentionsAnswer(q: Pick<Question, 'answer' | 'choices' | 'hint'>): boolean {
  return mentionsAnswer(q, q.hint);
}

/** n questions per template from one seed. Ids look like `g-slope-s1-3`. */
export function generate(seed: number, perTemplate: number): Question[] {
  const out: Question[] = [];
  for (const [ti, t] of TEMPLATES.entries()) {
    const r = mulberry32(seed * 1000 + ti);
    const seen = new Set<string>();
    let tries = 0;
    while (
      out.filter((q) => q.id.startsWith(`g-${t.key}-s${seed}-`)).length < perTemplate &&
      tries++ < perTemplate * 20
    ) {
      const d = t.make(r);
      if (!d || seen.has(d.prompt) || hintMentionsAnswer(d)) continue;
      seen.add(d.prompt);
      const n = seen.size;
      out.push({
        ...d,
        id: `g-${t.key}-s${seed}-${n}`,
        domain: t.domain,
        skill: t.skill,
        difficulty: d.difficulty ?? t.difficulty,
      });
    }
  }
  return out;
}

if (import.meta.main) {
  const qs = generate(1, 1);
  for (const q of qs.slice(0, 6)) console.log(JSON.stringify(q, null, 1), '\n');
  console.log(`${TEMPLATES.length} templates`);
}
