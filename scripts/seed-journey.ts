import { createClient } from '@supabase/supabase-js';
import { STAGES } from '../src/mocks/stages';

type StageRow = {
  id: string;
  no: number;
  content: (typeof STAGES)[number];
};

type LessonRow = {
  id: string;
  content: (typeof STAGES)[number]['nodes'][number];
};

function getSeedConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;

  // Seed script нь зөвхөн сервер талд ашиглах
  // нууц түлхүүрээр ажиллана.
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL болон SUPABASE_SERVICE_ROLE_KEY тохируулаагүй байна.');
  }

  return { url, key };
}

async function seedJourney() {
  const { url, key } = getSeedConfig();

  const db = createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const stages: StageRow[] = STAGES.map((stage) => ({
    id: stage.id,
    no: stage.no,
    content: stage,
  }));

  const lessons: LessonRow[] = STAGES.flatMap((stage) =>
    stage.nodes.map((lesson) => ({
      id: lesson.id,
      content: lesson,
    })),
  );

  const stageIds = new Set(stages.map((stage) => stage.id));
  const lessonIds = new Set(lessons.map((lesson) => lesson.id));

  if (stageIds.size !== stages.length) {
    throw new Error('Stage ID давхардсан байна.');
  }

  if (lessonIds.size !== lessons.length) {
    throw new Error('Lesson ID давхардсан байна.');
  }

  console.log(`Seed бэлэн: ${stages.length} stages, ${lessons.length} lessons.`);

  const { error: stageError } = await db.from('stages').upsert(stages, { onConflict: 'id' });

  if (stageError) {
    throw new Error(`Stages seed алдаа: ${stageError.message}`);
  }

  console.log('Stages хадгалагдлаа.');

  const { error: lessonError } = await db.from('lessons').upsert(lessons, { onConflict: 'id' });

  if (lessonError) {
    throw new Error(`Lessons seed алдаа: ${lessonError.message}`);
  }

  console.log('Lessons хадгалагдлаа.');
  console.log('Journey seed амжилттай дууслаа!');
}

seedJourney().catch((error: unknown) => {
  console.error('Journey seed амжилтгүй:', error);
  process.exitCode = 1;
});
