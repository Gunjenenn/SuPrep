// SAT Math · Geometry & Trigonometry templates. Answers are computed in code; Mongolian hint / explanation / wrong-choice reasons.
import { frac, int, mcq, nonZero, pick, type Template, term } from './shared';

export const GEOMETRY: Template[] = [
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
