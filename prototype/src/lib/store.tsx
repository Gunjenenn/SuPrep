// Demo state for the prototype, persisted to localStorage.
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { ALL_NODES, LessonNode, STAGES, levelFor } from '../data/curriculum';
import { DESMOS } from '../data/desmos';
import { QUESTS } from '../data/meta';
import { QUESTIONS, Domain } from '../data/questions';
import { Card, LEITNER_DAYS } from '../data/cards';

export type Route =
  | { name: 'landing' }
  | { name: 'onboarding' }
  | { name: 'dashboard' }
  | { name: 'journey' }
  | { name: 'lesson'; id: string }
  | { name: 'desmos'; id?: string }
  | { name: 'bank' }
  | { name: 'hard' }
  | { name: 'formulas' }
  | { name: 'league' }
  | { name: 'help' }
  | { name: 'planner' }
  | { name: 'practice'; ids: string[]; timed?: number; title: string; nodeId?: string }
  | { name: 'tutor' }
  | { name: 'progress' }
  | { name: 'mistakes' }
  | { name: 'achievements' }
  | { name: 'vocab' }
  | { name: 'mock' };

export type Mistake = { id: string; qid: string; chosen: string; at: number; resolved: boolean; source: string; box?: number; due?: number };
export const REVIEW_GAPS = [1, 3, 7]; // days between spaced reviews; 3 correct reviews = mastered
export type ChatMsg = { role: 'user' | 'suu'; text: string; graph?: string[]; mode?: string; at: number };
export type TutorCtx = { kind: 'lesson' | 'desmos' | 'question' | 'mistake' | 'general'; title: string; problem?: string; qid?: string; skill?: string; chosen?: string };

export type Profile = {
  name: string;
  onboarded: boolean;
  confidence?: number;
  satExp?: string;
  desmos?: string;
  target: number;
  examDate: string;
  start?: 'english' | 'foundations' | 'desmos';
};

export type State = {
  v: number;
  profile: Profile;
  xp: number;
  xpLog: { day: string; amount: number; reason: string }[];
  streak: { count: number; last: string };
  done: Record<string, { at: number; score?: number }>;
  badges: Record<string, number>;
  quests: { day: string; p: Record<string, number>; claimed: Record<string, boolean> };
  mistakes: Mistake[];
  saved: string[];
  answered: Record<string, { ok: boolean; at: number }>;
  words: string[];
  skill: Record<string, number>;
  ctx: TutorCtx;
  chat: ChatMsg[];
  theme?: 'light' | 'dark';
  cards: Record<string, CardState>;
  notes: Record<string, string>;
  myCards: Card[];
  reminder: { on: boolean; time: string };
};
export type CardState = { box: number; due: number; seen: number; ok: number };

export type Reward =
  | { id: number; type: 'xp'; amount: number; reason: string }
  | { id: number; type: 'level'; level: number }
  | { id: number; type: 'badge'; badge: string }
  | { id: number; type: 'quest'; quest: string };

const KEY = 'suuprep-demo-v3';
export const mnDate = (d: Date | number | string) => { const x = new Date(typeof d === 'string' ? d + 'T09:00:00' : d); return `${x.getMonth() + 1}-р сарын ${x.getDate()}`; };
export const dayKey = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const daysAgo = (n: number) => { const d = new Date(); d.setDate(d.getDate() - n); return dayKey(d); };

export function seed(): State {
  const log = [
    { n: 6, a: 40 }, { n: 5, a: 60 }, { n: 4, a: 35 }, { n: 3, a: 80 }, { n: 2, a: 55 }, { n: 1, a: 70 },
  ];
  return {
    v: 3,
    profile: { name: 'Тэмүүлэн', onboarded: false, target: 700, examDate: '2026-12-05', confidence: 2, desmos: 'none' },
    xp: 380,
    xpLog: [{ day: daysAgo(9), amount: 40, reason: 'Эхлэл' }, ...log.map((l) => ({ day: daysAgo(l.n), amount: l.a, reason: 'Хичээл' }))],
    streak: { count: 6, last: daysAgo(1) },
    done: { 's1-l1': { at: Date.now() - 3 * 864e5, score: 4 }, 's1-l2': { at: Date.now() - 864e5, score: 4 } },
    badges: { 'first-equation': Date.now() - 3 * 864e5 },
    quests: { day: dayKey(), p: {}, claimed: {} },
    mistakes: [
      { id: 'm1', qid: 'p5', chosen: '1', at: Date.now() - 2 * 864e5, resolved: false, source: 'Дасгал', box: 0, due: Date.now() - 36e5 },
      { id: 'm2', qid: 'v2', chosen: '0', at: Date.now() - 864e5, resolved: false, source: 'Дасгал', box: 1, due: Date.now() - 6e5 },
      { id: 'm3', qid: 'h1', chosen: '4', at: Date.now() - 4 * 864e5, resolved: false, source: 'Хүнд асуулт', box: 0, due: Date.now() - 2 * 36e5 },
      { id: 'm5', qid: 'a2', chosen: '3', at: Date.now() - 6 * 864e5, resolved: false, source: 'Дасгал', box: 1, due: Date.now() + 3 * 864e5 },
      { id: 'm6', qid: 'h3', chosen: '2', at: Date.now() - 9 * 864e5, resolved: false, source: 'Бүтэн тест', box: 2, due: Date.now() + 6 * 864e5 },
      { id: 'm4', qid: 'g2', chosen: '1', at: Date.now() - 5 * 864e5, resolved: true, source: 'Дасгал' },
    ],
    saved: ['v3', 'a5'],
    answered: { a3: { ok: true, at: 0 }, p1: { ok: true, at: 0 }, p5: { ok: false, at: 0 }, v2: { ok: false, at: 0 }, a2: { ok: false, at: 0 }, g2: { ok: false, at: 0 }, g1: { ok: true, at: 0 } },
    words: ['Sum', 'Difference', 'Product', 'Quotient', 'Twice', 'Increased by', 'Decreased by', 'Integer'],
    skill: { english: 58, foundations: 34, desmos: 8, alg: 52, adv: 31, psda: 44, geo: 27, strategy: 12 },
    ctx: { kind: 'general', title: 'Ерөнхий' },
    chat: [],
    cards: {
      sum: { box: 3, due: Date.now() + 2 * 864e5, seen: 4, ok: 4 }, difference: { box: 2, due: Date.now() - 36e5, seen: 3, ok: 2 },
      product: { box: 1, due: Date.now() - 2 * 36e5, seen: 2, ok: 1 }, quotient: { box: 1, due: Date.now() - 36e5, seen: 2, ok: 1 },
      twice: { box: 4, due: Date.now() + 9 * 864e5, seen: 5, ok: 5 }, atleast: { box: 1, due: Date.now() - 6e5, seen: 2, ok: 1 },
      'f-carea': { box: 2, due: Date.now() - 36e5, seen: 3, ok: 2 }, 'f-pyth': { box: 3, due: Date.now() + 864e5, seen: 3, ok: 3 },
    },
    notes: {},
    myCards: [
      { id: 'my-1', front: 'in terms of', ipa: '/ɪn tɜːmz əv/', say: 'ин төмз ов', back: '…-ээр илэрхийлбэл', hook: 'Миний тэмдэглэл: «y-г x-ээр бич» гэсэн үг.', ex: '$y$ **in terms of** $x$ → $y=2x+1$', art: 'line' },
    ],
    reminder: { on: true, time: '20:00' },
  };
}

function load(): State {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const s = JSON.parse(raw) as State;
      if (s.v === 3) return s;
    }
  } catch {}
  return seed();
}

type Ctx = ReturnType<typeof useProvideStore>;
const StoreCtx = createContext<Ctx | null>(null);

function useProvideStore() {
  const [s, setS] = useState<State>(load);
  const [route, setRoute] = useState<Route>(() => initialRoute());
  const [rewards, setRewards] = useState<Reward[]>([]);
  const rid = useRef(0);

  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch {} }, [s]);
  // daily quest reset
  useEffect(() => { if (s.quests.day !== dayKey()) setS((p) => ({ ...p, quests: { day: dayKey(), p: {}, claimed: {} } })); }, [s.quests.day]);
  useEffect(() => {
    const root = document.documentElement;
    if (s.theme) root.setAttribute('data-theme', s.theme);
  }, [s.theme]);

  const push = useCallback((r: Omit<Reward, 'id'> & any) => setRewards((rs) => [...rs, { ...r, id: ++rid.current }]), []);
  const dismiss = useCallback((id: number) => setRewards((rs) => rs.filter((r) => r.id !== id)), []);

  const go = useCallback((r: Route) => {
    setRoute(r);
    try { window.scrollTo({ top: 0 }); } catch {}
    document.getElementById('main-scroll')?.scrollTo({ top: 0 });
  }, []);

  /** Award XP, maintain streak, detect level up. Pure on state; rewards pushed after. */
  const award = useCallback((amount: number, reason: string) => {
    setS((p) => {
      const today = dayKey();
      let streak = p.streak;
      if (p.streak.last !== today) {
        const y = daysAgo(1);
        streak = { count: p.streak.last === y ? p.streak.count + 1 : 1, last: today };
      }
      const before = levelFor(p.xp).n;
      const xp = p.xp + amount;
      const after = levelFor(xp).n;
      const badges = { ...p.badges };
      const newBadges: string[] = [];
      if (streak.count >= 7 && !badges['streak-7']) { badges['streak-7'] = Date.now(); newBadges.push('streak-7'); }
      if (after >= 6 && !badges['math-master']) { badges['math-master'] = Date.now(); newBadges.push('math-master'); }
      setTimeout(() => {
        push({ type: 'xp', amount, reason });
        if (after > before) push({ type: 'level', level: after });
        newBadges.forEach((b) => push({ type: 'badge', badge: b }));
      }, 0);
      return { ...p, xp, streak, badges, xpLog: [...p.xpLog, { day: today, amount, reason }] };
    });
  }, [push]);

  const giveBadge = useCallback((id: string) => {
    setS((p) => {
      if (p.badges[id]) return p;
      setTimeout(() => push({ type: 'badge', badge: id }), 0);
      return { ...p, badges: { ...p.badges, [id]: Date.now() } };
    });
  }, [push]);

  const bumpQuest = useCallback((qid: string, n = 1) => {
    setS((p) => {
      const q = QUESTS.find((x) => x.id === qid)!;
      const cur = p.quests.p[qid] || 0;
      const next = Math.min(q.target, cur + n);
      const quests = { ...p.quests, p: { ...p.quests.p, [qid]: next } };
      if (next >= q.target && !p.quests.claimed[qid]) {
        quests.claimed = { ...quests.claimed, [qid]: true };
        setTimeout(() => { push({ type: 'quest', quest: qid }); award(q.xp, `Өдрийн даалгавар: ${q.title}`); }, 400);
      }
      return { ...p, quests };
    });
  }, [push, award]);

  const completeNode = useCallback((id: string, score?: number) => {
    const node = ALL_NODES.find((n) => n.id === id);
    setS((p) => {
      const first = !p.done[id];
      const skill = { ...p.skill };
      if (node && first) {
        const key = node.stage.id === 's1' ? 'english' : node.stage.id === 's2' ? 'foundations' : node.stage.id === 's3' ? 'desmos' : node.stage.id === 's5' ? 'strategy' : null;
        if (key) skill[key] = Math.min(100, skill[key] + (node.kind === 'checkpoint' ? 16 : 10));
      }
      return { ...p, done: { ...p.done, [id]: { at: Date.now(), score } }, skill };
    });
  }, []);

  const learnWords = useCallback((words: string[]) => {
    setS((p) => ({ ...p, words: [...new Set([...p.words, ...words])] }));
    bumpQuest('words', words.length);
  }, [bumpQuest]);

  const recordAnswer = useCallback((qid: string, ok: boolean, chosen: string, source: string) => {
    const q = QUESTIONS.find((x) => x.id === qid);
    setS((p) => {
      const skill = { ...p.skill };
      if (q) skill[q.domain] = Math.max(0, Math.min(100, skill[q.domain] + (ok ? 4 : -2)));
      let mistakes = p.mistakes;
      if (!ok && !p.mistakes.some((m) => m.qid === qid && !m.resolved)) {
        mistakes = [{ id: `m${Date.now()}`, qid, chosen, at: Date.now(), resolved: false, source, box: 0, due: Date.now() }, ...p.mistakes];
      }
      return { ...p, skill, mistakes, answered: { ...p.answered, [qid]: { ok, at: Date.now() } } };
    });
    bumpQuest('practice');
  }, [bumpQuest]);

  const resolveMistake = useCallback((id: string) => {
    let count = 0;
    setS((p) => {
      const mistakes = p.mistakes.map((m) => (m.id === id ? { ...m, resolved: true } : m));
      count = mistakes.filter((m) => m.resolved).length;
      return { ...p, mistakes };
    });
    award(15, 'Алдаагаа давтлаа');
    bumpQuest('mistakes');
    setTimeout(() => { if (count >= 3) giveBadge('mistake-mender'); }, 50);
  }, [award, bumpQuest, giveBadge]);

  /** A correct spaced review moves the card up a box; after the third box it is mastered. */
  const reviewMistake = useCallback((id: string) => {
    let mastered = false, count = 0;
    setS((p) => {
      const mistakes = p.mistakes.map((m) => {
        if (m.id !== id) return m;
        const box = (m.box ?? 0) + 1;
        if (box >= REVIEW_GAPS.length) { mastered = true; return { ...m, box, resolved: true }; }
        return { ...m, box, due: Date.now() + REVIEW_GAPS[box] * 864e5 };
      });
      count = mistakes.filter((m) => m.resolved).length;
      return { ...p, mistakes };
    });
    setTimeout(() => {
      award(mastered ? 30 : 15, mastered ? 'Алдаагаа бүрэн эзэмшлээ' : 'Алдаагаа давтлаа');
      bumpQuest('mistakes');
      if (count >= 3) giveBadge('mistake-mender');
    }, 0);
  }, [award, bumpQuest, giveBadge]);

  /** Leitner grading: knew → next box (1/3/7/14 days); forgot → box 1, see again today. */
  const gradeCard = useCallback((id: string, knew: boolean) => {
    setS((p) => {
      const cur = p.cards[id] || { box: 0, due: 0, seen: 0, ok: 0 };
      const box = knew ? Math.min(LEITNER_DAYS.length - 1, cur.box + 1) : 1;
      const due = knew ? Date.now() + LEITNER_DAYS[box] * 864e5 : Date.now();
      return { ...p, cards: { ...p.cards, [id]: { box, due, seen: cur.seen + 1, ok: cur.ok + (knew ? 1 : 0) } } };
    });
  }, []);
  const setNote = useCallback((id: string, text: string) => setS((p) => ({ ...p, notes: { ...p.notes, [id]: text } })), []);
  const addMyCard = useCallback((c: Card) => setS((p) => ({ ...p, myCards: [...p.myCards, c] })), []);
  const removeMyCard = useCallback((id: string) => setS((p) => ({ ...p, myCards: p.myCards.filter((c) => c.id !== id) })), []);
  const setReminder = useCallback((r: { on: boolean; time: string }) => setS((p) => ({ ...p, reminder: r })), []);

  const toggleSave = useCallback((qid: string) => setS((p) => ({ ...p, saved: p.saved.includes(qid) ? p.saved.filter((x) => x !== qid) : [...p.saved, qid] })), []);
  const setCtx = useCallback((ctx: TutorCtx) => setS((p) => ({ ...p, ctx })), []);
  const addChat = useCallback((m: ChatMsg) => setS((p) => ({ ...p, chat: [...p.chat, m].slice(-60) })), []);
  const clearChat = useCallback(() => setS((p) => ({ ...p, chat: [] })), []);
  const setProfile = useCallback((pr: Partial<Profile>) => setS((p) => ({ ...p, profile: { ...p.profile, ...pr } })), []);
  const setTheme = useCallback((theme?: 'light' | 'dark') => setS((p) => ({ ...p, theme })), []);
  const reset = useCallback(() => { const n = seed(); setS(n); setRewards([]); setRoute({ name: 'landing' }); }, []);

  return useMemo(
    () => ({ s, route, go, award, giveBadge, bumpQuest, completeNode, learnWords, recordAnswer, resolveMistake, reviewMistake, gradeCard, setNote, addMyCard, removeMyCard, setReminder, toggleSave, setCtx, addChat, clearChat, setProfile, setTheme, reset, rewards, dismiss }),
    [s, route, go, award, giveBadge, bumpQuest, completeNode, learnWords, recordAnswer, resolveMistake, reviewMistake, gradeCard, setNote, addMyCard, removeMyCard, setReminder, toggleSave, setCtx, addChat, clearChat, setProfile, setTheme, reset, rewards, dismiss]
  );
}

function initialRoute(): Route {
  const h = (typeof location !== 'undefined' ? location.hash : '').replace('#', '');
  const simple: Record<string, Route> = {
    dashboard: { name: 'dashboard' }, journey: { name: 'journey' }, desmos: { name: 'desmos' }, bank: { name: 'bank' },
    tutor: { name: 'tutor' }, progress: { name: 'progress' }, mistakes: { name: 'mistakes' }, achievements: { name: 'achievements' },
    vocab: { name: 'vocab' }, mock: { name: 'mock' }, onboarding: { name: 'onboarding' },
    hard: { name: 'hard' }, formulas: { name: 'formulas' }, league: { name: 'league' }, help: { name: 'help' }, planner: { name: 'planner' },
  };
  return simple[h] || { name: 'landing' };
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const v = useProvideStore();
  return <StoreCtx.Provider value={v}>{children}</StoreCtx.Provider>;
}
export function useStore() {
  const c = useContext(StoreCtx);
  if (!c) throw new Error('no store');
  return c;
}

// ———— derived ————
export type NodeStatus = 'done' | 'current' | 'open' | 'locked';

export function stageUnlocked(s: State, stageId: string) {
  switch (stageId) {
    case 's1': return true;
    case 's2': return !!s.done['s1-cp'];
    case 's3': return true;
    case 's4': return !!s.done['s2-cp'];
    case 's5': return !!s.done['s3-cp'] || !!s.done['s4-cp'];
  }
  return false;
}

export function nodeStatus(s: State, node: LessonNode, stageId: string): NodeStatus {
  if (s.done[node.id]) return 'done';
  if (!stageUnlocked(s, stageId)) return 'locked';
  const stage = STAGES.find((x) => x.id === stageId)!;
  const idx = stage.nodes.findIndex((n) => n.id === node.id);
  const sequential = stageId === 's1' || stageId === 's2' || stageId === 's5';
  if (stageId === 's4' && node.id === 's4-cp') {
    const sets = stage.nodes.filter((n) => n.id !== 's4-cp');
    if (!sets.every((n) => s.done[n.id])) return 'locked';
  }
  const firstOpen = stage.nodes.find((n) => !s.done[n.id]);
  if (sequential) {
    const prev = stage.nodes[idx - 1];
    if (prev && !s.done[prev.id]) return 'locked';
  }
  return firstOpen?.id === node.id ? 'current' : 'open';
}

/** The next thing to study, for "Continue learning". */
export function nextNode(s: State) {
  for (const stage of STAGES) {
    if (stage.id === 's3') continue;
    if (!stageUnlocked(s, stage.id)) continue;
    for (const n of stage.nodes) {
      const st = nodeStatus(s, n, stage.id);
      if (st === 'current' || st === 'open') return { node: n, stage };
    }
  }
  const d = STAGES[2];
  const n = d.nodes.find((x) => !s.done[x.id]);
  return n ? { node: n, stage: d } : null;
}

export function desmosDoneCount(s: State) {
  return DESMOS.filter((d) => s.done[`s3-${d.id === 'd9' ? 'cp' : d.id}`]).length;
}
export const desmosNodeId = (dId: string) => (dId === 'd9' ? 's3-cp' : `s3-${dId}`);

export function domainMastery(s: State, d: Domain) {
  return Math.round(s.skill[d] ?? 0);
}
