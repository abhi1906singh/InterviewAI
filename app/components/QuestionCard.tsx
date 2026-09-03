import { Question } from "../types/question";
import { HelpCircle } from "lucide-react";

type Props = {
  question: Question;
};

export default function QuestionCard({ question }: Props) {
  const getDifficultyBadge = (difficulty?: string) => {
    switch (difficulty?.toLowerCase()) {
      case "easy":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "hard":
        return "bg-rose-50 text-rose-700 border-rose-200";
      case "medium":
      default:
        return "bg-amber-50 text-amber-700 border-amber-200";
    }
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:border-indigo-200 transition">
      <div className="flex items-start gap-3">
        <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600 mt-0.5">
          <HelpCircle className="h-4 w-4" />
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {question.order && (
              <span className="text-xs font-bold text-gray-400">
                Q{question.order}
              </span>
            )}
            {question.type && (
              <span className="rounded-md border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs font-medium text-gray-600 capitalize">
                {question.type}
              </span>
            )}
            {question.difficulty && (
              <span
                className={`rounded-md border px-2 py-0.5 text-xs font-medium capitalize ${getDifficultyBadge(
                  question.difficulty
                )}`}
              >
                {question.difficulty}
              </span>
            )}
          </div>

          <p className="text-sm font-medium text-gray-900 leading-relaxed">
            {question.question}
          </p>
        </div>
      </div>
    </div>
  );
}