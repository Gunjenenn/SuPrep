import { DesmosAiTutor } from '@/features/tutor/components/DesmosAiTutor';

// Pitch demo · /desmos/ai?l=slider — Суу teaches a question on a live Desmos graph, step by step.
export default async function DesmosAiPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const l = Array.isArray(sp.l) ? sp.l[0] : sp.l;
  return <DesmosAiTutor initial={l} />;
}
