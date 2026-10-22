import { QuestionBank } from '@/features/practice/components/QuestionBank';
import { listQuestions } from '@/features/practice/queries';

// Section C · C3
export default async function HardPage() {
  const questions = await listQuestions({ difficulty: 3 });

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 p-6">
      <header className="space-y-2">
        <p className="text-sm font-medium text-blue-600">SAT MATH</p>
        <h1 className="text-3xl font-bold">Hard Question Zone</h1>
        <p className="text-gray-600">
          700+ оноо зорьж байна уу? Эдгээр хүнд түвшний асуултаар ур чадвараа сорьж, SAT Math-д бэлдээрэй.
        </p>
      </header>

      <QuestionBank questions={questions} hardOnly />
    </div>
  );
}
