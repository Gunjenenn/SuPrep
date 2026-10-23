'use client';
import Link from 'next/link';
import { useState } from 'react';
import { routes } from '@/lib/routes';
import type { Lesson, NodeStatus } from '@/types';

type JourneyNodeProps = {
  lesson: Lesson;
  status: NodeStatus;
  index: number;
};

const statusStyles: Record<NodeStatus, string> = {
  done: 'bg-leaf text-white border-[var(--c-leaf-2)]',
  current: 'bg-lime text-[var(--c-on-lime)] border-[var(--c-lime-2)] ring-4 ring-[var(--c-glow)]',
  open: 'bg-paper text-ink border-[var(--c-line-2)]',
  locked: 'bg-paper-2 text-ink-3 border-line-2',
};

function NodeSymbol({ lesson, status, index }: JourneyNodeProps) {
  if (status === 'locked') {
    return <span aria-hidden="true">🔒</span>;
  }

  if (status === 'done') {
    return <span aria-hidden="true">✓</span>;
  }

  if (lesson.kind === 'checkpoint') {
    return <span aria-hidden="true">★</span>;
  }

  return <span aria-hidden="true">{index + 1}</span>;
}

export function JourneyNode({ lesson, status, index }: JourneyNodeProps) {
  const locked = status === 'locked';
  const href =
    lesson.kind === 'desmos' ? routes.desmos(lesson.desmosId ?? lesson.id) : routes.lesson(lesson.id);
  const [shaking, setShaking] = useState(false);

  const coin = (
    <span
      className={[
        'relative grid size-16 place-items-center rounded-full',
        'border-[3px] text-xl font-black',
        'shadow-[0_5px_0_var(--c-edge)]',
        'transition-transform duration-200',
        locked ? 'opacity-65' : 'group-hover:-translate-y-1',
        statusStyles[status],
      ].join(' ')}
    >
      <NodeSymbol lesson={lesson} status={status} index={index} />
    </span>
  );

  return (
    <div className="flex min-w-0 flex-col items-center gap-2 text-center">
      {locked ? (
        <button
          type="button"
          aria-label={`${lesson.title} — түгжээтэй`}
          className={`group cursor-not-allowed ${shaking ? 'journey-locked-shake' : ''}`}
          onClick={() => {
            setShaking(false);
            requestAnimationFrame(() => setShaking(true));
          }}
          onAnimationEnd={() => setShaking(false)}
        >
          {coin}
        </button>
      ) : (
        <Link
          href={href}
          aria-label={`${lesson.title} — ${status === 'done' ? 'дууссан' : 'нээлттэй'}`}
          className="group rounded-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--c-leaf)]"
        >
          {coin}
        </Link>
      )}

      <div className="max-w-28">
        <p className="text-xs font-bold text-ink">{lesson.title}</p>
        <p className="mt-0.5 text-[11px] text-ink-3">
          {lesson.xp} XP · {lesson.minutes} мин
        </p>
      </div>
    </div>
  );
}
