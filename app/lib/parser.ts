import { GoogleGenAI } from "@google/genai";
import { PDFParse } from "pdf-parse";
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});
async function parsePDF(buffer: Buffer) {
  const parser = new PDFParse({
    data: buffer,
  });

  const result = await parser.getText();

  return {
    text: result.text,
  };
}

export async function parseResume(buffer: Buffer) {
  // 1. Extract text
  const data = await parsePDF(buffer);

  let text = data.text;

  // 2. Clean text
  text = text
    .replace(/\n+/g, "\n")
    .replace(/\s+/g, " ")
    .trim();

  // 3. Call Gemini
  const structured = await structureWithLLM(text);

  return structured;
}



async function structureWithLLM(text: string) {
  try {
    const prompt = `
Extract structured resume data.

Return ONLY valid JSON:

{
  "name": "",
  "skills": [],
  "projects": [],
  "experience": []
}

Resume:
${text}
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: prompt,
    });

    let output = response.text || "";

    // 🔥 Clean response (VERY IMPORTANT)
    output = output
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    return JSON.parse(output);

  } catch (error) {
    console.error("Gemini error:", error);

    return {
      name: "",
      skills: [],
      projects: [],
      experience: [],
    };
  }
}