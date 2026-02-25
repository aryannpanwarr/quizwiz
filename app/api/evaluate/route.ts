import { NextRequest, NextResponse } from "next/server";
import { QuizQuestion } from "@/lib/types";

interface UserAnswer {
  questionId: string;
  selectedAnswer: string;
  isCorrect: boolean;
}

interface EvaluateRequestBody {
  questions: QuizQuestion[];
  answers: { questionId: string; selectedAnswer: string }[];
}

interface EvaluateResponse {
  score: number;
  total: number;
  results: UserAnswer[];
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json() as EvaluateRequestBody;
    const { questions, answers } = body;

    if (!Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json(
        { error: "Request body must contain a non-empty 'questions' array." },
        { status: 400 }
      );
    }

    if (!Array.isArray(answers)) {
      return NextResponse.json(
        { error: "Request body must contain an 'answers' array." },
        { status: 400 }
      );
    }

    // Build a quick lookup: questionId → QuizQuestion
    const questionMap = new Map<string, QuizQuestion>(
      questions.map((q) => [q.id, q])
    );

    let score = 0;
    const results: UserAnswer[] = answers.map((answer) => {
      const question = questionMap.get(answer.questionId);

      if (!question) {
        return {
          questionId: answer.questionId,
          selectedAnswer: answer.selectedAnswer,
          isCorrect: false,
        };
      }

      const isCorrect = answer.selectedAnswer === question.correctAnswer;
      if (isCorrect) score++;

      return {
        questionId: answer.questionId,
        selectedAnswer: answer.selectedAnswer,
        isCorrect,
      };
    });

    const response: EvaluateResponse = {
      score,
      total: questions.length,
      results,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error in /api/evaluate:", error);
    return NextResponse.json(
      { error: "Internal server error while evaluating answers." },
      { status: 500 }
    );
  }
}
