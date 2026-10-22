export type Badge = { id: string; en: string; mn: string; how: string; glyph: 'eq' | 'book' | 'lens' | 'cross' | 'cursor' | 'crown' | 'compass' | 'flame' | 'mend' | 'clock' };

export const BADGES: Badge[] = [
  { id: 'first-equation', en: 'First Equation', mn: 'Анхны тэгшитгэл', how: 'Өгүүлбэрийг анх удаа тэгшитгэл болгосон', glyph: 'eq' },
  { id: 'vocab-explorer', en: 'Vocabulary Explorer', mn: 'Үгсийн судлаач', how: '"Математикийн хэл" шалгалтыг давсан', glyph: 'book' },
  { id: 'desmos-rookie', en: 'Desmos Rookie', mn: 'Desmos эхлэгч', how: 'Desmos-ийн анхны хичээлээ дуусгасан', glyph: 'cursor' },
  { id: 'intersection-expert', en: 'Intersection Expert', mn: 'Огтлолцлын мастер', how: 'Хоёр шулууны огтлолцлыг Desmos-оор олсон', glyph: 'cross' },
  { id: 'graph-detective', en: 'Graph Detective', mn: 'Графикийн мөрдөгч', how: 'Графикаас язгуур уншсан', glyph: 'lens' },
  { id: 'desmos-master', en: 'Desmos Master', mn: 'Desmos мастер', how: 'Desmos сорилтыг давсан', glyph: 'compass' },
  { id: 'sat-strategist', en: 'SAT Strategist', mn: 'SAT стратегич', how: 'Цагтай сорилт эсвэл mock шалгалт дуусгасан', glyph: 'clock' },
  { id: 'streak-7', en: 'Seven-Day Rhythm', mn: '7 хоногийн хэмнэл', how: '7 өдөр дараалан суралцсан', glyph: 'flame' },
  { id: 'mistake-mender', en: 'Mistake Mender', mn: 'Алдаанаасаа суралцагч', how: '3 алдаагаа давтаж зассан', glyph: 'mend' },
  { id: 'math-master', en: 'Math Master', mn: 'Математикийн мастер', how: '6-р түвшинд хүрсэн', glyph: 'crown' },
];
export const badgeById = (id: string) => BADGES.find((b) => b.id === id)!;

export type Quest = { id: string; title: string; target: number; xp: number; go: string };
export const QUESTS: Quest[] = [
  { id: 'words', title: 'SAT Math-ийн 5 үг сур', target: 5, xp: 10, go: 'journey' },
  { id: 'desmos', title: 'Desmos-ийн 1 хичээл дуусга', target: 1, xp: 10, go: 'desmos' },
  { id: 'mistakes', title: '3 алдаагаа давт', target: 3, xp: 10, go: 'mistakes' },
  { id: 'practice', title: '5 дасгал бод', target: 5, xp: 10, go: 'bank' },
];

// SAT Math vocabulary (from the deck's "SAT MATH толь бичиг" — 300–400 words planned; sample set)
export type Word = { en: string; mn: string; level: 1 | 2 | 3; ex?: string; def?: string };
export const VOCAB: Word[] = [
  { en: 'Sum', mn: 'нийлбэр', level: 1, ex: 'the sum of x and 3 → $x+3$' },
  { en: 'Difference', mn: 'ялгавар', level: 1, ex: 'the difference of 9 and x → $9-x$' },
  { en: 'Product', mn: 'үржвэр', level: 1, ex: 'the product of 4 and x → $4x$' },
  { en: 'Quotient', mn: 'ноогдвор', level: 1, ex: 'the quotient of x and 2 → $\\frac{x}{2}$' },
  { en: 'Remainder', mn: 'үлдэгдэл', level: 2 },
  { def: '…, −2, −1, 0, 1, 2, … бүхэл тоонууд.', en: 'Integer', mn: 'бүхэл тоо', level: 1 },
  { en: 'Consecutive', mn: 'дараалсан', level: 2, ex: 'consecutive integers → $n, n+1$' },
  { en: 'Distinct', mn: 'ялгаатай', level: 2 },
  { def: 'Тоог үлдэгдэлгүй хуваах тоо; эсвэл үржигдэхүүн.', en: 'Factor', mn: 'хуваагч, үржигдэхүүн', level: 2 },
  { def: 'Бүх утганд ижил үр дүн өгөх илэрхийлэл.', en: 'Equivalent', mn: 'тэнцүү чанартай', level: 3 },
  { def: 'Хувьсагчийн өмнөх тоо. $3x$-д 3.', en: 'Coefficient', mn: 'коэффициент', level: 2, ex: '$5x$-ийн коэффициент 5' },
  { def: 'Шулууны эгц байдал: y-ийн өөрчлөлт / x-ийн өөрчлөлт.', en: 'Slope', mn: 'налалт', level: 1, ex: '$y=mx+b$-ийн $m$' },
  { def: 'График тэнхлэгийг огтлох цэг. y огтлол: $x=0$ үеийн утга.', en: 'Intercept', mn: 'тэнхлэг огтлох цэг', level: 2 },
  { en: 'Perpendicular', mn: 'перпендикуляр', level: 3 },
  { def: 'Төвөөс тойрог хүртэлх зай.', en: 'Radius', mn: 'радиус', level: 1 },
  { def: 'Нийлбэрийг тоонуудын тоонд хуваасан утга.', en: 'Mean', mn: 'дундаж', level: 1 },
  { def: 'Эрэмбэлсэн өгөгдлийн яг голын утга.', en: 'Median', mn: 'медиан (голч)', level: 2 },
  { def: 'Хоёр хэмжигдэхүүний харьцуулалт $a:b$.', en: 'Ratio', mn: 'харьцаа', level: 1 },
  { def: 'Зуугийн хэсэг: $p\\% = \\frac{p}{100}$.', en: 'Percent', mn: 'хувь', level: 1 },
  { en: 'At least', mn: 'дор хаяж (≥)', level: 2 },
  { en: 'At most', mn: 'хамгийн ихдээ (≤)', level: 2 },
  { en: 'Increased by', mn: '…-аар нэмэгдсэн', level: 1 },
  { en: 'Decreased by', mn: '…-аар хорогдсон', level: 1 },
  { en: 'Twice', mn: '2 дахин', level: 1 },
  { en: 'Greatest', mn: 'хамгийн их', level: 1 },
  { def: 'Тэгшитгэлийг үнэн болгох утга.', en: 'Solution', mn: 'шийд', level: 1 },
  { def: 'Хоёр график нэг цэгт уулзах.', en: 'Intersect', mn: 'огтлолцох', level: 2 },
  { def: 'Параболын хамгийн доод эсвэл дээд цэг.', en: 'Vertex', mn: 'орой', level: 2 },
  { def: 'Тэгш өнцөгт гурвалжны хамгийн урт тал.', en: 'Hypotenuse', mn: 'гипотенуз', level: 2 },
  { en: 'Circumference', mn: 'тойргийн урт', level: 2 },
  { en: 'In terms of', mn: '…-ээр илэрхийлбэл', level: 3, ex: 'y in terms of x → $y=\\dots x$' },
  { def: '$y=kx$ хэлбэрийн хамаарал.', en: 'Proportional', mn: 'пропорциональ', level: 3 },
];

VOCAB.push(
  { en: 'Constant', mn: 'тогтмол', level: 1, def: 'Хувьсагчгүй, өөрчлөгддөггүй тоо. $2x+5$-д 5.' },
  { en: 'Exponent', mn: 'илтгэгч', level: 1, def: 'Суурийг хэдэн удаа үржүүлэхийг заадаг тоо.', ex: '$2^5$-д 5' },
  { en: 'Radical', mn: 'язгуур', level: 2, def: '$\\sqrt{x}$ хэлбэрийн илэрхийлэл.' },
  { en: 'Quadratic', mn: 'квадрат', level: 2, def: 'Хамгийн их зэрэг нь 2 байх илэрхийлэл.' },
  { en: 'Inequality', mn: 'тэнцэтгэл биш', level: 1, def: '$<, >, \\le, \\ge$ тэмдэгтэй харьцаа.' },
  { en: 'Probability', mn: 'магадлал', level: 2, def: 'Таатай үр дүн / бүх боломжит үр дүн.' },
  { en: 'Radian', mn: 'радиан', level: 3, def: 'Өнцгийн нэгж: $\\pi$ радиан $=180^\\circ$.' },
);

// ——— МАТЕРИАЛ: formula sheet ———
export const FORMULAS_GIVEN: { n: string; tex: string }[] = [
  { n: 'Тойргийн талбай', tex: 'A=\\pi r^2' }, { n: 'Тойргийн урт', tex: 'C=2\\pi r' },
  { n: 'Тэгш өнцөгт', tex: 'A=\\ell w' }, { n: 'Гурвалжин', tex: 'A=\\tfrac12 bh' },
  { n: 'Пифагор', tex: 'c^2=a^2+b^2' }, { n: '30°–60°–90°', tex: 'x,\\ x\\sqrt3,\\ 2x' },
  { n: '45°–45°–90°', tex: 's,\\ s,\\ s\\sqrt2' }, { n: 'Цилиндр', tex: 'V=\\pi r^2h' },
  { n: 'Бөмбөрцөг', tex: 'V=\\tfrac43\\pi r^3' }, { n: 'Конус', tex: 'V=\\tfrac13\\pi r^2h' },
  { n: 'Пирамид', tex: 'V=\\tfrac13\\ell wh' }, { n: 'Өнцөг', tex: '360^\\circ=2\\pi\\ \\text{рад}' },
];
export const FORMULAS_MEMO: { n: string; tex: string; why: string }[] = [
  { n: 'Налалт', tex: 'm=\\frac{y_2-y_1}{x_2-x_1}', why: 'Шугаман функцийн бараг бүх бодлого' },
  { n: 'Квадрат томьёо', tex: 'x=\\frac{-b\\pm\\sqrt{b^2-4ac}}{2a}', why: 'Задрахгүй квадрат тэгшитгэл' },
  { n: 'Дискриминант', tex: 'D=b^2-4ac', why: 'Шийдийн тоо: >0 хоёр, =0 нэг, <0 байхгүй' },
  { n: 'Орой', tex: 'x=-\\frac{b}{2a}', why: 'Хамгийн их / бага утга' },
  { n: 'Тойргийн тэгшитгэл', tex: '(x-h)^2+(y-k)^2=r^2', why: 'Төв ба радиус унших' },
  { n: 'Хувийн өөрчлөлт', tex: '\\frac{\\text{шинэ}-\\text{хуучин}}{\\text{хуучин}}\\cdot 100\\%', why: 'Үнэ өсөх / буурах' },
];

// ——— МАТЕРИАЛ: weekly league (other students are demo data) ———
export const LEAGUE_RIVALS: [string, number][] = [['Номин', 1280], ['Билгүүн', 1040], ['Ану', 880], ['Саруул', 520], ['Хулан', 430], ['Энхжин', 310], ['Мөнх-Эрдэнэ', 180]];

// ——— МАТЕРИАЛ: help (Mongolia registration) ———
export const HELP_STEPS = [
  { t: 'College Board бүртгэл', d: 'collegeboard.org дээр нэр, төрсөн огноогоо паспорттайгаа яг адил бичнэ.' },
  { t: 'SAT-д бүртгүүлэх', d: 'Өдрөө сонгоод Улаанбаатарын шалгалтын төвийг хайна. Бүртгэл шалгалтаас ~2 долоо хоногийн өмнө хаагдана.' },
  { t: 'Төлбөр', d: 'Энгийн төлбөр + олон улсын нэмэлт төлбөр, картаар. Дүнг College Board-ийн хуудсаас шалга.' },
  { t: 'Bluebook суулгах', d: 'Шалгалт өгөх зөөврийн компьютер дээр Bluebook апп суулгаж, practice test хийнэ.' },
  { t: 'Admission ticket', d: 'Шалгалтын өмнө Bluebook-ээс тасалбараа авна.' },
  { t: 'Шалгалтын өдөр', d: '07:45 гэхэд оч: тасалбар, паспорт эсвэл иргэний үнэмлэх, цэнэглэсэн компьютер.' },
];
export const FAQ = [
  { q: 'Тооны машин ашиглаж болох уу?', a: 'Тийм. Математикийн бүх асуултад Bluebook доторх Desmos-ийг ашиглана. Зөвшөөрөгдсөн өөрийн тооны машинаа ч авч болно.' },
  { q: 'Хэдэн удаа өгч болох вэ?', a: 'Тоо хязгаарлагдаагүй. Олон их сургууль хэсэг тус бүрийн хамгийн өндөр оноог (superscore) тооцдог.' },
  { q: 'Оноо хэзээ гарах вэ?', a: 'Ихэвчлэн шалгалтаас хойш 2 долоо хоногийн дотор College Board-ийн аккаунтад гарна.' },
  { q: 'Хоцорсон бүртгэл гэж юу вэ?', a: 'Үндсэн хугацаа өнгөрсний дараах хэдэн өдөр, нэмэлт төлбөртэй бүртгэл.' },
];

// ——— AI төлөвлөгөө: SAT dates from the design canvas (verify on College Board) and phases ———
export const SAT_DATES = [
  { d: '2026-11-07', reg: '10/23', late: '10/27' },
  { d: '2026-12-05', reg: '11/20', late: '11/24' },
  { d: '2027-03-06', reg: '02/19', late: '02/23' },
  { d: '2027-05-01', reg: '04/16', late: '04/20' },
  { d: '2027-06-05', reg: '05/21', late: '05/25' },
];
export const PHASES = [
  { n: 'Оношлогоо', what: 'бүх сэдвээс богино тест, сул талаа олох', f: 0.1 },
  { n: 'Сул сэдэв', what: 'замналын хичээл + сул сэдвийн асуулт', f: 0.4 },
  { n: 'Холимог', what: 'бүх сэдэв холимог, хүнд асуулт', f: 0.25 },
  { n: 'Бүтэн тест', what: 'долоо хоногт 2 бүтэн тест', f: 0.15 },
  { n: 'Давталт', what: 'алдааны дэвтэр, томьёо, амралт', f: 0.1 },
];

// ——— Desmos hacks (from the design canvas) ———
export const HACKS = [
  { title: 'Системийг огтлолцлоор', when: 'хоёр шугаман тэгшитгэлийн систем', steps: ['Тэгшитгэл бүрийг тусад нь бич', 'Огтлолцол дээр дар', 'Координатаас x, y-г ав'], rows: ['y=2x+1', 'y=-x+7'] },
  { title: 'Квадратын тэг ба орой', when: 'шийд, нийлбэр, хамгийн бага/их утга', steps: ['y = … гэж параболаа бич', 'Саарал цэгүүд = тэг ба орой', 'Цэг дээр дарж утгыг унш'], rows: ['y=x^2-6x+5'] },
  { title: 'Хүснэгт', when: 'хүснэгтээр өгөгдсөн өгөгдөл', steps: ['«+» → Хүснэгт', 'x₁, y₁ баганад утгаа оруул', 'Цэгүүдийн хэлбэрийг хар'], rows: ['TABLE:1,5;3,11;5,17'] },
  { title: 'Регресс', when: 'аль тэгшитгэл өгөгдөлд таарах вэ', steps: ['Хүснэгтээ оруул', '«Шугаман регресс»-ийг асаа', 'm, b-г сонголттой харьцуул'], rows: ['TABLE:1,5;3,11;5,17;R'] },
  { title: 'Слайдераар тогтмол олох', when: '«k-ийн ямар утгад …» асуулт', steps: ['Тогтмолтойгоор нь бич', 'Слайдер нэмэх товч дар', 'Нөхцөл биелэх хүртэл гулсуул'], rows: ['y=a(x-3)^2-4', 'a=1'] },
];
