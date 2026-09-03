"use client";

import { useState } from "react";
import Link from "next/link";
import UploadBox from "../components/UploadBox";
import ResumeResult from "../components/ResumeResult";
import { ResumeData } from "../types/resume";
import QuestionGenerator from "../components/QuestionGenerator";
import { Question } from "../types/question";
import QuestionCard from "../components/QuestionCard";
import ResumeUploadSuccess from "../components/ResumeUploadSuccess";
import { PlayCircle, ArrowRight } from "lucide-react";

export default function Upload() {
  const [result, setResult] = useState<ResumeData | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleReUpload = () => {
    setResult(null);
    setQuestions([]);
    setSessionId(null);
    setError(null);
  };

  const handleQuestionsGenerated = (
    generatedQuestions: Question[],
    newSessionId?: string,
  ) => {
    setQuestions(generatedQuestions);
    if (newSessionId) {
      setSessionId(newSessionId);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Upload Your Resume
        </h1>
        <p className="mt-2 text-base text-gray-600">
          Let our AI analyze your technical profile and generate personalized
          interview questions tailored to your experience.
        </p>
      </div>

      {!result ? (
        <UploadBox setResult={setResult} setError={setError} />
      ) : (
        <ResumeUploadSuccess onReUpload={handleReUpload} />
      )}

      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {result && (
        <>
          <ResumeResult data={result} />

          {questions.length === 0 && (
            <QuestionGenerator
              resume={result}
              onQuestionsGenerated={handleQuestionsGenerated}
            />
          )}

          {questions.length > 0 && (
            <div className="mt-10 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-5 mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Generated Interview Questions ({questions.length})
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Ready to practice? Jump into the mock interview room to
                    answer these questions with real-time feedback.
                  </p>
                </div>

                {sessionId && (
                  <Link
                    href={`/interview?session=${sessionId}`}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 transition"
                  >
                    <PlayCircle className="h-5 w-5" />
                    Start Mock Interview
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                )}
              </div>

              <div className="space-y-4">
                {questions.map((q, i) => (
                  <QuestionCard key={q.id || i} question={q} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
