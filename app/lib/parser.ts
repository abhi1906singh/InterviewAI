import { extractText } from "unpdf";
import { ai } from "./gemini";
import { ResumeData } from "../types/resume";

export async function parseResume(buffer: Buffer) {
  const uint8Array = new Uint8Array(buffer);

  const result = await extractText(uint8Array);

  // Normalize text safely
  const rawText = normalizeText(result);

  const cleanedText = rawText.replace(/\n+/g, "\n").replace(/\s+/g, " ").trim();

  const structuredData = await structureWithLLM(cleanedText);

  return {
    rawText: cleanedText,
    structuredData,
  };
}

function normalizeText(result: unknown): string {
  if (!result) return "";

  // case 1: string
  if (typeof result === "string") return result;

  // case 2: object with text
  if (typeof result === "object" && result !== null && "text" in result) {
    const textVal = (result as { text: unknown }).text;
    if (typeof textVal === "string") return textVal;
    if (Array.isArray(textVal)) return textVal.join("\n");
  }

  // case 3: full object fallback
  if (typeof result === "object") {
    return JSON.stringify(result);
  }

  return "";
}

async function structureWithLLM(text: string): Promise<ResumeData> {
  const prompt = `
You are a resume parsing engine.

Extract structured JSON ONLY:

{
  "name": "",
  "skills": [],
  "projects": [],
  "experience": []
}

Rules:
- Return ONLY JSON
- No markdown
- No explanation

Resume:
${text}
`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-lite",
    contents: prompt,
  });

  let output = response.text || "";

  // Clean Gemini response
  output = output
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  return JSON.parse(output) as ResumeData;
}
