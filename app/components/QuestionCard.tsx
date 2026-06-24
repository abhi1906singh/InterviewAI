import { Question } from "../types/question";

type Props = {
  question: Question;
};

export default function QuestionCard({ question }: Props) {
  return (
    <div className="p-4 border rounded-lg mt-3 shadow-sm bg-white">
      
      {/* Question */}
      <p className="text-base font-medium text-gray-800">
        {question.question}
      </p>

      {/* Meta Info */}
      <div className="flex gap-3 mt-2 text-xs text-gray-500">
        {question.type && (
          <span className="px-2 py-1 bg-gray-100 rounded">
            {question.type}
          </span>
        )}
        {question.difficulty && (
          <span className="px-2 py-1 bg-gray-100 rounded">
            {question.difficulty}
          </span>
        )}
      </div>

    </div>
  );
}