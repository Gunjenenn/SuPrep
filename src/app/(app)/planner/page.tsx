import { PlannerDemo } from '@/features/planner/components/PlannerDemo';
import { PHASES, SAT_DATES } from '@/mocks/meta';

// Section I · I4 — pitch demo: computed phases + a sample week (see features/planner/lib/demo-plan.ts).
export default function PlannerPage() {
  return <PlannerDemo dates={SAT_DATES} phases={PHASES} />;
}
