'use client';

import { useEffect, useState } from 'react';
import { getRemainingSeconds } from '../lib/exam-machine';

type ExamTimerProps = {
  endsAt: string | null;
  onTimeUp: () => void;
};

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

export function ExamTimer({ endsAt, onTimeUp }: ExamTimerProps) {
  const [remaining, setRemaining] = useState(() => getRemainingSeconds(endsAt));

  useEffect(() => {
    if (!endsAt) return;

    const update = () => {
      setRemaining(getRemainingSeconds(endsAt));
    };

    update();

    const interval = window.setInterval(update, 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, [endsAt]);

  useEffect(() => {
    if (endsAt && remaining === 0) {
      onTimeUp();
    }
  }, [endsAt, remaining, onTimeUp]);

  return (
    <div
      role="timer"
      aria-label="Шалгалтын үлдсэн хугацаа"
      className="rounded-xl border px-4 py-2 text-center"
    >
      <p className="text-xs text-muted-foreground">Үлдсэн хугацаа</p>

      <p className="text-2xl font-semibold tabular-nums">{formatTime(remaining)}</p>
    </div>
  );
}
