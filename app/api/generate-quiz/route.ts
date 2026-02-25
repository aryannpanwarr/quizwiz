import { NextRequest, NextResponse } from "next/server";
import { generateQuiz } from "@/lib/gemini";

export async function POST(request: NextRequest): Promise<NextResponse> {
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "your_gemini_api_key_here") {
    return NextResponse.json(
      { error: "GEMINI_API_KEY is not configured. Please add it to .env.local." },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const { text, numQuestions } = body as { text?: string; numQuestions?: number };

    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return NextResponse.json(
        { error: "Request body must contain a non-empty 'text' string field." },
        { status: 400 }
      );
    }

    const questionCount =
      typeof numQuestions === "number" && numQuestions > 0 && numQuestions <= 20
        ? numQuestions
        : 5;

    const questions = await generateQuiz(text, questionCount);

    // Final validation pass
    const validated = questions.map((q) => {
      if (!Array.isArray(q.options) || q.options.length !== 4) {
        throw new Error(`Question "${q.id}" does not have exactly 4 options.`);
      }
      if (!q.options.includes(q.correctAnswer)) {
        q.correctAnswer = q.options[0];
      }
      return q;
    });

    return NextResponse.json(validated);
  } catch (error) {
    console.error("Error in /api/generate-quiz:", error);
    return NextResponse.json(
      { error: "Failed to generate quiz." },
      { status: 500 }
    );
  }
}
