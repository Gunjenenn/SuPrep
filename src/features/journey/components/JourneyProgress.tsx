'use client';

import { useEffect, useState } from 'react';
import type { Stage } from '@/types';
import { loadLocalProgress } from '../lib/local-progress';
import type { LessonProgress } from '../queries';
import { JourneyMap } from './JourneyMap';

type Props = {
  stages: Stage[];
  progress: LessonProgress[];
  demoMode: boolean;
};

export function JourneyProgress({ stages, progress, demoMode }: Props) {
  const [localProgress, setLocalProgress] = useState<LessonProgress[]>([]);

  useEffect(() => {
    if (demoMode) {
      setLocalProgress(loadLocalProgress());
    }
  }, [demoMode]);

  return <JourneyMap stages={stages} progress={demoMode ? localProgress : progress} />;
}
