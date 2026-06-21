import { NextRequest, NextResponse } from "next/server";
import { parseResume } from "../../lib/parser";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    //  File validation
    if (!file || file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Only PDF files allowed" },
        { status: 400 }
      );
    }

    // Size validation
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File too large (max 2MB)" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const result = await parseResume(buffer);

    return NextResponse.json({
      success: true,
      data: result,
    });

  } catch (error) {
    console.error("Route error:", error);

    return NextResponse.json(
      { error: "Failed to parse resume" },
      { status: 500 }
    );
  }
}