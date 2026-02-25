import { NextRequest, NextResponse } from "next/server";
import { generateQuestionImage } from "@/lib/gemini";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { question } = await request.json() as { question?: string };

    if (!question || typeof question !== "string") {
      return NextResponse.json({ imageUrl: null });
    }

    const imageUrl = await generateQuestionImage(question);
    return NextResponse.json({ imageUrl });
  } catch (error) {
    console.error("Error in /api/generate-image:", error);
    return NextResponse.json({ imageUrl: null });
  }
}
