import { NextRequest, NextResponse } from "next/server";
import { extractTextFromPDF } from "@/lib/pdf-parser";
import { UploadResponse } from "@/lib/types";

const MAX_CHARACTERS = 5000;

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const contentType = request.headers.get("content-type") ?? "";

    // Handle multipart file upload
    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file") as File | null;

      if (!file) {
        return NextResponse.json(
          { error: "No file provided in form data." },
          { status: 400 }
        );
      }

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      let extractedText: string;

      if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
        extractedText = await extractTextFromPDF(buffer);
      } else {
        // Treat as plain text
        extractedText = buffer.toString("utf-8");
      }

      // Limit to MAX_CHARACTERS
      const text = extractedText.slice(0, MAX_CHARACTERS);

      const response: UploadResponse = { text, filename: file.name };
      return NextResponse.json(response);
    }

    // Handle JSON body with pasted text
    if (contentType.includes("application/json")) {
      const body = await request.json();
      const { text } = body as { text?: string };

      if (!text || typeof text !== "string") {
        return NextResponse.json(
          { error: "Request body must contain a 'text' string field." },
          { status: 400 }
        );
      }

      const trimmedText = text.slice(0, MAX_CHARACTERS);
      const response: UploadResponse = { text: trimmedText };
      return NextResponse.json(response);
    }

    return NextResponse.json(
      { error: "Unsupported Content-Type. Use multipart/form-data or application/json." },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error in /api/upload:", error);
    return NextResponse.json(
      { error: "Internal server error while processing the upload." },
      { status: 500 }
    );
  }
}
