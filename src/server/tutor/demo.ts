// Demo replies used when Gemini isn't configured. G1 grows this into DemoTutorService.
import type { TutorMode } from '@/types';

const REPLIES: Record<TutorMode, string> = {
  hint: 'Эхлээд асуулт юуг асууж байгааг тодорхойлъё. Мэдэгдэж байгаа утгуудаа бичээд, нэг алхам хийгээд үз.',
  explain: 'Алхам алхмаар бодъё: 1) тэгшитгэлээ бич, 2) хувьсагчаа нэг талд гарга, 3) хариугаа шалга.',
  desmos: 'Desmos-д тэгшитгэл бүрийг тусад нь бичээд, огтлолцол эсвэл саарал цэг дээр дараарай.',
  similar: 'Ижил төстэй асуулт: $2x+3=11$ бол $x$ хэд вэ?',
  translate: 'Асуултын гол үгсийг монголоор тайлбарлая: **at least** = хамгийн багадаа (≥).',
};

export function demoReply(mode: TutorMode = 'hint'): string {
  return REPLIES[mode] ?? REPLIES.hint;
}
