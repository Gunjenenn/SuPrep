// SAT Math · Algebra templates. Answers are computed in code; Mongolian hint / explanation / wrong-choice reasons.
import { coef, frac, int, lin, mcq, nonZero, par, pick, type Template, term, WRONG_SIGN } from './shared';

export const ALGEBRA: Template[] = [
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
  {
    key: 'lin-both-sides',
    domain: 'alg',
    skill: 'Linear equations',
    difficulty: 2,
    make: (r) => {
      const a = int(r, 3, 9);
      const c = int(r, 1, a - 1);
      const x = int(r, -6, 10);
      const b = int(r, -12, 12);
      const d = (a - c) * x + b;
      const k = a - c;
      const divide = k === 1 ? '' : ` Хоёр талыг $${k}$-д хуваа: $x = ${x}$.`;
      return {
        prompt: `If $${lin(a, b)} = ${lin(c, d)}$, what is the value of $x$?`,
        answer: [String(x)],
        explain:
          `Хоёр талаас $${coef(c)}$-г хас: $${lin(k, b)} = ${d}$.` +
          (b === 0 ? '' : ` ${b > 0 ? `$${b}$-г хас` : `$${-b}$-г нэм`}: $${coef(k)} = ${d - b}$.`) +
          (divide || ` Тэгэхээр $x = ${x}$.`),
        hint: 'Бүх $x$-тэй гишүүнийг нэг тал руу, тоонуудыг нөгөө тал руу шилжүүл.',
        mn: 'value = утга',
        vocab: ['value'],
      };
    },
  },
  {
    key: 'consecutive',
    domain: 'alg',
    skill: 'Linear equations in context',
    difficulty: 2,
    make: (r) => {
      const even = r() < 0.4;
      const n = even ? 2 * int(r, 1, 30) : int(r, 1, 50);
      const step = even ? 2 : 1;
      const sum = 3 * n + 3 * step;
      const kind = even ? 'consecutive even integers' : 'consecutive integers';
      const terms = even ? '$n$, $n+2$, $n+4$' : '$n$, $n+1$, $n+2$';
      return {
        prompt: `The sum of three ${kind} is ${sum}. What is the smallest of the three integers?`,
        answer: [String(n)],
        explain: `Тоонуудыг ${terms} гэвэл нийлбэр нь $3n + ${3 * step} = ${sum}$. Тэгвэл $3n = ${sum - 3 * step}$, $n = ${n}$.`,
        hint: even
          ? 'Дараалсан тэгш тоонууд хоорондоо хоёроор зөрнө. Хамгийн багыг нь $n$ гээд тэгшитгэл зохио.'
          : 'Хамгийн бага тоог $n$ гэвэл дараагийн хоёр нь ямар байх вэ? Нийлбэрийн тэгшитгэл зохио.',
        mn: even
          ? 'consecutive even integers = дараалсан тэгш тоонууд'
          : 'consecutive integers = дараалсан бүхэл тоонууд',
        vocab: ['consecutive', 'smallest'],
      };
    },
  },
  {
    key: 'budget',
    domain: 'alg',
    skill: 'Linear inequalities in context',
    difficulty: 2,
    make: (r) => {
      const fee = 5 * int(r, 1, 6);
      const rate = int(r, 3, 12);
      const budget = fee + rate * int(r, 3, 12) + int(r, 1, rate - 1);
      const n = Math.floor((budget - fee) / rate);
      const ctx = pick(r, [
        ['wants to rent a bike. The rental costs', 'hour', 'цаг'],
        ['wants to rent a kayak. The rental costs', 'hour', 'цаг'],
        ['wants to take dance lessons. The lessons cost', 'lesson', 'хичээл'],
      ] as const);
      return {
        prompt: `Saran has ${budget} dollars. She ${ctx[0]} a fee of ${fee} dollars plus ${rate} dollars per ${ctx[1]}. What is the maximum number of whole ${ctx[1]}s she can pay for?`,
        answer: [String(n)],
        explain: `$${fee} + ${rate}h \\le ${budget}$ → $${rate}h \\le ${budget - fee}$ → $h \\le ${frac(budget - fee, rate)}$. Бүхэл ${ctx[2]} байх ёстой тул хамгийн ихдээ $${n}$.`,
        hint: 'Нийт зардал $\\le$ байгаа мөнгө гэсэн тэнцэтгэл биш зохио. Хариу бүхэл тоо байх ёстойг санаарай — дээш биш, доош нь бөөрөнхийл.',
        mn: 'maximum = хамгийн их, whole = бүхэл, per = тус бүрд',
        vocab: ['maximum', 'whole'],
      };
    },
  },
  {
    key: 'abs-value',
    domain: 'alg',
    skill: 'Absolute value equations',
    difficulty: 2,
    make: (r) => {
      const a = nonZero(r, -6, 8);
      const b = int(r, 1, 9);
      const [hi, lo] = [a + b, a - b];
      const askSum = r() < 0.5;
      return {
        prompt: askSum
          ? `What is the sum of all solutions to the equation $|x ${term(-a)}| = ${b}$?`
          : `What is the greatest solution to the equation $|x ${term(-a)}| = ${b}$?`,
        answer: [String(askSum ? hi + lo : hi)],
        explain:
          `Модулийн дотор $${b}$ эсвэл $-${b}$ байж болно: $x ${term(-a)} = ${b}$ → $x = ${hi}$, эсвэл $x ${term(-a)} = -${b}$ → $x = ${lo}$. ` +
          (askSum ? `Нийлбэр: $${hi} + ${par(lo)} = ${hi + lo}$.` : `Их нь $${hi}$.`),
        hint: 'Модуль (абсолют утга) тэнцүү эерэг тоо бол дотор тал нь тэр тоо эсвэл түүний сөрөг байж болно — хоёр тохиолдлыг тусад нь бод.',
        mn: askSum ? 'sum of all solutions = бүх шийдийн нийлбэр' : 'greatest solution = хамгийн их шийд',
        vocab: ['solutions', askSum ? 'sum' : 'greatest'],
      };
    },
  },
  {
    key: 'slope-standard',
    domain: 'alg',
    skill: 'Linear equations in two variables',
    difficulty: 2,
    make: (r) => {
      const a = nonZero(r, -6, 6);
      const b = nonZero(r, -6, 6);
      const c = int(r, -12, 12);
      const q = mcq(r, frac(-a, b), [
        {
          tex: frac(a, b),
          why: `Тэмдэг алдсан: $${coef(a)}$-г баруун тал руу шилжүүлэхэд тэмдэг нь өөрчлөгдөнө.`,
        },
        { tex: frac(-b, a), why: 'Харьцааг урвуу авсан байна.' },
        { tex: frac(c, b), why: 'Энэ бол $y$ тэнхлэгийн огтлол (y-intercept), налуу биш.' },
        { tex: frac(b, a), why: 'Урвуу аваад тэмдэг ч алдсан байна.' },
      ]);
      if (!q) return null;
      return {
        prompt: `What is the slope of the line with equation $${coef(a)} ${term(b)
          .replace(/(\d+)$/, '$1y')
          .replace(/ 1y$/, ' y')} = ${c}$?`,
        ...q,
        explain: `$y$-ийг ганцааранг нь үлдээ: $${coef(b, 'y')} = ${lin(-a, c)}$, тэгээд $${b}$-д хуваа. $x$-ийн коэффициент нь налуу: $${frac(-a, b)}$.`,
        hint: 'Тэгшитгэлийг $y = mx + b$ хэлбэрт оруул. $x$-ийн өмнөх тоо нь налуу.',
        mn: 'slope = налуу',
        vocab: ['slope', 'equation'],
      };
    },
  },
  {
    key: 'parallel-perp',
    domain: 'alg',
    skill: 'Parallel and perpendicular lines',
    difficulty: 2,
    make: (r) => {
      const m = pick(r, [-5, -4, -3, -2, 2, 3, 4, 5, 0.5] as const);
      const b = int(r, -9, 9);
      const mTex = m === 0.5 ? '\\frac{1}{2}' : String(m);
      const lineTex = m === 0.5 ? `y = \\frac{1}{2}x ${term(b)}` : `y = ${lin(m, b)}`;
      const perp = m === 0.5 ? '-2' : frac(-1, m);
      const inv = m === 0.5 ? '2' : frac(1, m);
      const neg = m === 0.5 ? '-\\frac{1}{2}' : String(-m);
      const isPerp = r() < 0.6;
      const correct = isPerp ? perp : mTex;
      const q = mcq(r, correct, [
        { tex: mTex, why: 'Энэ бол параллель шулууны налуу — перпендикуляр бол урвуу ба эсрэг тэмдэгтэй.' },
        { tex: perp, why: 'Энэ бол перпендикуляр шулууны налуу. Параллель шулуунуудын налуу ижил.' },
        { tex: inv, why: 'Урвууг нь авсан ч тэмдгийг өөрчлөөгүй байна.' },
        { tex: neg, why: 'Зөвхөн тэмдгийг өөрчилсөн, урвууг нь аваагүй байна.' },
      ]);
      if (!q) return null;
      return {
        prompt: `Line $\\ell$ has equation $${lineTex}$. Line $k$ is ${isPerp ? 'perpendicular' : 'parallel'} to line $\\ell$. What is the slope of line $k$?`,
        ...q,
        explain: isPerp
          ? `$\\ell$-ийн налуу $${mTex}$. Перпендикуляр шулууны налуу нь урвуу ба эсрэг тэмдэгтэй: $${perp}$ (үржвэр нь $-1$).`
          : `Параллель шулуунуудын налуу ижил. $\\ell$-ийн налуу $${mTex}$ тул $k$-ийн налуу ч мөн $${mTex}$.`,
        hint: isPerp
          ? 'Перпендикуляр шулуунуудын налуунуудын үржвэр $-1$ байдаг.'
          : 'Параллель шулуунууд хэзээ ч огтлолцохгүй — тэдний налуу ямар байх вэ?',
        mn: isPerp ? 'perpendicular = перпендикуляр (90° огтлолцох)' : 'parallel = параллель',
        vocab: [isPerp ? 'perpendicular' : 'parallel', 'slope'],
      };
    },
  },
];
