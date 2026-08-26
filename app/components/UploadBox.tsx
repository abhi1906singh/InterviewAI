"use client";

import { UploadCloud, X, FileText, Loader2 } from "lucide-react";
import { useRef, useState } from "react";
import { ResumeData } from "../types/resume";

type UploadBoxProps = {
  setResult: React.Dispatch<React.SetStateAction<ResumeData | null>>;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
};

export default function UploadBox({ setResult, setError }: UploadBoxProps) {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  function handleClick() {
    fileRef?.current?.click();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf") {
        setError("Only PDF files are supported.");
        return;
      }
      setSelectedFile(file);
      setError(null);
    }
  }

  function handleCancel() {
    setSelectedFile(null);
    setError(null);
    if (fileRef.current) {
      fileRef.current.value = "";
    }
  }

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave() {
    setIsDragging(false);
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (file.type !== "application/pdf") {
        setError("Only PDF files are supported.");
        return;
      }
      setSelectedFile(file);
      setError(null);
    }
  }

  async function handleUpload() {
    try {
      setError(null);
      setResult(null);

      if (!selectedFile) {
        setError("Please select a PDF resume to upload.");
        return;
      }

      const formData = new FormData();
      formData.append("file", selectedFile);
      setLoading(true);

      const res = await fetch("/api/parse-resume", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to parse resume");
      }

      setResult(data.data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Something went wrong while processing your resume.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 text-center transition cursor-pointer ${
          isDragging
            ? "border-indigo-600 bg-indigo-50/50"
            : "border-gray-300 bg-white hover:border-indigo-400 hover:bg-gray-50/60"
        }`}
      >
        <input
          type="file"
          accept=".pdf"
          className="hidden"
          ref={fileRef}
          onChange={handleFileChange}
        />

        <div className="rounded-full bg-indigo-50 p-4 text-indigo-600 mb-4">
          <UploadCloud className="h-8 w-8" />
        </div>

        <p className="text-base font-semibold text-gray-900">
          Click to upload or drag & drop your resume
        </p>
        <p className="text-xs text-gray-500 mt-1">
          PDF format only (Maximum file size: 5MB)
        </p>
      </div>

      {selectedFile && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
              <FileText className="h-5 w-5" />
            </div>
            <div className="truncate">
              <p className="text-sm font-medium text-gray-900 truncate">
                {selectedFile.name}
              </p>
              <p className="text-xs text-gray-500">
                {(selectedFile.size / 1024).toFixed(1)} KB
              </p>
            </div>
            <button
              onClick={handleCancel}
              disabled={loading}
              className="ml-auto sm:ml-2 text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <button
            disabled={loading}
            onClick={handleUpload}
            className="inline-flex items-center justify-center gap-2 w-full sm:w-auto rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50 transition cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Parsing Resume...
              </>
            ) : (
              "Upload & Analyze"
            )}
          </button>
        </div>
      )}
    </div>
  );
}