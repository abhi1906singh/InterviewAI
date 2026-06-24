import { Dispatch, SetStateAction, useState } from "react";
import { ResumeData } from "../types/resume";
import { Question } from "../types/question";
type Props = {
  resume: ResumeData;
    onQuestionsGenerated: Dispatch<SetStateAction<Question[]>>;
};
export default function QuestionGenerator({ resume, onQuestionsGenerated }:Props) {
  const [filters, setFilters] = useState({
    role: "",
    difficulty: "",
    focus: []
  });

  const handleGenerate = async () => {
    const res = await fetch("/api/generate-questions", {
      method: "POST",
      body: JSON.stringify({ resume, filters })
    });

    const data = await res.json();
    onQuestionsGenerated(data.questions);
  };

  return (
    <div className="mt-6 p-4 border rounded">
      <h3 className="text-xl font-semibold mb-3">
        Generate Interview Questions
      </h3>

      <select onChange={(e) => setFilters({...filters, role: e.target.value})}>
        <option value="">Role</option>
        <option value="frontend">Frontend</option>
        <option value="react">React</option>
        <option value="fullstack">Full Stack</option>
      </select>

      <select onChange={(e) => setFilters({...filters, difficulty: e.target.value})}>
        <option value="">Difficulty</option>
        <option value="easy">Easy</option>
        <option value="medium">Medium</option>
        <option value="hard">Hard</option>
      </select>

      <button
        onClick={handleGenerate}
        className="mt-3 px-4 py-2 bg-blue-500 text-white rounded"
      >
        Generate Questions
      </button>
    </div>
  );
}