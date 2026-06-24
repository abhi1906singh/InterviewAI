import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

export async function POST(req: NextRequest) {
  try {
    const { resume, filters } = await req.json();

    if (!resume) {
      return NextResponse.json(
        { error: "Resume is required" },
        { status: 400 }
      );
    }

    const prompt = `
You are an expert technical interviewer.

Generate exactly 12 interview questions based on the candidate's resume.

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

    let text =
      result.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // ✅ Clean Gemini response
    text = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    let questions = [];

    try {
      questions = JSON.parse(text);
    } catch (err) {
      console.error("Parse error:", err);
      return NextResponse.json({ questions: [] });
    }

    return NextResponse.json({ questions });

  } catch (error) {
    console.error("API Error:", error);

    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}