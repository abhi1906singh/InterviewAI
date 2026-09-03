import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma, ensureUser } from "@/app/lib/prisma";
import {
  FileText,
  PlayCircle,
  PlusCircle,
  ArrowRight,
  Clock,
  Award,
} from "lucide-react";

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  await ensureUser(userId);

  // Fetch user's resumes and interview sessions
  const [resumes, sessions] = await Promise.all([
    prisma.resume.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.interviewSession.findMany({
      where: { userId },
      include: {
        _count: {
          select: { questions: true, answers: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  const completedSessions = sessions.filter((s) => s.status === "COMPLETED");
  const avgScore =
    completedSessions.length > 0
      ? Math.round(
          completedSessions.reduce((acc, s) => acc + (s.overallScore || 0), 0) /
            completedSessions.length,
        )
      : null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-6 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
            Interview Dashboard
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Track your mock interviews, manage resumes, and monitor your
            preparation progress.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/upload"
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition"
          >
            <PlusCircle className="h-4 w-4" />
            Upload New Resume
          </Link>
        </div>
      </div>

      {/* Stats Overview Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-10">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-500">
              Resumes Analyzed
            </p>
            <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
              <FileText className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {resumes.length}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-500">Mock Interviews</p>
            <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
              <PlayCircle className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {sessions.length}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-500">Average Score</p>
            <div className="rounded-lg bg-amber-50 p-2 text-amber-600">
              <Award className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {avgScore !== null ? `${avgScore}%` : "N/A"}
          </p>
        </div>
      </div>

      {/* Two Column Grid: Sessions & Resumes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Interviews */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">
              Recent Interview Sessions
            </h2>
          </div>

          {sessions.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center">
              <PlayCircle className="mx-auto h-8 w-8 text-gray-400 mb-2" />
              <p className="text-sm font-medium text-gray-700">
                No mock interviews yet
              </p>
              <p className="text-xs text-gray-500 mt-1 mb-4">
                Upload a resume to generate questions and begin practicing.
              </p>
              <Link
                href="/upload"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
              >
                Upload Resume <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className="py-3.5 flex items-center justify-between"
                >
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">
                      {session.role}
                    </h3>
                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                      <span className="capitalize px-2 py-0.5 rounded bg-gray-100 font-medium">
                        {session.difficulty}
                      </span>
                      <span>•</span>
                      <span>{session._count.questions} Questions</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(session.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <Link
                    href={`/interview?session=${session.id}`}
                    className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 hover:text-indigo-600 transition"
                  >
                    Open Room
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Uploaded Resumes */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Your Resumes</h2>
          </div>

          {resumes.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center">
              <FileText className="mx-auto h-8 w-8 text-gray-400 mb-2" />
              <p className="text-sm font-medium text-gray-700">
                No resumes uploaded
              </p>
              <p className="text-xs text-gray-500 mt-1 mb-4">
                Upload your PDF resume to extract skills and projects.
              </p>
              <Link
                href="/upload"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
              >
                Upload Resume <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {resumes.map((resume) => (
                <div
                  key={resume.id}
                  className="py-3.5 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">
                        {resume.fileName || "Uploaded Resume"}
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Uploaded on{" "}
                        {new Date(resume.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <Link
                    href="/upload"
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                  >
                    Generate More
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
