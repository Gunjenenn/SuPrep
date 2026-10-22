import type { Question, QuestionFilter } from '@/types';

export type BankFilter = QuestionFilter & {
  savedOnly?: boolean;
  savedIds?: string[];
};

export function filterQuestions(questions: Question[], filter: BankFilter = {}): Question[] {
  const search = filter.search?.trim().toLowerCase();
  const savedIds = new Set(filter.savedIds ?? []);

  return questions.filter((question) => {
    if (filter.domain && question.domain !== filter.domain) return false;

    if (filter.difficulty && question.difficulty !== filter.difficulty) {
      return false;
    }

    if (filter.desmosOnly && !question.desmos) return false;

    if (filter.savedOnly && !savedIds.has(question.id)) return false;

    if (search) {
      const searchableText = `${question.prompt} ${question.skill}`.toLowerCase();

      if (!searchableText.includes(search)) return false;
    }

    return true;
  });
}
