"use client"
import { useState } from "react";
import UploadBox from "../components/UploadBox";
import ResumeResult from "../components/ResumeResult";
import { ResumeData } from "../types/resume";
import QuestionGenerator from "../components/QuestionGenerator";
import { Question } from "../types/question";
import QuestionCard from "../components/QuestionCard";

export default function Upload() {
  const [result, setResult] = useState<ResumeData | null>(null);
  const [questions,setQuestions]=useState<Question[]>([])

  return (
    <div className="flex flex-col gap-5 px-[20%] py-7.5">
      
      <h3 className="text-2xl font-semibold">
        Upload your resume here
      </h3>

      <h4>
        Help us to get you know better by sharing your resume.
      </h4>

      {/* ✅ Pass setResult */}
      <UploadBox setResult={setResult} />

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