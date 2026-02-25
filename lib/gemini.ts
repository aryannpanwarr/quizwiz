import { GoogleGenerativeAI } from "@google/generative-ai";
import { ExplanationData, QuizQuestion } from "@/lib/types";

// Dedicated client for image generation (Gemini 2.0 Flash image model)
const imageGenAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? "");

if (!process.env.GEMINI_API_KEY) {
  console.warn("Warning: GEMINI_API_KEY is not set in environment variables.");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? "");
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

const IMAGE_MODELS = [
  "gemini-3-pro-image-preview",   // preferred (Gemini 3 Pro)
  "gemini-2.5-flash-image",       // fallback
];

export async function generateQuestionImage(question: string): Promise<string | null> {
  const prompt = `Create a clean, colorful, educational illustration that visually represents this quiz question. No text or labels in the image, just a clear visual scene: "${question}"`;

  for (const modelName of IMAGE_MODELS) {
    try {
      const imageModel = imageGenAI.getGenerativeModel({ model: modelName });

      const result = await imageModel.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        generationConfig: { responseModalities: ["IMAGE"] } as any,
      });

      const parts = result.response.candidates?.[0]?.content?.parts ?? [];
      for (const part of parts) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const p = part as any;
        if (p.inlineData?.data) {
          return `data:${p.inlineData.mimeType};base64,${p.inlineData.data}`;
        }
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      // 503 = overloaded, try next model; other errors = skip
      console.warn(`Image model ${modelName} failed: ${msg.substring(0, 80)}`);
      continue;
    }
  }

  return null;
}

export async function explainContent(text: string): Promise<ExplanationData> {
  const prompt = `You are an expert educator. Analyze the following content and provide a structured explanation.

Content to analyze:
"""
${text}
"""

Respond ONLY with valid JSON, no markdown formatting, no code blocks. Use exactly this structure:
{
  "title": "A concise, descriptive title for this content",
  "summary": "A 2-3 sentence summary of the main topic",
  "keyPoints": [
    "Key point 1",
    "Key point 2",
    "Key point 3",
    "Key point 4"
  ],
  "concepts": [
    { "term": "Term 1", "definition": "Clear definition of term 1" },
    { "term": "Term 2", "definition": "Clear definition of term 2" },
    { "term": "Term 3", "definition": "Clear definition of term 3" },
    { "term": "Term 4", "definition": "Clear definition of term 4" }
  ]
}

Requirements:
- keyPoints: provide 4-6 key points
- concepts: provide 4-6 key concepts with clear definitions
- All fields are required`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const rawText = response.text().trim();

    // Strip any accidental markdown code fences
    const jsonText = rawText
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();

    const parsed: ExplanationData = JSON.parse(jsonText);
    return parsed;
  } catch (error) {
    console.error("Error in explainContent:", error);
    throw new Error("Failed to generate explanation from Gemini.");
  }
}

export async function generateQuiz(
  text: string,
  numQuestions: number = 5
): Promise<QuizQuestion[]> {
  const prompt = `You are a quiz generator. Create a multiple-choice quiz based on the following content.

Content:
"""
${text}
"""

Generate exactly ${numQuestions} quiz questions. If the content is a topic name or category (e.g. "Science", "History"), generate general knowledge questions about that topic.

Respond ONLY with valid JSON, no markdown formatting, no code blocks. Use exactly this structure — an array of question objects:
[
  {
    "id": "q1",
    "question": "Clear, specific question text?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": "Option A",
    "explanation": "Brief explanation of why this answer is correct."
  }
]

Requirements:
- Each question must have exactly 4 options
- correctAnswer MUST be exactly one of the 4 options (copy it verbatim)
- Questions should test understanding, not just memorization
- Options should be plausible and not obviously wrong
- id values should be "q1", "q2", etc.
- Vary the position of the correct answer across questions`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const rawText = response.text().trim();

    // Strip any accidental markdown code fences
    const jsonText = rawText
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();

    const parsed: QuizQuestion[] = JSON.parse(jsonText);

    // Validate each question
    const validated = parsed.map((q, index) => {
      if (!q.options || q.options.length !== 4) {
        throw new Error(`Question ${index + 1} does not have exactly 4 options.`);
      }
      if (!q.options.includes(q.correctAnswer)) {
        // Attempt to fix: set correctAnswer to the first option if invalid
        console.warn(
          `Question ${index + 1} correctAnswer not in options. Defaulting to first option.`
        );
        q.correctAnswer = q.options[0];
      }
      return q;
    });

    return validated;
  } catch (error) {
    console.error("Error in generateQuiz:", error);
    throw new Error("Failed to generate quiz from Gemini.");
  }
}
