"use client"
import { useState } from "react";
import UploadBox from "../components/UploadBox";
import ResumeResult from "../components/ResumeResult";
import { ResumeData } from "../types/resume";
import QuestionGenerator from "../components/QuestionGenerator";
import { Question } from "../types/question";
import QuestionCard from "../components/QuestionCard";
import ResumeUploadSuccess from "../components/ResumeUploadSuccess";


export default function Upload() {
  const [result, setResult] = useState<ResumeData | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [error, setError] = useState<string | null>(null);
  const handleReUpload = () => {
  setResult(null);
  setQuestions([]);
  setError(null);
};
  return (
    <div className="flex flex-col gap-5 px-[20%] py-7.5">
      
      <h3 className="text-2xl font-semibold">
        Upload your resume here
      </h3>

      <h4>
        Help us to get you know better by sharing your resume.
      </h4>

      {/* ✅ Pass setResult */}
      {!result ? (<UploadBox setResult={setResult} setError={setError} />) :
       <ResumeUploadSuccess onReUpload={handleReUpload} />
      }
      {error && (
  <div className="rounded-md border border-red-300 bg-red-50 p-3 text-red-700">
    {error}
  </div>
)}

      {/* ✅ Show result */}
      {result && (
  <>
          <ResumeResult data={result} />
          {questions && questions.length === 0 && (
            <QuestionGenerator
      resume={result}
      onQuestionsGenerated={setQuestions}
          />
          )}
           {questions?.length > 0 && (
      <div className="mt-6">
        <h3 className="text-xl font-semibold mb-3">
          Generated Questions
              </h3>

        {questions?.map((q, i) => (
          <QuestionCard key={i} question={q} />
        ))}
      </div>
    )}
  </>
)}

    </div>
  );
}