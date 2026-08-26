import { useState } from "react";
import { ResumeData } from "../types/resume";
import { Question } from "../types/question";
import { Sparkles, Loader2 } from "lucide-react";

type Props = {
  resume: ResumeData;
  onQuestionsGenerated: (questions: Question[], sessionId?: string) => void;
};

export default function QuestionGenerator({
  resume,
  onQuestionsGenerated,
}: Props) {
  const [filters, setFilters] = useState({
    role: "Full Stack Developer",
    difficulty: "Medium",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/generate-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resume,
          resumeId: resume.id,
          filters,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to generate questions");
      }

      onQuestionsGenerated(data.questions, data.sessionId);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-8 rounded-xl border border-indigo-100 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="h-5 w-5 text-indigo-600" />
        <h3 className="text-lg font-semibold text-gray-900">
          Generate AI Interview Questions
        </h3>
      </div>

      <p className="text-sm text-gray-600 mb-5">
        Customize your practice session by choosing the targeted role and
        difficulty level based on your resume.
      </p>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 border border-red-200">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
            Target Role
          </label>
          <select
            value={filters.role}
            onChange={(e) => setFilters({ ...filters, role: e.target.value })}
            className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-800 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="Frontend Developer">Frontend Developer</option>
            <option value="React / Next.js Developer">
              React / Next.js Developer
            </option>
            <option value="Backend Developer">Backend Developer</option>
            <option value="Full Stack Developer">Full Stack Developer</option>
            <option value="Software Engineer">Software Engineer</option>
            <option value="DevOps / Cloud Engineer">
              DevOps / Cloud Engineer
            </option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
            Difficulty Level
          </label>
          <select
            value={filters.difficulty}
            onChange={(e) =>
              setFilters({ ...filters, difficulty: e.target.value })
            }
            className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-800 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="Easy">Easy (Junior / Intern)</option>
            <option value="Medium">Medium (Mid-level)</option>
            <option value="Hard">Hard (Senior / Staff)</option>
          </select>
        </div>
      </div>

      <button
        onClick={handleGenerate}
        disabled={loading}
        className="inline-flex items-center justify-center gap-2 w-full sm:w-auto rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50 transition cursor-pointer"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Analyzing Resume & Generating Questions...
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4" />
            Generate Questions
          </>
        )}
      </button>
    </div>
  );
}
