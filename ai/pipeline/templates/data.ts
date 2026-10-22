// SAT Math · Problem-Solving & Data Analysis templates. Answers are computed in code; Mongolian hint / explanation / wrong-choice reasons.
import { frac, gcd, int, mcq, num, pick, type Template } from './shared';

export const DATA: Template[] = [
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
];
