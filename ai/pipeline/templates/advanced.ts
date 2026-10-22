// SAT Math · Advanced Math templates. Answers are computed in code; Mongolian hint / explanation / wrong-choice reasons.
import {
  coef,
  int,
  lin,
  mcq,
  nonZero,
  par,
  pick,
  quad,
  type Template,
  term,
  times,
  WRONG_SIGN,
} from './shared';

export const ADVANCED: Template[] = [
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
  {
    key: 'vertex-x',
    domain: 'adv',
    skill: 'Quadratic functions',
    difficulty: 2,
    make: (r) => {
      const a = nonZero(r, -3, 3);
      const h = nonZero(r, -5, 6);
      const b = -2 * a * h;
      const c = int(r, -9, 9);
      return {
        prompt: `The graph of $y = ${quad(a, b, c)}$ in the $xy$-plane is a parabola. What is the $x$-coordinate of its vertex?`,
        answer: [String(h)],
        explain: `Оройн $x$ координат: $x = -\\frac{b}{2a} = -\\frac{${b}}{2 \\cdot ${par(a)}} = -\\frac{${b}}{${2 * a}} = ${h}$.`,
        hint: 'Параболын оройн $x$ координатын томьёо: $x = -\\frac{b}{2a}$. Энд $a$, $b$ хэд вэ?',
        desmos: {
          rows: [`y=${quad(a, b, c).replace(/ /g, '')}`],
          tip: `Параболын орой дээр дар — координат нь $(${h}, \\ldots)$.`,
        },
        mn: 'vertex = орой, x-coordinate = x координат',
        vocab: ['vertex', 'parabola'],
      };
    },
  },
  {
    key: 'discriminant',
    domain: 'adv',
    skill: 'Quadratic equations',
    difficulty: 3,
    make: (r) => {
      const kind = pick(r, [0, 1, 2] as const);
      let b = 0;
      let c = 0;
      if (kind === 1) {
        const k = nonZero(r, -7, 7);
        b = 2 * k;
        c = k * k;
      } else {
        b = int(r, -8, 8);
        c =
          kind === 2
            ? int(r, -15, Math.floor((b * b) / 4) - 1)
            : int(r, Math.floor((b * b) / 4) + 1, Math.floor((b * b) / 4) + 12);
      }
      const D = b * b - 4 * c;
      const n = D > 0 ? 2 : D === 0 ? 1 : 0;
      const q = mcq(r, String(n), [
        { tex: '0', why: '$D < 0$ үед л бодит шийдгүй. Дискриминантаа дахин бод.' },
        { tex: '1', why: '$D = 0$ үед л яг нэг шийдтэй. Дискриминантаа дахин бод.' },
        { tex: '2', why: '$D > 0$ үед л хоёр шийдтэй. Дискриминантаа дахин бод.' },
        { tex: '3', why: 'Квадрат тэгшитгэл хамгийн ихдээ хоёр бодит шийдтэй.' },
      ]);
      if (!q) return null;
      const verdict =
        D > 0
          ? '$D > 0$ тул хоёр ялгаатай бодит шийдтэй'
          : D === 0
            ? '$D = 0$ тул яг нэг бодит шийдтэй'
            : '$D < 0$ тул бодит шийд байхгүй';
      return {
        prompt: `How many distinct real solutions does the equation $${quad(1, b, c)} = 0$ have?`,
        ...q,
        explain: `Дискриминант: $D = b^2 - 4ac = ${par(b)}^2 - 4 \\cdot 1 \\cdot ${par(c)} = ${D}$. ${verdict} (${n} шийд).`,
        hint: 'Дискриминантыг бодоод тэмдгийг нь шалга: эерэг, тэг, эсвэл сөрөг үү?',
        mn: 'distinct real solutions = ялгаатай бодит шийдүүд',
        vocab: ['distinct', 'real solutions'],
      };
    },
  },
  {
    key: 'composition',
    domain: 'adv',
    skill: 'Function notation',
    difficulty: 2,
    make: (r) => {
      const [a, b] = [nonZero(r, -4, 5), int(r, -9, 9)];
      const [c, d] = [nonZero(r, -3, 4), int(r, -6, 6)];
      const k = int(r, -3, 4);
      const g = c * k + d;
      const v = a * g + b;
      return {
        prompt: `The functions $f$ and $g$ are defined by $f(x) = ${lin(a, b)}$ and $g(x) = ${lin(c, d)}$. What is the value of $f(g(${k}))$?`,
        answer: [String(v)],
        explain: `Дотроос нь эхэл: $g(${k}) = ${times(c, k)} ${term(d)} = ${g}$. Дараа нь $f(${g}) = ${times(a, g)} ${term(b)} = ${v}$.`,
        hint: 'Дотор талын функцээс эхэл: эхлээд $g$-г бод, гарсан тоогоо $f$-д орлуул.',
        mn: 'f(g(x)) = давхар функц (эхлээд g, дараа нь f)',
        vocab: ['functions', 'defined'],
      };
    },
  },
];
