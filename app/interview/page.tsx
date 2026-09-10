"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Clock,
  Award,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Play,
  Pause,
  RotateCcw,
  Trophy,
  ChevronRight,
  FileText,
  Loader2,
  ThumbsUp,
  Lightbulb,
  Volume2,
  Printer,
  SkipForward,
  PlayCircle,
} from "lucide-react";
import AnswerBox from "../components/AnswerBox";

interface QuestionData {
  id: string;
  questionText: string;
  type: string;
  difficulty: string;
  order: number;
  answer?: {
    id: string;
    answerText: string;
    score: number | null;
    feedback: string | null;
    strengths: string[] | null;
    improvements: string[] | null;
  } | null;
}

interface SessionData {
  id: string;
  role: string;
  difficulty: string;
  status: string;
  overallScore: number | null;
  questions: QuestionData[];
}

interface EvaluationResult {
  score: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
  modelAnswer: string;
}

function InterviewRoom() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get("session");

  const [session, setSession] = useState<SessionData | null>(null);
  const [recentSessions, setRecentSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [currentEvaluation, setCurrentEvaluation] = useState<EvaluationResult | null>(null);
  const [showEvaluationModal, setShowEvaluationModal] = useState<boolean>(false);
  const [isInterviewFinished, setIsInterviewFinished] = useState<boolean>(false);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [isSpeakingQuestion, setIsSpeakingQuestion] = useState<boolean>(false);

  // Timer state (3 minutes = 180 seconds per question)
  const [timeLeft, setTimeLeft] = useState<number>(180);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(true);

  // Load session or recent sessions
  const loadSession = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (!sessionId) {
        const res = await fetch("/api/interview-session");
        const data = await res.json();
        if (data.sessions) {
          setRecentSessions(data.sessions);
        }
        setLoading(false);
        return;
      }

      const res = await fetch(`/api/interview-session?id=${sessionId}`);
      const data = await res.json();

      if (!res.ok || data.error) {
        setError(data.error || "Failed to load session");
        return;
      }

      setSession(data.session);

      // Find first unanswered question
      const firstUnansweredIndex = data.session.questions.findIndex(
        (q: QuestionData) => !q.answer
      );

      if (firstUnansweredIndex !== -1) {
        setCurrentIndex(firstUnansweredIndex);
      } else if (data.session.questions.length > 0) {
        setIsInterviewFinished(true);
      }
    } catch (err) {
      console.error("Error loading session:", err);
      setError("An unexpected error occurred while loading the interview.");
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  // Reset timer on question change
  useEffect(() => {
    setTimeLeft(180);
    setIsTimerRunning(true);
    setShowHint(false);
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeakingQuestion(false);
    }
  }, [currentIndex]);

  // Timer countdown
  useEffect(() => {
    if (!isTimerRunning || timeLeft <= 0 || isInterviewFinished || showEvaluationModal) {
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [isTimerRunning, timeLeft, isInterviewFinished, showEvaluationModal]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // Text to Speech for question
  const handleSpeakQuestion = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      alert("Text-to-speech is not supported on this browser.");
      return;
    }

    if (isSpeakingQuestion) {
      window.speechSynthesis.cancel();
      setIsSpeakingQuestion(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.onend = () => setIsSpeakingQuestion(false);
    utterance.onerror = () => setIsSpeakingQuestion(false);

    setIsSpeakingQuestion(true);
    window.speechSynthesis.speak(utterance);
  };

  // Submit Answer & Evaluate with AI
  const handleSubmitAnswer = async (answerText: string) => {
    if (!session) return;
    const currentQuestion = session.questions[currentIndex];
    if (!currentQuestion) return;

    try {
      setIsEvaluating(true);
      const res = await fetch("/api/evaluate-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: session.id,
          questionId: currentQuestion.id,
          answerText,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        alert(data.error || "Failed to evaluate answer. Please try again.");
        return;
      }

      setCurrentEvaluation(data.evaluation);
      setShowEvaluationModal(true);

      // Update local question answer state
      setSession((prev) => {
        if (!prev) return null;
        const updatedQuestions = [...prev.questions];
        updatedQuestions[currentIndex] = {
          ...updatedQuestions[currentIndex],
          answer: {
            id: data.submissionId,
            answerText,
            score: data.evaluation.score,
            feedback: data.evaluation.feedback,
            strengths: data.evaluation.strengths,
            improvements: data.evaluation.improvements,
          },
        };
        return {
          ...prev,
          overallScore: data.overallScore,
          questions: updatedQuestions,
          status: data.isCompleted ? "COMPLETED" : "IN_PROGRESS",
        };
      });
    } catch (err) {
      console.error("Answer submission error:", err);
      alert("Failed to submit answer. Please check your connection.");
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleSkipQuestion = () => {
    if (!session) return;
    if (confirm("Are you sure you want to skip this question? You can return to it later.")) {
      if (currentIndex + 1 < session.questions.length) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        setIsInterviewFinished(true);
      }
    }
  };

  const handleNextQuestion = () => {
    setShowEvaluationModal(false);
    setCurrentEvaluation(null);

    if (!session) return;

    if (currentIndex + 1 < session.questions.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsInterviewFinished(true);
    }
  };

  // 1. Loading State
  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <Loader2 className="h-10 w-10 text-indigo-600 animate-spin mb-4" />
        <p className="text-sm font-medium text-gray-600">Preparing your mock interview room...</p>
      </div>
    );
  }

  // 2. No Session State
  if (!sessionId) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12">
        <div className="text-center mb-10">
          <div className="rounded-2xl bg-indigo-50 p-4 w-fit mx-auto text-indigo-600 mb-4">
            <Sparkles className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">AI Mock Interview Room</h1>
          <p className="mt-2 text-gray-600 max-w-md mx-auto">
            Choose an existing session to resume or generate tailored questions from your resume.
          </p>

          <div className="mt-6 flex justify-center gap-4">
            <Link
              href="/upload"
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition"
            >
              <Sparkles className="h-4 w-4" />
              Upload Resume & Start New Interview
            </Link>
          </div>
        </div>

        {recentSessions.length > 0 && (
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Your Practice Sessions</h2>
            <div className="divide-y divide-gray-100">
              {recentSessions.map((s) => (
                <div key={s.id} className="py-3.5 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">{s.role}</h3>
                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                      <span className="capitalize px-2 py-0.5 rounded bg-gray-100 font-medium">{s.difficulty}</span>
                      <span>•</span>
                      <span>{s._count?.questions || 0} Questions</span>
                      <span>•</span>
                      <span className="capitalize font-semibold text-indigo-600">
                        {s.status === "COMPLETED" ? "✅ Completed" : "⏳ In Progress"}
                      </span>
                    </div>
                  </div>

                  <Link
                    href={`/interview?session=${s.id}`}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3.5 py-1.5 text-xs font-semibold text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition"
                  >
                    <PlayCircle className="h-3.5 w-3.5" />
                    Enter Room
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // 3. Error State
  if (error || !session) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <div className="rounded-2xl bg-rose-50 p-4 w-fit mx-auto text-rose-600 mb-4">
          <AlertCircle className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Session Not Found</h2>
        <p className="mt-2 text-sm text-gray-600">{error || "Could not find the requested interview session."}</p>
        <Link
          href="/dashboard"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition"
        >
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const questions = session.questions || [];
  const currentQuestion = questions[currentIndex];
  const answeredCount = questions.filter((q) => q.answer !== null).length;
  const progressPercent = Math.round((answeredCount / Math.max(1, questions.length)) * 100);

  // 4. Finished Report Card State
  if (isInterviewFinished) {
    const totalScore = session.overallScore || 0;
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-gray-200 bg-white p-8 sm:p-12 shadow-sm text-center">
          <div className="rounded-2xl bg-emerald-50 p-4 w-fit mx-auto text-emerald-600 mb-4">
            <Trophy className="h-10 w-10" />
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Interview Completed!</h1>
          <p className="mt-2 text-gray-600">
            Great job! You have answered all questions for the <strong className="text-gray-900">{session.role}</strong> mock interview.
          </p>

          <div className="mt-8 mx-auto w-fit rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 p-8 text-white shadow-lg shadow-indigo-100">
            <p className="text-xs uppercase tracking-wider font-semibold opacity-80">Overall STAR Score</p>
            <p className="mt-2 text-5xl sm:text-6xl font-black">{totalScore}%</p>
            <p className="mt-2 text-xs font-medium opacity-90">
              {totalScore >= 80 ? "🎉 Outstanding Mastery" : totalScore >= 60 ? "👍 Solid Performance" : "📚 Needs Practice"}
            </p>
          </div>

          <div className="mt-12 text-left">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Question Breakdown & Feedback</h2>
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition cursor-pointer"
              >
                <Printer className="h-3.5 w-3.5" />
                Print / Save PDF
              </button>
            </div>

            <div className="divide-y divide-gray-100 rounded-2xl border border-gray-200 overflow-hidden">
              {questions.map((q, idx) => (
                <div key={q.id} className="p-4 sm:p-6 bg-white hover:bg-gray-50/50 transition">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-gray-500">Q{idx + 1}</span>
                        <span className="capitalize text-[11px] font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
                          {q.type}
                        </span>
                      </div>
                      <p className="font-semibold text-gray-900 text-sm">{q.questionText}</p>
                    </div>

                    <div className="flex-shrink-0 text-right">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                          (q.answer?.score || 0) >= 80
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : (q.answer?.score || 0) >= 60
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : "bg-rose-50 text-rose-700 border border-rose-200"
                        }`}
                      >
                        {q.answer?.score !== undefined && q.answer?.score !== null
                          ? `${q.answer.score}%`
                          : "Skipped"}
                      </span>
                    </div>
                  </div>

                  {q.answer?.answerText && (
                    <div className="mt-3 rounded-xl bg-gray-50 p-3.5 text-xs text-gray-700 border border-gray-100">
                      <p className="font-semibold text-gray-800 mb-1">Your Response:</p>
                      <p className="italic text-gray-600 leading-relaxed">&ldquo;{q.answer.answerText}&rdquo;</p>
                    </div>
                  )}

                  {q.answer?.feedback && (
                    <p className="mt-2 text-xs text-indigo-900 bg-indigo-50/50 p-3 rounded-xl border border-indigo-100 leading-relaxed">
                      💬 <strong className="text-indigo-950">AI Feedback:</strong> {q.answer.feedback}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/dashboard"
              className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition"
            >
              Return to Dashboard
            </Link>
            <Link
              href="/upload"
              className="rounded-xl border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
            >
              Practice Another Interview
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 5. Active Turn-by-Turn Interview View
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-6 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600 border border-indigo-100">
              {session.role}
            </span>
            <span className="capitalize text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
              {session.difficulty}
            </span>
          </div>
          <h1 className="mt-2 text-xl sm:text-2xl font-bold text-gray-900">
            Mock Interview Room
          </h1>
        </div>

        {/* Timer & Controls */}
        <div className="flex items-center gap-3">
          <div
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold border transition ${
              timeLeft < 30
                ? "bg-rose-50 text-rose-700 border-rose-200 animate-pulse"
                : "bg-white text-gray-800 border-gray-200"
            }`}
          >
            <Clock className="h-4 w-4 text-indigo-600" />
            <span>{formatTime(timeLeft)}</span>
          </div>

          <button
            type="button"
            onClick={() => setIsTimerRunning((prev) => !prev)}
            className="rounded-xl border border-gray-200 bg-white p-2 text-gray-600 hover:bg-gray-50 transition cursor-pointer"
            title={isTimerRunning ? "Pause Timer" : "Resume Timer"}
          >
            {isTimerRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 text-emerald-600" />}
          </button>
        </div>
      </div>

      {/* Question Pills Navigator */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none">
        {questions.map((q, idx) => {
          const isAnswered = q.answer !== null && q.answer !== undefined;
          const isCurrent = idx === currentIndex;
          return (
            <button
              key={q.id}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition flex-shrink-0 cursor-pointer ${
                isCurrent
                  ? "bg-indigo-600 text-white shadow-sm"
                  : isAnswered
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <span>Q{idx + 1}</span>
              {isAnswered && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />}
            </button>
          );
        })}
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-xs font-semibold text-gray-600 mb-2">
          <span>
            Question {currentIndex + 1} of {questions.length}
          </span>
          <span>{progressPercent}% Completed</span>
        </div>
        <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
          <div
            className="h-full bg-indigo-600 transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Main Question Card */}
      {currentQuestion && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                  {currentQuestion.type} Question
                </span>
                <span className="capitalize text-xs font-medium text-gray-500">
                  Difficulty: {currentQuestion.difficulty}
                </span>
              </div>

              {/* TTS Listen Button */}
              <button
                type="button"
                onClick={() => handleSpeakQuestion(currentQuestion.questionText)}
                className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition cursor-pointer ${
                  isSpeakingQuestion
                    ? "bg-indigo-50 border-indigo-200 text-indigo-700 animate-pulse"
                    : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Volume2 className="h-3.5 w-3.5 text-indigo-600" />
                <span>{isSpeakingQuestion ? "Stop Reading" : "Listen (TTS)"}</span>
              </button>
            </div>

            <h2 className="text-lg sm:text-xl font-bold text-gray-900 leading-relaxed">
              {currentQuestion.questionText}
            </h2>

            {showHint && (
              <div className="mt-4 rounded-xl bg-amber-50 p-4 border border-amber-200 text-xs text-amber-800 flex items-start gap-2">
                <Lightbulb className="h-4 w-4 flex-shrink-0 mt-0.5 text-amber-600" />
                <div>
                  <strong className="font-semibold">Interview Tip:</strong> Apply the{" "}
                  <strong>STAR framework</strong> (Situation, Task, Action, Result). State the problem, your exact technical responsibility, the tools or algorithms you used, and the quantifiable outcome.
                </div>
              </div>
            )}
          </div>

          {/* Answer Input Component with Speech-to-Text */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 mb-2">Your Response</h3>
            <AnswerBox
              key={currentQuestion.id}
              questionId={currentQuestion.id}
              questionText={currentQuestion.questionText}
              onSubmit={handleSubmitAnswer}
              onAskHint={() => setShowHint((prev) => !prev)}
              onSkip={handleSkipQuestion}
              isLoading={isEvaluating}
            />
          </div>
        </div>
      )}

      {/* Evaluation Feedback Modal */}
      {showEvaluationModal && currentEvaluation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
              <div className="flex items-center gap-3">
                <div
                  className={`rounded-xl p-2.5 ${
                    currentEvaluation.score >= 80
                      ? "bg-emerald-50 text-emerald-600"
                      : currentEvaluation.score >= 60
                      ? "bg-amber-50 text-amber-600"
                      : "bg-rose-50 text-rose-600"
                  }`}
                >
                  <Award className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Answer Evaluation</h3>
                  <p className="text-xs text-gray-500">AI STAR Rubric Breakdown</p>
                </div>
              </div>

              {/* Score pill */}
              <div
                className={`rounded-full px-4 py-1.5 text-sm font-black border ${
                  currentEvaluation.score >= 80
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : currentEvaluation.score >= 60
                    ? "bg-amber-50 text-amber-700 border-amber-200"
                    : "bg-rose-50 text-rose-700 border-rose-200"
                }`}
              >
                {currentEvaluation.score} / 100
              </div>
            </div>

            {/* Qualitative Feedback */}
            <div className="space-y-4 text-sm">
              <div>
                <h4 className="font-bold text-gray-900 mb-1">Feedback</h4>
                <p className="text-gray-600 leading-relaxed bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                  {currentEvaluation.feedback}
                </p>
              </div>

              {/* Strengths */}
              {currentEvaluation.strengths?.length > 0 && (
                <div>
                  <h4 className="font-bold text-emerald-700 flex items-center gap-1.5 mb-1.5">
                    <ThumbsUp className="h-4 w-4" /> Key Strengths
                  </h4>
                  <ul className="space-y-1.5 pl-2 text-xs text-gray-600">
                    {currentEvaluation.strengths.map((str, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Areas for Improvement */}
              {currentEvaluation.improvements?.length > 0 && (
                <div>
                  <h4 className="font-bold text-amber-700 flex items-center gap-1.5 mb-1.5">
                    <Lightbulb className="h-4 w-4" /> Areas for Growth
                  </h4>
                  <ul className="space-y-1.5 pl-2 text-xs text-gray-600">
                    {currentEvaluation.improvements.map((imp, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-amber-500 font-bold">•</span>
                        <span>{imp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Model Answer */}
              {currentEvaluation.modelAnswer && (
                <div>
                  <h4 className="font-bold text-indigo-700 mb-1">Ideal Model Answer</h4>
                  <p className="text-xs text-indigo-900 bg-indigo-50/70 p-3.5 rounded-xl border border-indigo-100 leading-relaxed">
                    {currentEvaluation.modelAnswer}
                  </p>
                </div>
              )}
            </div>

            {/* Modal Next CTA */}
            <div className="mt-8 flex justify-end">
              <button
                type="button"
                onClick={handleNextQuestion}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition cursor-pointer"
              >
                <span>
                  {currentIndex + 1 < questions.length ? "Continue to Next Question" : "View Final Report Card"}
                </span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function InterviewPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex flex-col items-center justify-center">
          <Loader2 className="h-10 w-10 text-indigo-600 animate-spin mb-4" />
          <p className="text-sm font-medium text-gray-600">Loading interview room...</p>
        </div>
      }
    >
      <InterviewRoom />
    </Suspense>
  );
}