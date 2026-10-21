import { TutorChat } from "@/components/TutorChat";
import { requireUser } from "@/lib/auth";

export default async function TutorPage() {
  await requireUser();
  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-display text-3xl font-black">AI багш Суу</h1>
        <p className="mt-1 text-sm text-ink/60">
          SAT математикийн ойлголт, томьёо, бодох арга — монголоор асуугаарай. Тодорхой асуулт дээр туслуулах бол
          Асуултын сангаас тухайн асуултаа нээгээрэй.
        </p>
      </div>
      <div className="card mx-auto max-w-3xl overflow-hidden">
        <TutorChat height="h-[calc(100vh-15rem)] min-h-[480px]" />
      </div>
    </div>
  );
}
