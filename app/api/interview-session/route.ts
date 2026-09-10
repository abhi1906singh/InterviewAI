import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma, ensureUser } from "@/app/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in." },
        { status: 401 }
      );
    }

    await ensureUser(userId);

    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("id");

    if (!sessionId) {
      // Return user's recent sessions if no id is specified
      const sessions = await prisma.interviewSession.findMany({
        where: { userId },
        include: {
          _count: { select: { questions: true, answers: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      });

      return NextResponse.json({ sessions });
    }

    // Fetch specific session with questions and answers
    const session = await prisma.interviewSession.findUnique({
      where: { id: sessionId },
      include: {
        questions: {
          orderBy: { order: "asc" },
          include: {
            answer: true,
          },
        },
      },
    });

    if (!session || session.userId !== userId) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ session });
  } catch (error) {
    console.error("Get interview session error:", error);
    return NextResponse.json(
      { error: "Failed to load interview session" },
      { status: 500 }
    );
  }
}
