// SuuPrep learning journey: Understand → Learn → Practice → Master → Apply
// Text uses $…$ for inline TeX and **bold**.

export type Exercise =
  | { kind: 'concept'; title: string; body: string; example?: { en: string; mn: string; tex: string } }
  | { kind: 'match'; prompt: string; pairs: [string, string][]; concept: string }
  | { kind: 'choice'; prompt: string; options: string[]; answer: number; explain: string; concept: string; hint?: string }
  | { kind: 'build'; prompt: string; sentence: string; tokens: string[]; answer: string[]; explain: string; concept: string; hint?: string }
  | { kind: 'input'; prompt: string; answer: string[]; explain: string; concept: string; placeholder?: string; hint?: string };

export type NodeKind = 'lesson' | 'checkpoint' | 'desmos' | 'practice' | 'timed' | 'review' | 'mock';

export type LessonNode = {
  id: string;
  title: string;
  en: string;
  kind: NodeKind;
  xp: number;
  minutes: number;
  exercises?: Exercise[];
  /** checkpoint: two equivalent variant sets, served alternately on retries */
  variants?: Exercise[][];
  desmosId?: string;
  domain?: 'alg' | 'adv' | 'psda' | 'geo' | 'mixed';
  words?: number;
};

export type Stage = {
  id: string;
  no: number;
  title: string;
  en: string;
  blurb: string;
  tone: 'leaf' | 'moss' | 'teal' | 'rose' | 'ink';
  nodes: LessonNode[];
  badge?: string;
  alwaysOpen?: boolean;
};

const ch = (prompt: string, options: string[], answer: number, explain: string, concept: string, hint?: string): Exercise => ({
  kind: 'choice', prompt, options, answer, explain, concept, hint,
});
const inp = (prompt: string, answer: string[], explain: string, concept: string, hint?: string, placeholder = 'Хариу'): Exercise => ({
  kind: 'input', prompt, answer, explain, concept, hint, placeholder,
});

export const STAGES: Stage[] = [
  {
    id: 's1',
    no: 1,
    title: 'Математикийн хэл',
    en: 'Mathematical English',
    blurb: 'SAT-ын англи үгсийг математик тэмдэглэгээ рүү хөрвүүлж сурна.',
    tone: 'leaf',
    badge: 'vocab-explorer',
    nodes: [
      {
        id: 's1-l1', title: 'Нэмэх, хасах үгс', en: 'Sum & difference', kind: 'lesson', xp: 20, minutes: 4, words: 6,
        exercises: [
          { kind: 'concept', title: 'Нэмэх ба хасах', body: '**sum** — нийлбэр, **difference** — ялгавар.\n**increased by** нэмэгдсэн, **decreased by** хорогдсон гэсэн утгатай.', example: { en: 'The sum of a number and 4', mn: 'Тоо ба 4-ийн нийлбэр', tex: 'x+4' } },
          { kind: 'match', prompt: 'Англи үгийг монгол утгатай нь холбо', concept: 'Нэмэх, хасах үгс', pairs: [['sum', 'нийлбэр'], ['difference', 'ялгавар'], ['increased by', '…-аар нэмэгдсэн'], ['decreased by', '…-аар хорогдсон']] },
          ch('"A number **decreased by** 9" аль нь вэ?', ['$x-9$', '$9-x$', '$x+9$', '$9x$'], 0, '"decreased by 9" гэдэг нь тооноос 9-ийг хасна: $x-9$.', 'decreased by'),
          ch('"The difference of 12 and a number" аль нь вэ?', ['$x-12$', '$12-x$', '$12+x$', '$\\frac{12}{x}$'], 1, '"difference of A and B" нь $A-B$ дарааллаар бичигдэнэ: $12-x$.', 'difference'),
        ],
      },
      {
        id: 's1-l2', title: 'Үржих, хуваах үгс', en: 'Product, quotient, times', kind: 'lesson', xp: 20, minutes: 4, words: 6,
        exercises: [
          { kind: 'concept', title: 'Үржвэр ба ноогдвор', body: '**product** — үржвэр, **quotient** — ноогдвор.\n**twice** = 2 дахин, **three times** = 3 дахин.', example: { en: 'Twice a number', mn: 'Тооны 2 дахин', tex: '2x' } },
          { kind: 'match', prompt: 'Холбож өгөөрэй', concept: 'Үржих, хуваах үгс', pairs: [['product', 'үржвэр'], ['quotient', 'ноогдвор'], ['twice', '2 дахин'], ['half of', 'хагас']] },
          ch('"The product of 5 and a number" аль нь вэ?', ['$5+x$', '$\\frac{5}{x}$', '$5x$', '$x-5$'], 2, '"product" нь үржих үйлдэл: $5\\cdot x = 5x$.', 'product'),
          ch('"The quotient of a number and 3" аль нь вэ?', ['$\\frac{3}{x}$', '$\\frac{x}{3}$', '$3x$', '$x-3$'], 1, '"quotient of A and B" нь $\\frac{A}{B}$: $\\frac{x}{3}$.', 'quotient'),
        ],
      },
      {
        id: 's1-l3', title: 'Өгүүлбэрээс тэгшитгэл', en: 'Sentences → equations', kind: 'lesson', xp: 20, minutes: 6, words: 5,
        exercises: [
          {
            kind: 'concept', title: 'Өгүүлбэрийг тэгшитгэл болгох',
            body: 'SAT бодлого ихэвчлэн өгүүлбэр хэлбэртэй. Үг бүрийг тэмдэг болгон хөрвүүлбэл тэгшитгэл гарч ирнэ.\n**is / is equal to** → $=$, **at least** → $\\ge$, **at most** → $\\le$.',
            example: { en: 'Three times a number is equal to 15.', mn: 'Тооны гурав дахин нь 15-тай тэнцүү.', tex: '3x=15' },
          },
          { kind: 'match', prompt: 'Үг ба тэмдгийг холбо', concept: 'Харьцуулах үгс', pairs: [['is equal to', '='], ['at least', '≥'], ['at most', '≤'], ['three times a number', '3x']] },
          { kind: 'build', prompt: 'Өгүүлбэрийг тэгшитгэл болгож бүтээ', sentence: 'Three times a number is equal to 15.', tokens: ['3', 'x', '=', '15', '+', '5', '≤'], answer: ['3', 'x', '=', '15'], explain: '"Three times a number" → $3x$, "is equal to" → $=$, "15" → $15$. Тиймээс $3x=15$.', concept: 'Өгүүлбэр → тэгшитгэл', hint: 'Эхлээд "three times a number" хэсгийг хөрвүүл.' },
          ch('"Five less than twice a number" аль нь вэ?', ['$5-2x$', '$2x-5$', '$2(x-5)$', '$2x+5$'], 1, '"five less than A" гэдэг нь $A-5$. A = twice a number = $2x$. Иймд $2x-5$. Олон сурагч $5-2x$ гэж андуурдаг.', 'less than', 'Хэнээс 5-ыг хасаж байна вэ?'),
          { kind: 'build', prompt: 'Тэнцэтгэл биш бүтээ', sentence: 'The sum of a number and 7 is at most 20.', tokens: ['x', '+', '7', '≤', '20', '≥', '−'], answer: ['x', '+', '7', '≤', '20'], explain: '"sum of a number and 7" → $x+7$, "at most" → $\\le$. Иймд $x+7\\le 20$.', concept: 'at most', hint: '"at most" = хамгийн ихдээ.' },
          inp('Three times a number is equal to 15. **What is the number?**', ['5'], '$3x=15$ тул $x=\\frac{15}{3}=5$.', 'Өгүүлбэр → тэгшитгэл', 'Эхлээд тэгшитгэлээ бич: $3x=15$.'),
        ],
      },
      {
        id: 's1-cp', title: 'Шалгалт: Математикийн хэл', en: 'Checkpoint', kind: 'checkpoint', xp: 60, minutes: 5,
        variants: [
          [
            ch('"x **decreased by** 4" аль нь вэ?', ['$4-x$', '$x-4$', '$x+4$', '$4x$'], 1, '"decreased by 4" → 4-ийг хасна: $x-4$.', 'decreased by'),
            ch('"The score $s$ is **at least** 90" аль нь вэ?', ['$s\\le 90$', '$s<90$', '$s\\ge 90$', '$s=90$'], 2, '"at least 90" = 90 буюу түүнээс их: $s\\ge 90$.', 'at least'),
            inp('The **product** of 6 and a number $n$ is 42. What is $n$?', ['7'], '$6n=42$ → $n=7$.', 'product'),
            inp('**Twice** a number, **increased by** 3, equals 17. What is the number?', ['7'], '$2x+3=17$ → $2x=14$ → $x=7$.', 'Өгүүлбэр → тэгшитгэл'),
            ch('"The **difference** of 10 and a number" аль нь вэ?', ['$x-10$', '$10-x$', '$10x$', '$\\frac{10}{x}$'], 1, '"difference of 10 and x" → $10-x$.', 'difference'),
          ],
          [
            ch('"y **increased by** 9" аль нь вэ?', ['$9y$', '$y-9$', '$9-y$', '$y+9$'], 3, '"increased by 9" → $y+9$.', 'increased by'),
            ch('"The cost $c$ is **at most** 25" аль нь вэ?', ['$c\\ge 25$', '$c\\le 25$', '$c>25$', '$c=25$'], 1, '"at most 25" = 25 буюу түүнээс бага: $c\\le 25$.', 'at most'),
            inp('The **quotient** of a number $m$ and 4 is 5. What is $m$?', ['20'], '$\\frac{m}{4}=5$ → $m=20$.', 'quotient'),
            inp('**Four times** a number, **decreased by** 6, is 18. What is the number?', ['6'], '$4x-6=18$ → $4x=24$ → $x=6$.', 'Өгүүлбэр → тэгшитгэл'),
            ch('"7 **less than** a number" аль нь вэ?', ['$7-x$', '$x+7$', '$x-7$', '$7x$'], 2, '"7 less than x" → $x-7$ (дараалал урвуу!).', 'less than'),
          ],
        ],
      },
    ],
  },
  {
    id: 's2',
    no: 2,
    title: 'Математикийн суурь',
    en: 'Math Foundations',
    blurb: 'Хувьсагчаас квадрат функц хүртэл — алгебрийг тэгээс нь.',
    tone: 'moss',
    nodes: [
      {
        id: 's2-l1', title: 'Хувьсагч ба илэрхийлэл', en: 'Variables & expressions', kind: 'lesson', xp: 20, minutes: 5,
        exercises: [
          { kind: 'concept', title: 'Хувьсагч гэж юу вэ?', body: 'Хувьсагч бол утга нь өөрчлөгдөж болох тоог орлох үсэг. $3x+2$ илэрхийлэлд $x=4$ бол $3(4)+2=14$.', example: { en: 'Evaluate 3x + 2 when x = 4', mn: 'x = 4 үед 3x + 2-ийн утгыг ол', tex: '3(4)+2=14' } },
          inp('$x=5$ үед $2x-3$ хэд вэ?', ['7'], '$2(5)-3=10-3=7$.', 'Илэрхийлэл бодох'),
          ch('$4x+3x-2$-ийг хялбарчил.', ['$7x-2$', '$5x$', '$7x+2$', '$12x-2$'], 0, 'Ижил гишүүдийг нэмнэ: $4x+3x=7x$. Иймд $7x-2$.', 'Ижил гишүүн'),
          ch('$3(x+4)$ задлаад бич.', ['$3x+4$', '$3x+12$', '$x+12$', '$3x+7$'], 1, 'Хаалтын гишүүн бүрийг 3-аар үржүүлнэ: $3x+12$.', 'Хаалт задлах'),
        ],
      },
      {
        id: 's2-l2', title: 'Шугаман тэгшитгэл', en: 'Linear equations', kind: 'lesson', xp: 20, minutes: 6,
        exercises: [
          { kind: 'concept', title: 'Тэгшитгэл бодох', body: 'Хоёр талд ижил үйлдэл хийж $x$-ийг ганцаараа үлдээнэ.\n$2x+5=13$ → $2x=8$ → $x=4$.' },
          inp('$2x+5=13$ бол $x$ = ?', ['4'], '$2x=8$, $x=4$.', 'Шугаман тэгшитгэл'),
          inp('$4(x-3)=2x+6$ бол $x$ = ?', ['9'], '$4x-12=2x+6$ → $2x=18$ → $x=9$.', 'Шугаман тэгшитгэл', 'Эхлээд хаалтаа задал.'),
          ch('$y=3x-2$ шулууны налалт (slope)?', ['$-2$', '$3$', '$\\frac{1}{3}$', '$2$'], 1, '$y=mx+b$ хэлбэрт $m$ нь налалт: $m=3$.', 'Налалт'),
        ],
      },
      {
        id: 's2-l3', title: 'Тэнцэтгэл биш', en: 'Inequalities', kind: 'lesson', xp: 20, minutes: 5,
        exercises: [
          { kind: 'concept', title: 'Тэнцэтгэл биш', body: 'Тэгшитгэлтэй адил бодно. Гэхдээ **сөрөг тоогоор** үржүүлэх/хуваах үед тэмдэг эргэнэ.\n$-2x<6$ → $x>-3$.' },
          inp('If $3x+5\\le 20$, what is the **greatest** possible value of $x$?', ['5'], '$3x\\le 15$ → $x\\le 5$. Хамгийн их утга нь $5$. (greatest = хамгийн их!)', 'Тэнцэтгэл биш'),
          ch('$-2x<6$-ийг бод.', ['$x<-3$', '$x>-3$', '$x<3$', '$x>3$'], 1, 'Хоёр талыг $-2$-д хуваахад тэмдэг эргэнэ: $x>-3$.', 'Тэмдэг эргэх'),
          ch('$y<2x-3$-ийн шийд аль цэг вэ?', ['$(0,0)$', '$(3,1)$', '$(1,2)$', '$(2,4)$'], 1, '$(3,1)$: $1<2(3)-3=3$ ✓. Бусад нь таарахгүй.', 'Тэнцэтгэл бишийн шийд'),
        ],
      },
      {
        id: 's2-l4', title: 'Функц ба координат', en: 'Functions & the plane', kind: 'lesson', xp: 20, minutes: 5,
        exercises: [
          { kind: 'concept', title: 'Функц', body: 'Функц нь оролт бүрт яг нэг гаралт өгнө. $f(x)=2x-1$ бол $f(3)=2(3)-1=5$.\nКоординатын хавтгайд $(x, y)$ цэг: эхлээд хэвтээ, дараа нь босоо.' },
          inp('$f(x)=2x-1$ бол $f(3)$ = ?', ['5'], '$2(3)-1=5$.', 'Функцийн утга'),
          ch('$(0,4)$ ба $(2,10)$ цэгийг дайрсан шулууны налалт?', ['$2$', '$3$', '$4$', '$6$'], 1, '$m=\\frac{10-4}{2-0}=\\frac{6}{2}=3$.', 'Налалт'),
          ch('$y=2x+1$ шулуун y тэнхлэгийг хаана огтлох вэ?', ['$(1,0)$', '$(0,2)$', '$(0,1)$', '$(2,1)$'], 2, '$x=0$ үед $y=1$: $(0,1)$.', 'y огтлол'),
        ],
      },
      {
        id: 's2-l5', title: 'Систем тэгшитгэл', en: 'Systems of equations', kind: 'lesson', xp: 20, minutes: 6,
        exercises: [
          { kind: 'concept', title: 'Систем', body: 'Хоёр тэгшитгэлийг зэрэг хангах $(x, y)$ хос бол системийн шийд. Графикаар бол хоёр шулууны **огтлолцлын цэг**.' },
          inp('$y=2x+1$, $y=-x+7$ бол $x$ = ?', ['2'], '$2x+1=-x+7$ → $3x=6$ → $x=2$.', 'Систем тэгшитгэл'),
          ch('$x+y=10$, $x-y=4$ бол $(x,y)$?', ['$(6,4)$', '$(7,3)$', '$(4,6)$', '$(5,5)$'], 1, 'Нэмбэл $2x=14$, $x=7$, $y=3$.', 'Систем тэгшитгэл'),
        ],
      },
      {
        id: 's2-l6', title: 'Квадрат функц', en: 'Quadratics', kind: 'lesson', xp: 20, minutes: 6,
        exercises: [
          { kind: 'concept', title: 'Парабол', body: '$y=ax^2+bx+c$ график нь парабол. $x$ тэнхлэгийг огтлох цэгүүд нь $ax^2+bx+c=0$ тэгшитгэлийн шийдүүд (язгуурууд).' },
          ch('$x^2-x-6=0$-ийн шийдүүд?', ['$2$ ба $-3$', '$-2$ ба $3$', '$1$ ба $-6$', '$6$ ба $-1$'], 1, '$(x-3)(x+2)=0$ → $x=3$ эсвэл $x=-2$.', 'Квадрат тэгшитгэл'),
          inp('If $(x+3)^2=49$ and $x>0$, what is $x$?', ['4'], '$x+3=7$ (эерэг) → $x=4$.', 'Квадрат тэгшитгэл'),
        ],
      },
      {
        id: 's2-cp', title: 'Шалгалт: Суурь', en: 'Checkpoint', kind: 'checkpoint', xp: 60, minutes: 6,
        variants: [
          [
            inp('$3x-4=11$ бол $x$ = ?', ['5'], '$3x=15$ → $x=5$.', 'Шугаман тэгшитгэл'),
            ch('$-3x\\ge 12$-ийг бод.', ['$x\\ge -4$', '$x\\le -4$', '$x\\le 4$', '$x\\ge 4$'], 1, '$-3$-д хуваахад тэмдэг эргэнэ: $x\\le -4$.', 'Тэмдэг эргэх'),
            inp('$f(x)=x^2+1$ бол $f(-2)$ = ?', ['5'], '$(-2)^2+1=5$.', 'Функцийн утга'),
            ch('$(1,2)$ ба $(3,8)$-ыг дайрсан шулууны налалт?', ['$2$', '$3$', '$4$', '$6$'], 1, '$\\frac{8-2}{3-1}=3$.', 'Налалт'),
            inp('$x^2=16$ ба $x<0$ бол $x$ = ?', ['-4'], '$x=\\pm 4$, сөрөг нь $-4$.', 'Квадрат тэгшитгэл'),
          ],
          [
            inp('$5x+2=27$ бол $x$ = ?', ['5'], '$5x=25$ → $x=5$.', 'Шугаман тэгшитгэл'),
            ch('$-2x<10$-ийг бод.', ['$x<-5$', '$x>-5$', '$x>5$', '$x<5$'], 1, 'Тэмдэг эргэнэ: $x>-5$.', 'Тэмдэг эргэх'),
            inp('$g(x)=3x-7$ бол $g(4)$ = ?', ['5'], '$12-7=5$.', 'Функцийн утга'),
            ch('$(0,1)$ ба $(2,9)$-ыг дайрсан шулууны налалт?', ['$4$', '$5$', '$8$', '$2$'], 0, '$\\frac{9-1}{2}=4$.', 'Налалт'),
            inp('$x^2=25$ ба $x<0$ бол $x$ = ?', ['-5'], '$x=-5$.', 'Квадрат тэгшитгэл'),
          ],
        ],
      },
    ],
  },
  {
    id: 's3',
    no: 3,
    title: 'Desmos Академи',
    en: 'Desmos Academy',
    blurb: 'График тооцоолуурыг тэгээс эзэмшээд SAT бодлогыг хурдан, зөв бод.',
    tone: 'teal',
    alwaysOpen: true,
    badge: 'desmos-master',
    nodes: [
      { id: 's3-d1', title: 'Desmos-той танилцах', en: 'Navigate the calculator', kind: 'desmos', xp: 40, minutes: 4, desmosId: 'd1' },
      { id: 's3-d2', title: 'Функц зурах', en: 'Plot equations', kind: 'desmos', xp: 40, minutes: 5, desmosId: 'd2' },
      { id: 's3-d3', title: 'Огтлолцол олох', en: 'Find intersections', kind: 'desmos', xp: 40, minutes: 5, desmosId: 'd3' },
      { id: 's3-d4', title: 'Язгуур олох', en: 'Find roots', kind: 'desmos', xp: 40, minutes: 5, desmosId: 'd4' },
      { id: 's3-d5', title: 'Слайдер', en: 'Sliders', kind: 'desmos', xp: 40, minutes: 5, desmosId: 'd5' },
      { id: 's3-d6', title: 'Хүснэгт ба регресс', en: 'Tables & regression', kind: 'desmos', xp: 40, minutes: 6, desmosId: 'd6' },
      { id: 's3-d7', title: 'SAT → Desmos', en: 'Translate SAT problems', kind: 'desmos', xp: 40, minutes: 6, desmosId: 'd7' },
      { id: 's3-d8', title: 'Хэзээ Desmos, хэзээ гараар?', en: 'When to use Desmos', kind: 'desmos', xp: 40, minutes: 4, desmosId: 'd8' },
      { id: 's3-cp', title: 'Desmos сорилт', en: 'Desmos checkpoint', kind: 'desmos', xp: 60, minutes: 6, desmosId: 'd9' },
    ],
  },
  {
    id: 's4',
    no: 4,
    title: 'SAT Дасгал',
    en: 'SAT Math Practice',
    blurb: 'SAT-ын дөрвөн агуулгын хүрээгээр бодлого бод.',
    tone: 'rose',
    nodes: [
      { id: 's4-alg', title: 'Algebra', en: 'Алгебр', kind: 'practice', xp: 40, minutes: 10, domain: 'alg' },
      { id: 's4-adv', title: 'Advanced Math', en: 'Ахисан математик', kind: 'practice', xp: 40, minutes: 10, domain: 'adv' },
      { id: 's4-psda', title: 'Problem-Solving & Data', en: 'Өгөгдлийн шинжилгээ', kind: 'practice', xp: 40, minutes: 10, domain: 'psda' },
      { id: 's4-geo', title: 'Geometry & Trig', en: 'Геометр, тригонометр', kind: 'practice', xp: 40, minutes: 10, domain: 'geo' },
      { id: 's4-cp', title: 'Холимог шалгалт', en: 'Mixed checkpoint', kind: 'practice', xp: 60, minutes: 12, domain: 'mixed' },
    ],
  },
  {
    id: 's5',
    no: 5,
    title: 'Хурд ба стратеги',
    en: 'Strategy & Speed',
    blurb: 'Зөв стратегийг сонгож, цагтай нөхцөлд алдаагүй бод.',
    tone: 'ink',
    badge: 'sat-strategist',
    nodes: [
      {
        id: 's5-l1', title: 'Desmos уу, гараар уу?', en: 'Strategy selection', kind: 'lesson', xp: 20, minutes: 5,
        exercises: [
          { kind: 'concept', title: 'Стратеги сонгох', body: 'Desmos нь **график, огтлолцол, язгуур, систем, регресс** бодлогод хамгийн хүчтэй. Харин $\\frac{x}{3}=4$ шиг богино бодлогыг гараар 5 секундэд бодно.' },
          ch('$2x+7=15$. Хамгийн хурдан арга?', ['Desmos-д хоёр шулуун зурах', 'Гараар: $2x=8$, $x=4$', 'Хариултуудыг орлуулж шалгах'], 1, 'Нэг алхамт шугаман тэгшитгэл — гараар хурдан.', 'Стратеги'),
          ch('$y=x^2-4x+1$ ба $y=2x-7$ хэдэн цэгт огтлолцох вэ?', ['Desmos-д хоёуланг нь зурах', 'Гараар квадрат тэгшитгэл задлах', 'Таах'], 0, 'Хоёр графикийг зурвал огтлолцлын тоо шууд харагдана. (Гараар: $x^2-6x+8=0$, хоёр шийдтэй.)', 'Стратеги'),
          ch('Хүснэгтийн өгөгдлийн шулуун загвар хэрэгтэй. Хамгийн хурдан?', ['Гараар налалт тооцох', 'Desmos хүснэгт + регресс', 'Медиан олох'], 1, 'Desmos-ийн регресс $m$, $b$-г шууд өгнө.', 'Стратеги'),
        ],
      },
      { id: 's5-timed', title: 'Цагтай мини сорилт', en: 'Timed mini-challenge', kind: 'timed', xp: 60, minutes: 8 },
      { id: 's5-review', title: 'Алдааны шинжилгээ', en: 'Error analysis', kind: 'review', xp: 15, minutes: 5 },
      { id: 's5-mock', title: 'Mock шалгалт', en: 'Mock exam', kind: 'mock', xp: 80, minutes: 20 },
    ],
  },
];

export const ALL_NODES = STAGES.flatMap((s) => s.nodes.map((n) => ({ ...n, stage: s })));
export const nodeById = (id: string) => ALL_NODES.find((n) => n.id === id);

export const LEVELS = [
  { n: 1, xp: 0, en: 'Explorer', mn: 'Судлаач' },
  { n: 2, xp: 200, en: 'Thinker', mn: 'Сэтгэгч' },
  { n: 3, xp: 500, en: 'Problem Solver', mn: 'Бодлогч' },
  { n: 4, xp: 900, en: 'Graph Navigator', mn: 'Графикийн жолооч' },
  { n: 5, xp: 1400, en: 'Desmos Strategist', mn: 'Desmos стратегич' },
  { n: 6, xp: 2000, en: 'Math Master', mn: 'Математикийн мастер' },
];

export function levelFor(xp: number) {
  let cur = LEVELS[0];
  for (const l of LEVELS) if (xp >= l.xp) cur = l;
  const next = LEVELS.find((l) => l.xp > xp);
  const pct = next ? (xp - cur.xp) / (next.xp - cur.xp) : 1;
  return { ...cur, next, pct, toNext: next ? next.xp - xp : 0 };
}
