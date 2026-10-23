import { Bar } from '@/components/ui/Bar';
import { Pill } from '@/components/ui/Pill';
import type { NodeStatus, Stage } from '@/types';
import { JourneyNode } from './JourneyNode';

type StageSectionProps = {
  stage: Stage;
  getStatus: (lessonId: string) => NodeStatus;
};

export function StageSection({ stage, getStatus }: StageSectionProps) {
  const statuses = stage.nodes.map((node) => getStatus(node.id));
  const completed = statuses.filter((status) => status === 'done').length;
  const total = stage.nodes.length;
  const progress = total > 0 ? completed / total : 0;

  const isLocked = statuses.every((status) => status === 'locked');

  return (
    <section
      aria-labelledby={`stage-${stage.no}`}
      className="rounded-3xl border border-line bg-paper p-5 shadow-[var(--shadow-card)] sm:p-7"
    >
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="mb-2 text-xs font-extrabold uppercase tracking-widest text-leaf-2">
            Stage {String(stage.no).padStart(2, '0')}
          </p>

          <h2 id={`stage-${stage.no}`} className="text-2xl font-black tracking-tight text-ink">
            {stage.title}
          </h2>

          <p className="mt-1 text-sm text-ink-2">{stage.blurb}</p>
        </div>

        <Pill tone={isLocked ? 'neutral' : progress === 1 ? 'leaf' : 'amber'}>
          {isLocked
            ? 'Түгжээтэй'
            : progress === 1
              ? 'Дууссан'
              : stage.alwaysOpen
                ? 'Нээлттэй'
                : 'Үргэлжилж байна'}
        </Pill>
      </div>

      <div className="mb-8">
        <div className="mb-2 flex justify-between text-xs font-semibold text-ink-2">
          <span>Ахиц</span>
          <span>
            {completed}/{total} хичээл
          </span>
        </div>

        <Bar value={progress} tone={progress === 1 ? 'leaf' : 'lime'} label={`${stage.title} ахиц`} />
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
        {stage.nodes.map((lesson, index) => (
          <JourneyNode key={lesson.id} lesson={lesson} index={index} status={statuses[index]} />
        ))}
      </div>
    </section>
  );
}
