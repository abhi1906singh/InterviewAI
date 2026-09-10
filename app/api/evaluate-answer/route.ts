import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import { ai } from "@/app/lib/gemini";
import { prisma, ensureUser } from "@/app/lib/prisma";


export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in." },
        { status: 401 }
      );
    }

    await ensureUser(userId);

    const { sessionId, questionId, answerText } = await req.json();

    if (!sessionId || !questionId || !answerText?.trim()) {
      return NextResponse.json(
        { error: "Missing sessionId, questionId, or answerText" },
        { status: 400 }
      );
    }

    // Fetch Question and Session details
    const question = await prisma.question.findUnique({
      where: { id: questionId },
      include: {
        session: true,
      },
    });

    if (!question || question.sessionId !== sessionId) {
      return NextResponse.json(
        { error: "Question not found for this session" },
        { status: 404 }
      );
    }

    // Generate STAR evaluation with Gemini
    const evaluationPrompt = `
You are an expert technical interviewer and executive hiring manager.

Evaluate the candidate's answer to the following interview question.

Role / Domain: ${question.session.role}
Difficulty Level: ${question.difficulty}
Question Type: ${question.type}
Interview Question: "${question.questionText}"

Candidate's Answer:
"""
${answerText.trim().slice(0, 4000)}
"""

Evaluate the response rigorously based on:
1. Technical depth and accuracy
2. Structure & Clarity (STAR method: Situation, Task, Action, Result)
3. Relevance and completeness

Return ONLY a valid JSON object with the exact schema below (no markdown formatting, no code blocks):
{
  "score": number between 0 and 100,
  "feedback": "A concise, constructive 2-3 sentence evaluation of the answer",
  "strengths": ["Strength point 1", "Strength point 2"],
  "improvements": ["Area for improvement 1", "Area for improvement 2"],
  "modelAnswer": "An exemplary high-scoring reference answer demonstrating best practices and STAR structure"
}
`;

    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: evaluationPrompt,
    });

    let rawText = result.candidates?.[0]?.content?.parts?.[0]?.text || "";
    rawText = rawText.replace(/```json/g, "").replace(/```/g, "").trim();

    let evaluation = {
      score: 70,
      feedback: "Answer received and evaluated.",
      strengths: ["Clear communication"],
      improvements: ["Provide more concrete metrics and outcomes"],
      modelAnswer: "Focus on structured actions and quantifiable results.",
    };

    try {
      const parsed = JSON.parse(rawText);
      evaluation = {
        score: typeof parsed.score === "number" ? Math.min(100, Math.max(0, parsed.score)) : 70,
        feedback: parsed.feedback || "Answer evaluated.",
        strengths: Array.isArray(parsed.strengths) ? parsed.strengths : ["Clear effort"],
        improvements: Array.isArray(parsed.improvements) ? parsed.improvements : ["Add specific examples"],
        modelAnswer: parsed.modelAnswer || "Structure answers with Situation, Task, Action, Result.",
      };
    } catch (parseErr) {
      console.warn("Failed to parse AI evaluation JSON, using fallback structure:", parseErr);
    }

    // Upsert AnswerSubmission in database
    const submission = await prisma.answerSubmission.upsert({
      where: { questionId },
      update: {
        answerText: answerText.trim(),
        score: evaluation.score,
        feedback: evaluation.feedback,
        strengths: evaluation.strengths,
        improvements: evaluation.improvements,
      },
      create: {
        questionId,
        sessionId,
        userId,
        answerText: answerText.trim(),
        score: evaluation.score,
        feedback: evaluation.feedback,
        strengths: evaluation.strengths,
        improvements: evaluation.improvements,
      },
    });

    // Check session progress & calculate cumulative score
    const allQuestions = await prisma.question.findMany({
      where: { sessionId },
      include: { answer: true },
    });

    const totalQuestions = allQuestions.length;
    const answeredQuestions = allQuestions.filter((q) => q.answer !== null);
    const isCompleted = totalQuestions > 0 && answeredQuestions.length >= totalQuestions;

    const scores = answeredQuestions.map((q) => q.answer?.score || 0);
    const overallScore =
      scores.length > 0
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        : evaluation.score;

    // Update Session status
    await prisma.interviewSession.update({
      where: { id: sessionId },
      data: {
        overallScore,
        status: isCompleted ? "COMPLETED" : "IN_PROGRESS",
      },
    });

    return NextResponse.json({
      success: true,
      submissionId: submission.id,
      evaluation,
      isCompleted,
      overallScore,
      answeredCount: answeredQuestions.length,
      totalCount: totalQuestions,
    });
  } catch (error) {
    console.error("Evaluate answer route error:", error);
    return NextResponse.json(
      { error: "Failed to evaluate answer. Please try again." },
      { status: 500 }
    );
  }
}