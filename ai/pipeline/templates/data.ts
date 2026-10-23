// SAT Math · Problem-Solving & Data Analysis templates. Answers are computed in code; Mongolian hint / explanation / wrong-choice reasons.
import { frac, gcd, int, lin, mcq, nonZero, num, pick, type Template, term, times } from './shared';

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
  {
    key: 'weighted-mean',
    domain: 'psda',
    skill: 'Mean',
    difficulty: 3,
    make: (r) => {
      // build it so the overall mean is a whole number: m1 = M + t·n2, m2 = M − t·n1
      const n1 = int(r, 3, 14);
      let n2 = int(r, 3, 14);
      if (n2 === n1) n2 += 1;
      const t = int(r, 1, 3);
      const mean = int(r, 62, 85);
      const m1 = mean + t * n2;
      const m2 = mean - t * n1;
      if (m1 > 100 || m2 < 40) return null;
      const total = n1 * m1 + n2 * m2;
      const q = mcq(r, String(mean), [
        {
          tex: num((m1 + m2) / 2),
          why: 'Хоёр дундажийг энгийнээр дундажилсан байна. Бүлгүүдийн хэмжээ өөр тул жинтэй дундаж хэрэгтэй.',
        },
        { tex: String(total), why: 'Энэ бол бүх онооны нийлбэр — нийт сурагчийн тоонд хуваах ёстой.' },
        { tex: String(mean + 1), why: 'Тооцоогоо дахин шалга.' },
        { tex: String(mean - 2), why: 'Тооцоогоо дахин шалга.' },
      ]);
      if (!q) return null;
      return {
        prompt: `In a class, ${n1} students in group A have a mean test score of ${m1}, and ${n2} students in group B have a mean test score of ${m2}. What is the mean test score of all ${n1 + n2} students?`,
        ...q,
        explain: `Нийт оноо: $${n1} \\cdot ${m1} + ${n2} \\cdot ${m2} = ${n1 * m1} + ${n2 * m2} = ${total}$. Нийт сурагч: $${n1 + n2}$. Дундаж: $\\frac{${total}}{${n1 + n2}} = ${mean}$.`,
        hint: 'Хоёр дундажийг шууд дундажилж болохгүй. Бүлэг бүрийн нийт оноог ол, нэмээд, нийт сурагчийн тоонд хуваа.',
        mn: 'mean test score = шалгалтын дундаж оноо, group = бүлэг',
        vocab: ['mean', 'group'],
      };
    },
  },
  {
    key: 'probability',
    domain: 'psda',
    skill: 'Probability',
    difficulty: 1,
    make: (r) => {
      const red = int(r, 2, 12);
      const blue = int(r, 2, 12);
      const green = int(r, 2, 12);
      const total = red + blue + green;
      const target = pick(r, ['blue', 'green'] as const);
      const t = target === 'blue' ? blue : green;
      const mnColor = target === 'blue' ? 'цэнхэр' : 'ногоон';
      const MnColor = target === 'blue' ? 'Цэнхэр' : 'Ногоон';
      const q = mcq(r, frac(t, total), [
        {
          tex: frac(t, total - t),
          why: `${MnColor} бөмбөлгийг бусадтай нь харьцуулсан байна. Нийт бөмбөлгийн тоонд (${total}) хуваах ёстой.`,
        },
        { tex: frac(red, total), why: 'Энэ бол улаан бөмбөлөг сонгох магадлал.' },
        { tex: frac(1, 3), why: 'Гурван өнгө байгаа ч тоо нь ижил биш — өнгө бүрийн магадлал ялгаатай.' },
        { tex: frac(total - t, total), why: `Энэ бол ${mnColor} БИШ бөмбөлөг сонгох магадлал.` },
      ]);
      if (!q) return null;
      return {
        prompt: `A bag contains ${red} red marbles, ${blue} blue marbles, and ${green} green marbles. One marble is chosen at random. What is the probability that it is ${target}?`,
        ...q,
        explain: `Нийт бөмбөлөг: $${red} + ${blue} + ${green} = ${total}$. ${MnColor}: $${t}$. Магадлал $= \\frac{${t}}{${total}}${frac(t, total) === `\\frac{${t}}{${total}}` ? '' : ` = ${frac(t, total)}`}$.`,
        hint: 'Магадлал = (тохирох тохиолдлын тоо) / (бүх тохиолдлын тоо). Эхлээд нийт хэдэн бөмбөлөг байгааг ол.',
        mn: 'chosen at random = санамсаргүйгээр сонгох, probability = магадлал, marbles = бөмбөлөг',
        vocab: ['probability', 'at random'],
      };
    },
  },
  {
    key: 'sale-price',
    domain: 'psda',
    skill: 'Percentages',
    difficulty: 1,
    make: (r) => {
      const d = pick(r, [10, 15, 20, 25, 30, 40, 50] as const);
      const unit = 100 / gcd(d, 100);
      const price = unit * int(r, 2, 16);
      const off = (price * d) / 100;
      const sale = price - off;
      const item = pick(r, [
        ['a pair of shoes', 'гутал'],
        ['a backpack', 'цүнх'],
        ['a jacket', 'куртка'],
      ] as const);
      return {
        prompt: `The original price of ${item[0]} is ${price} dollars. During a sale, the price is reduced by ${d}%. What is the sale price, in dollars?`,
        answer: [String(sale)],
        explain: `Хямдрал: $${price} \\cdot ${d / 100} = ${off}$ доллар. Шинэ үнэ: $${price} - ${off} = ${sale}$ (эсвэл шууд $${price} \\cdot ${(100 - d) / 100} = ${sale}$).`,
        hint: `${d}% хямдарвал анхны үнийн хэдэн хувийг төлөх вэ? Эсвэл эхлээд хямдралын хэмжээг олоод анхны үнээс хас.`,
        mn: 'original price = анхны үнэ, reduced by = …-аар бууруулсан, sale price = хямдарсан үнэ',
        vocab: ['original', 'reduced'],
      };
    },
  },
  {
    key: 'unit-convert',
    domain: 'psda',
    skill: 'Units and conversions',
    difficulty: 1,
    make: (r) => {
      const kind = pick(r, ['time', 'length', 'speed'] as const);
      if (kind === 'time') {
        const h = int(r, 1, 6);
        const m = int(r, 5, 55);
        return {
          prompt: `How many minutes are in ${h} hours and ${m} minutes?`,
          answer: [String(60 * h + m)],
          explain: `1 цаг = 60 минут. $${h} \\cdot 60 + ${m} = ${60 * h} + ${m} = ${60 * h + m}$ минут.`,
          hint: 'Эхлээд цагийг минут руу хөрвүүл (1 цагт хэдэн минут вэ?), дараа нь үлдсэн минутыг нэм.',
          mn: 'how many minutes = хэдэн минут',
          vocab: ['minutes', 'hours'],
        };
      }
      if (kind === 'length') {
        const f = int(r, 2, 9);
        const i = int(r, 2, 11);
        return {
          prompt: `There are 12 inches in 1 foot. How many inches are in ${f} feet ${i} inches?`,
          answer: [String(12 * f + i)],
          explain: `$${f} \\cdot 12 + ${i} = ${12 * f} + ${i} = ${12 * f + i}$ инч.`,
          hint: 'Футыг инч рүү хөрвүүлээд, үлдсэн инчийг нэм.',
          mn: 'inch = инч (≈2.54 см), foot/feet = фут (12 инч)',
          vocab: ['inches', 'feet'],
        };
      }
      const kmh = 18 * int(r, 1, 6);
      return {
        prompt: `A train travels at ${kmh} kilometers per hour. What is its speed in meters per second?`,
        answer: [String((kmh * 1000) / 3600)],
        explain: `1 км = 1000 м, 1 цаг = 3600 с. $\\frac{${kmh} \\cdot 1000}{3600} = \\frac{${kmh * 1000}}{3600} = ${(kmh * 1000) / 3600}$ м/с.`,
        hint: 'Километрийг метр рүү (× 1000), цагийг секунд рүү (× 3600) хөрвүүл.',
        mn: 'kilometers per hour = км/цаг, meters per second = м/с',
        vocab: ['per', 'speed'],
      };
    },
  },
  {
    key: 'range',
    domain: 'psda',
    skill: 'Data spread',
    difficulty: 1,
    make: (r) => {
      const n = int(r, 5, 8);
      const xs = Array.from({ length: n }, () => int(r, 1, 60));
      const [lo, hi] = [Math.min(...xs), Math.max(...xs)];
      if (lo === hi) return null;
      return {
        prompt: `What is the range of the data set ${xs.join(', ')}?`,
        answer: [String(hi - lo)],
        explain: `Хамгийн их нь $${hi}$, хамгийн бага нь $${lo}$. Далайц (range) $= ${hi} - ${lo} = ${hi - lo}$.`,
        hint: 'Range = хамгийн их утга − хамгийн бага утга. Эрэмбэлэх шаардлагагүй, зөвхөн хамгийн их ба багыг ол.',
        mn: 'range = далайц (хамгийн их − хамгийн бага)',
        vocab: ['range', 'data set'],
      };
    },
  },
  {
    key: 'table-rate',
    domain: 'psda',
    skill: 'Linear relationships from tables',
    difficulty: 2,
    make: (r) => {
      const m = nonZero(r, -6, 9);
      const b = int(r, -10, 20);
      const x0 = int(r, 0, 3);
      const xs = [x0, x0 + 1, x0 + 2, x0 + 3];
      const k = int(r, x0 + 5, x0 + 15);
      const ys = xs.map((x) => m * x + b);
      return {
        prompt: `The table shows a linear relationship between $x$ and $y$. $x$: ${xs.join(', ')}. $y$: ${ys.join(', ')}. What is the value of $y$ when $x = ${k}$?`,
        answer: [String(m * k + b)],
        explain: `$x$ нэгээр өсөхөд $y$ ${m > 0 ? `$${m}$-аар өснө` : `$${-m}$-аар буурна`}, тэгэхээр налуу $${m}$. $x = ${x0}$ үед $y = ${ys[0]}$ тул $y = ${lin(m, b)}$. Тэгвэл $x = ${k}$ үед $y = ${times(m, k)} ${term(b)} = ${m * k + b}$.`,
        hint: '$x$ нэгээр өсөхөд $y$ хэдээр өөрчлөгдөж байна вэ? Тэр нь налуу. Дараа нь $y = mx + b$ томьёо гарга.',
        desmos: {
          rows: [`TABLE:${xs.map((x, i) => `${x},${ys[i]}`).join(';')};R`],
          tip: 'Хүснэгтээ оруулаад regression ($y_1 \\sim mx_1 + b$) хийвэл $m$, $b$ шууд гарна.',
        },
        mn: 'linear relationship = шугаман хамаарал, table = хүснэгт',
        vocab: ['linear', 'relationship'],
      };
    },
  },
];
