import { NextRequest, NextResponse } from "next/server";
import { explainContent } from "@/lib/gemini";

export async function POST(request: NextRequest): Promise<NextResponse> {
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "your_gemini_api_key_here") {
    return NextResponse.json(
      { error: "GEMINI_API_KEY is not configured. Please add it to .env.local." },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const { text } = body as { text?: string };

    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return NextResponse.json(
        { error: "Request body must contain a non-empty 'text' string field." },
        { status: 400 }
      );
    }

    const explanation = await explainContent(text);
    return NextResponse.json(explanation);
  } catch (error) {
    console.error("Error in /api/explain:", error);
    return NextResponse.json(
      { error: "Failed to generate explanation." },
      { status: 500 }
    );
  }
}
