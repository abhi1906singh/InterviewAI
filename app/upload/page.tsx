"use client"
import { useState } from "react";
import UploadBox from "../components/UploadBox";
import ResumeResult from "../components/ResumeResult";
import { ResumeData } from "../types/resume";

export default function Upload() {
    const [result, setResult] = useState<ResumeData | null>(null);

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
      {result && <ResumeResult data={result} />}

    </div>
  );
}