import { extractText } from "unpdf";
import { ai } from "./gemini";

export async function parseResume(buffer: Buffer) {
  const uint8Array = new Uint8Array(buffer);

  const result = await extractText(uint8Array);

  // ✅ Normalize text safely
  const rawText = normalizeText(result);

  const cleanedText = rawText
    .replace(/\n+/g, "\n")
    .replace(/\s+/g, " ")
    .trim();

  return await structureWithLLM(cleanedText);
}
function normalizeText(result: any): string {
  if (!result) return "";

  // case 1: string
  if (typeof result === "string") return result;

  // case 2: { text: "..." }
  if (typeof result.text === "string") return result.text;

  // case 3: { text: ["..."] }
  if (Array.isArray(result.text)) return result.text.join("\n");

  // case 4: full object fallback
  if (typeof result === "object") {
    return JSON.stringify(result);
  }

  return "";
}

async function structureWithLLM(text: string) {
  try {
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

    return JSON.parse(output);
  } catch (error) {
    console.error("LLM error:", error);

    return {
      name: "",
      skills: [],
      projects: [],
      experience: [],
    };
  }
}