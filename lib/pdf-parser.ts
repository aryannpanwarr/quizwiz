const MAX_CHARACTERS = 5000;

export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    const { PDFParse } = await import("pdf-parse");
    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    const text = result.text.trim();
    return text.slice(0, MAX_CHARACTERS);
  } catch (error) {
    console.error("Error parsing PDF:", error);
    return "Error: Failed to extract text from PDF. The file may be corrupted or password-protected.";
  }
}
