import { NextRequest, NextResponse } from "next/server";
import { parseResume } from "../../lib/parser";
import { getErrorStatus } from "@/app/lib/error-handler";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    // Validation
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

    // Convert File → Buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Parse resume
    const result = await parseResume(buffer);

    return NextResponse.json({
      success: true,
      data: result,
    });

  } catch (error) {
    console.error("Route error:", error);

    const status = getErrorStatus(error);

    let response = {
      status: 500,
      error: "Failed to parse resume.",
    };

    switch (status) {
      case 401:
        response = {
          status: 500,
          error: "AI service authentication failed.",
        };
        break;

      case 429:
        response = {
          status: 429,
          error: "Too many requests. Please try again later.",
        };
        break;

      case 503:
        response = {
          status: 503,
          error: "AI service is currently busy. Please try again.",
        };
        break;
    }

    return NextResponse.json(
      { error: response.error },
      { status: response.status }
    );
  }
}