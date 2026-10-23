'use server';

import { revalidatePath } from 'next/cache';
import { routes } from '@/lib/routes';
import { getDb } from '@/lib/supabase/server';

type SaveProgressInput = {
  lessonId: string;
  done: boolean;
  best: number;
};

type SaveProgressResult =
  | { ok: true }
  | {
      ok: false;
      reason: 'demo_mode' | 'unauthorized' | 'invalid_input' | 'lesson_not_found' | 'database_error';
    };

export async function saveJourneyProgress({
  lessonId,
  done,
  best,
}: SaveProgressInput): Promise<SaveProgressResult> {
  const db = await getDb();

  if (!db) {
    return { ok: false, reason: 'demo_mode' };
  }

  const {
    data: { user },
    error: authError,
  } = await db.auth.getUser();

  if (authError || !user) {
    return { ok: false, reason: 'unauthorized' };
  }

  if (
    typeof lessonId !== 'string' ||
    !lessonId.trim() ||
    lessonId.length > 100 ||
    typeof done !== 'boolean' ||
    !Number.isSafeInteger(best) ||
    best < 0
  ) {
    return { ok: false, reason: 'invalid_input' };
  }

  // Хичээл үнэхээр database-д байгаа эсэхийг шалгана.
  const { data: lesson, error: lessonError } = await db
    .from('lessons')
    .select('content')
    .eq('id', lessonId)
    .maybeSingle();

  if (lessonError) {
    return { ok: false, reason: 'database_error' };
  }

  if (!lesson) {
    return { ok: false, reason: 'lesson_not_found' };
  }

  const content = lesson.content as {
    kind?: string;
    variants?: unknown[][];
  };

  const isCheckpoint = content.kind === 'checkpoint';

  if (isCheckpoint) {
    const maxScore = content.variants?.[0]?.length ?? 0;

    if (maxScore === 0 || best > maxScore || done !== best / maxScore >= 0.8) {
      return { ok: false, reason: 'invalid_input' };
    }
  } else if (!done || best !== 0) {
    return { ok: false, reason: 'invalid_input' };
  }

  // SQL trigger нь update хийх үед:
  // done = өмнөх done OR шинэ done
  // best = өмнөх best болон шинэ best-ийн ихийг хадгална.
  const { error: writeError } = await db.from('lesson_progress').upsert(
    {
      user_id: user.id,
      lesson_id: lessonId,
      done,
      best,
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: 'user_id,lesson_id',
    },
  );

  if (writeError) {
    return { ok: false, reason: 'database_error' };
  }

  revalidatePath(routes.journey);

  return { ok: true };
}
