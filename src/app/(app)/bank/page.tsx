import { QuestionBank } from '@/features/practice/components/QuestionBank';
import { listQuestions } from '@/features/practice/queries';

// Section C · C2
export default async function BankPage() {
  const questions = await listQuestions();

  return <QuestionBank questions={questions} />;
}
