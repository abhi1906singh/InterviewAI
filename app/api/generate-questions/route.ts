import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenAI } from "@google/genai";
import { prisma, ensureUser } from "@/app/lib/prisma";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in." },
        { status: 401 },
      );
    }

    await ensureUser(userId);

    const { resume, resumeId, filters } = await req.json();

    if (!resume) {
      return NextResponse.json(
        { error: "Resume is required" },
        { status: 400 },
      );
    }

    const prompt = `
You are an expert technical interviewer.

Generate exactly 10 interview questions based on the candidate's resume.

Resume:
${JSON.stringify(resume).slice(0, 3000)}

Filters:
- Role: ${filters?.role || "General"}
- Difficulty: ${filters?.difficulty || "Mixed"}
- Focus: ${filters?.focus?.join(", ") || "General"}

Return ONLY a JSON array. No markdown, no explanation:
[
  {
    "question": "string",
    "type": "conceptual | practical | behavioral",
    "difficulty": "easy | medium | hard"
  }
]
`;

    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: prompt,
    });

    let text = result.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // Clean Gemini response
    text = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    let rawQuestions: Array<{
      question: string;
      type?: string;
      difficulty?: string;
    }> = [];

    try {
      rawQuestions = JSON.parse(text);
    } catch (err) {
      console.error("Parse error:", err);
      return NextResponse.json(
        { error: "Failed to parse questions from AI" },
        { status: 500 },
      );
    }

    const actualResumeId =
      resumeId ||
      (resume &&
      typeof resume === "object" &&
      "id" in resume &&
      typeof resume.id === "string"
        ? resume.id
        : undefined);

    // Create InterviewSession in Prisma
    const session = await prisma.interviewSession.create({
      data: {
        userId,
        resumeId: actualResumeId || undefined,
        role: filters?.role || "General",
        difficulty: filters?.difficulty || "Medium",
        status: "IN_PROGRESS",
      },
    });

    // Save Questions in Prisma
    const createdQuestions = await Promise.all(
      rawQuestions.map((q, index) =>
        prisma.question.create({
          data: {
            sessionId: session.id,
            questionText: q.question,
            type: q.type || "conceptual",
            difficulty: q.difficulty || filters?.difficulty || "medium",
            order: index + 1,
          },
        }),
      ),
    );

    const formattedQuestions = createdQuestions.map((q) => ({
      id: q.id,
      sessionId: q.sessionId,
      question: q.questionText,
      type: q.type,
      difficulty: q.difficulty,
      order: q.order,
    }));

    return NextResponse.json({
      sessionId: session.id,
      questions: formattedQuestions,
    });
  } catch (error) {
    console.error("API Error:", error);

    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}
