import Link from "next/link";
import { Show } from "@clerk/nextjs";
import { Sparkles, FileText, Bot, Trophy, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="relative isolate overflow-hidden">
      {/* Hero Section */}
      <div className="mx-auto max-w-7xl px-6 pt-16 pb-24 sm:pb-32 lg:flex lg:px-8 lg:py-24">
        <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-xl lg:flex-shrink-0 lg:pt-8">
          <div className="mt-4">
            <span className="rounded-full bg-indigo-50 px-3 py-1 text-sm font-semibold text-indigo-600 ring-1 ring-inset ring-indigo-500/20">
              🚀 AI Mock Interview Platform
            </span>
          </div>

          <h1 className="mt-8 text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Ace Your Next Tech Interview With{" "}
            <span className="text-indigo-600">AI Preparation</span>
          </h1>

          <p className="mt-6 text-lg leading-8 text-gray-600">
            Upload your resume, get tailored technical & behavioral questions, and practice in an interactive AI-powered interview room with instant feedback.
          </p>

          <div className="mt-10 flex items-center gap-x-6">
            <Show when="signed-out">
              <Link
                href="/sign-up"
                className="rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition flex items-center gap-2 cursor-pointer"
              >
                Get Started Free
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/sign-in"
                className="text-sm font-semibold leading-6 text-gray-900 hover:text-indigo-600 transition"
              >
                Log in <span aria-hidden="true">→</span>
              </Link>
            </Show>

            <Show when="signed-in">
              <Link
                href="/dashboard"
                className="rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition flex items-center gap-2 cursor-pointer"
              >
                Go to Dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/upload"
                className="text-sm font-semibold leading-6 text-gray-900 hover:text-indigo-600 transition"
              >
                Upload Resume <span aria-hidden="true">→</span>
              </Link>
            </Show>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="mx-auto mt-16 flex max-w-2xl sm:mt-24 lg:ml-10 lg:mr-0 lg:mt-0 lg:max-w-none lg:flex-none xl:ml-32">
          <div className="max-w-3xl flex-none sm:max-w-5xl lg:max-w-none">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="rounded-lg bg-indigo-50 p-2.5 w-fit text-indigo-600 mb-4">
                  <FileText className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-gray-900 text-lg">Smart Resume Parsing</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Extracts your technical skills, work history, and projects directly from your PDF resume in seconds.
                </p>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="rounded-lg bg-purple-50 p-2.5 w-fit text-purple-600 mb-4">
                  <Sparkles className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-gray-900 text-lg">Tailored Questions</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Generates domain-specific conceptual, practical, and behavioral questions matched to your experience level.
                </p>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="rounded-lg bg-blue-50 p-2.5 w-fit text-blue-600 mb-4">
                  <Bot className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-gray-900 text-lg">AI Mock Interview Room</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Step into an interactive interview room to answer questions turn-by-turn under realistic pressure.
                </p>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="rounded-lg bg-emerald-50 p-2.5 w-fit text-emerald-600 mb-4">
                  <Trophy className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-gray-900 text-lg">STAR Scoring & Feedback</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Receive detailed feedback, technical depth scores, and model answers to master your interview skills.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
