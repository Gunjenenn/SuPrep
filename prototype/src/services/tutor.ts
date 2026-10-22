// AI tutor service layer for Суу.
// The UI talks only to `TutorService`. Today the prototype runs DemoTutorService
// (prepared, context-aware replies). GeminiTutorService calls a backend proxy
// (see server/gemini-proxy.mjs) — the API key never lives in the browser.
import { Question, qById } from '../data/questions';
import type { ChatMsg, TutorCtx } from '../lib/store';

export type TutorMode = 'explain' | 'hint' | 'desmos' | 'mistake' | 'similar' | 'free';
export type TutorReply = { text: string; graph?: string[]; followups?: TutorMode[]; similarQid?: string };
export type TutorRequest = { mode: TutorMode; message?: string; ctx: TutorCtx; history: ChatMsg[] };

export interface TutorService {
  readonly live: boolean;
  readonly label: string;
  reply(req: TutorRequest): Promise<TutorReply>;
}

export const MODE_LABEL: Record<TutorMode, string> = {
  explain: 'Надад тайлбарла',
  hint: 'Сэжүүр өг',
  desmos: 'Desmos-оор заа',
  mistake: 'Алдааг минь тайлбарла',
  similar: 'Төстэй бодлого өг',
  free: 'Асуулт',
};

/** System prompt the backend sends to Gemini (kept here so product & engineering share one source). */
export const SUU_SYSTEM_PROMPT = `Чи бол "Суу" — SuuPrep-ийн SAT Math багш хар муур.
Зарчим:
1. Хариуг шууд бүү хэл. Эхлээд сурагч юуг ойлгосныг тодруул.
2. Алдааны шалтгааныг (misconception) нэрлэ.
3. Дутуу ойлголтыг богино тайлбарла (монголоор, англи нэр томъёог хаалтанд).
4. Нэг сэжүүр өг. Desmos тохиромжтой бол Desmos-оор хэрхэн бодохыг алхам алхмаар заа.
5. Дараагийн алхмыг сурагчаар хийлгэ. Бүрэн бодолтыг зөвхөн хүссэн үед эсвэл 2 оролдлогын дараа өг.
Хэв маяг: дулаан, ухаалаг, бага зэрэг хошин; урт лекц биш. Математикийг $…$ TeX-ээр бич.
Desmos мөр санал болгох бол JSON: {"graph": ["y=2x+1", "y=-x+7"]}.`;

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

// ———— topic knowledge for non-question contexts ————
const TOPICS: Record<string, Partial<Record<TutorMode, TutorReply>>> = {
  Intersections: {
    explain: { text: 'Хоёр графикийн **огтлолцол** гэдэг нь хоёр тэгшитгэлийг **зэрэг** хангах $(x, y)$ цэг. Тиймээс систем тэгшитгэлийн шийд = огтлолцлын цэг.\nЖишээ: $y=2x+1$ ба $y=-x+7$ нь $(2,5)$-д уулзана, учир нь $2(2)+1=5$ ба $-2+7=5$.', followups: ['hint', 'desmos'] },
    hint: { text: 'Шулуун дээр нэг удаа дар — саарал цэгүүд гарч ирнэ. Хоёр шугам **нэгэн зэрэг** дайрч буй саарал цэгийг хай.', followups: ['desmos'] },
    desmos: { text: 'Desmos-оор:\n1. Мөр бүрт нэг тэгшитгэл бич.\n2. Аль нэг график дээр дар.\n3. Огтлолцол дээрх саарал цэгийг дарж координатыг уншина.', graph: ['y=2x+1', 'y=-x+7'] },
  },
  Roots: {
    explain: { text: '$f(x)=0$ тэгшитгэлийн шийдүүд нь $y=f(x)$ графикийн **x тэнхлэгийг огтлох** цэгүүд. Учир нь тэнд $y=0$.', followups: ['desmos'] },
    hint: { text: 'Параболыг дарахад x тэнхлэг дээр хоёр саарал цэг гарна. Асуулт аль нэгийг нь (эерэг/сөрөг) асууж байгааг анзаар.' },
    desmos: { text: '$y=x^2-x-6$ гэж бичээд x тэнхлэгийн огтлолыг хар: $-2$ ба $3$.', graph: ['y=x^2-x-6'] },
  },
  Sliders: {
    explain: { text: 'Үл мэдэгдэх тогтмол ($a$, $k$) байвал Desmos түүнийг **слайдер** болгоно. Слайдерыг гүйлгэхэд график хэрхэн өөрчлөгдөхийг харж, нөхцөлийг хангах утгыг олно.' },
    hint: { text: 'Шулуун $(2, 7)$ цэгийг яг дайрах хүртэл $a$-г гүйлгэ. Эсвэл $7=a(2)+1$ гэж орлуулаад бод.' },
    desmos: { text: 'Шулуун ба цэгээ хамт зур:', graph: ['y=ax+1', 'a=3', '(2,7)'] },
  },
  Tables: {
    explain: { text: 'Хүснэгтийн өгөгдөл шулуун шугамаар өөрчлөгдөж байвал **шугаман регресс** $y=mx+b$-г олно. Энд $m$ нь x 1-ээр өсөхөд y хэд өсөхийг заана.' },
    desmos: { text: 'Хүснэгтээ оруулаад регрессийг асаа:', graph: ['TABLE:1,3;2,5;3,7;4,9', 'y=2x+1'] },
  },
  'Mathematical English': {
    explain: { text: 'Түлхүүр дүрэм: **"less than"** ба **"subtracted from"** дарааллыг урвуулна. "5 less than x" → $x-5$, "5 subtracted from x" → $x-5$. Харин "the difference of 5 and x" → $5-x$.' },
    hint: { text: 'Өгүүлбэрийг хэсэг хэсгээр нь хуваа: эхлээд "a number" → $x$, дараа нь үйлдлийн үг, эцэст нь "is" → $=$.' },
  },
};

function fromQuestion(q: Question, mode: TutorMode, chosen?: string): TutorReply {
  switch (mode) {
    case 'hint':
      return { text: `Сэжүүр: ${q.hint}${q.vocab?.length ? `\nТүлхүүр үг: **${q.vocab.join(', ')}**.` : ''}`, followups: ['desmos', 'explain'] };
    case 'explain':
      return { text: `Алхам алхмаар:\n${q.explain}\n\nОдоо ижил санааг төстэй бодлогод өөрөө туршаад үзэх үү?`, followups: ['similar'] };
    case 'desmos':
      if (q.desmos) return { text: `Desmos стратеги: ${q.desmos.tip}`, graph: q.desmos.rows, followups: ['explain'] };
      return { text: 'Энэ бодлогод Desmos тийм ч их хэрэггүй — гараар 2–3 алхамд бодогдоно. ' + q.hint, followups: ['explain'] };
    case 'mistake': {
      const idx = chosen !== undefined && chosen !== '' ? Number(chosen) : NaN;
      const why = !Number.isNaN(idx) ? q.why?.[idx] : undefined;
      const pick = q.choices && !Number.isNaN(idx) ? q.choices[idx] : chosen;
      return {
        text: `Чи ${pick ? pick : 'өөр хариулт'} гэж сонгосон байна.\n${why || 'Энд гол алдаа нь асуулт юуг асууж буйг бүрэн уншаагүйд байх магадлалтай.'}\nЗөв санаа: ${q.explain}`,
        followups: ['similar', 'desmos'],
      };
    }
    case 'similar':
      return q.similar
        ? { text: 'Энэ төстэй бодлогыг өөрөө оролдоод үз. Дуусгасны дараа хариугаа надад хэлээрэй.', similarQid: q.similar }
        : { text: 'Төстэй бодлого одоогоор алга. Асуултын санг шүүгээд үзээрэй.' };
    default:
      return { text: q.hint };
  }
}

function classify(msg: string): TutorMode {
  const m = msg.toLowerCase();
  if (/desmos|граф|зур/.test(m)) return 'desmos';
  if (/сэжүүр|hint|туслаач|гацлаа/.test(m)) return 'hint';
  if (/алдаа|яагаад|буруу|mistake|wrong|why/.test(m)) return 'mistake';
  if (/төстэй|similar|өөр бодлого|дахиад/.test(m)) return 'similar';
  if (/тайлбар|explain|ойлгохгүй|юу гэсэн/.test(m)) return 'explain';
  return 'free';
}

export class DemoTutorService implements TutorService {
  readonly live = false;
  readonly label = 'Демо горим — урьдчилан бэлдсэн хариулт';
  async reply({ mode, message, ctx }: TutorRequest): Promise<TutorReply> {
    await wait(650 + Math.random() * 500);
    let m = mode === 'free' && message ? classify(message) : mode;
    if (ctx.qid) {
      const q = qById(ctx.qid);
      if (q) {
        if (m === 'free') {
          return { text: `Сайн асуулт. "${q.skill}" сэдэв дээр ажиллаж байна. Эхлээд чи юуг мэдэж байна, юуг олох ёстой вэ? Нэг өгүүлбэрээр бичээд үз. Гацвал "Сэжүүр өг" товчийг дар.`, followups: ['hint', 'desmos'] };
        }
        return fromQuestion(q, m, ctx.chosen);
      }
    }
    const topic = TOPICS[ctx.skill || ''];
    if (m === 'free') {
      if (message && /intersection|огтлол/.test(message.toLowerCase())) return TOPICS.Intersections.explain!;
      if (message && /язгуур|root|шийд/.test(message.toLowerCase())) return TOPICS.Roots.explain!;
      if (message && /at least|at most|less than|үг/.test(message.toLowerCase())) return TOPICS['Mathematical English'].explain!;
      return {
        text: `Би одоогоор **${ctx.title}** сэдвийн хүрээнд тусалж байна. Яг аль алхам дээр гацсанаа хэлбэл тэндээс нь эхэлье. Эсвэл доорх товчнуудын аль нэгийг сонго.`,
        followups: ['explain', 'hint', 'desmos'],
      };
    }
    const r = topic?.[m] || TOPICS.Intersections[m];
    if (r) return r;
    if (m === 'mistake') return { text: 'Сүүлийн алдаагаа "Алдааны дэвтэр"-ээс сонговол яг тэр бодлогын алдааг тайлбарлая.' };
    if (m === 'similar') return { text: 'Энэ сэдвээр төстэй бодлого:', similarQid: 'a2' };
    return { text: 'Сонирхолтой асуулт! Энэ сэдвийг бодлого дээр тулгуурлан тайлбарлавал илүү ойлгомжтой. Асуултын сангаас нэг бодлого сонгоод надаас асуугаарай.' };
  }
}

/** Live Gemini tutor via a backend proxy that holds the key and applies SUU_SYSTEM_PROMPT. */
export class GeminiTutorService implements TutorService {
  readonly live = true;
  readonly label = 'Gemini · шууд холболт';
  constructor(private endpoint: string) {}
  async reply(req: TutorRequest): Promise<TutorReply> {
    const q = req.ctx.qid ? qById(req.ctx.qid) : undefined;
    const res = await fetch(this.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mode: req.mode,
        message: req.message,
        context: { ...req.ctx, question: q ? { prompt: q.prompt, choices: q.choices, answer: q.answer, explain: q.explain, desmos: q.desmos } : undefined },
        history: req.history.slice(-10).map((m) => ({ role: m.role === 'suu' ? 'model' : 'user', text: m.text })),
      }),
    });
    if (!res.ok) throw new Error(`Tutor ${res.status}`);
    return (await res.json()) as TutorReply;
  }
}

let instance: TutorService | null = null;
export function getTutor(): TutorService {
  if (!instance) {
    const endpoint = (window as any).SUUPREP_TUTOR_ENDPOINT as string | undefined;
    instance = endpoint ? new GeminiTutorService(endpoint) : new DemoTutorService();
  }
  return instance;
}
