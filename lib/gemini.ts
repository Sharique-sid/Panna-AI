import { GoogleGenerativeAI } from "@google/generative-ai";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not set");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const geminiModel = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
});

export class GeminiError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown,
    public readonly code?: string
  ) {
    super(message);
    this.name = "GeminiError";
  }
}

export async function generateText(prompt: string): Promise<string> {
  try {
    const result = await geminiModel.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error: any) {
    const message = error?.message || "Unknown Gemini API error";
    const code = error?.status || error?.code;
    console.error("Gemini API error:", { message, code });

    if (code === 429 || message.includes("quota") || message.includes("rate")) {
      throw new GeminiError("Rate limit exceeded", error, "RATE_LIMITED");
    }
    if (code === 400 || message.includes("blocked") || message.includes("safety")) {
      throw new GeminiError("Content blocked by safety filter", error, "CONTENT_BLOCKED");
    }
    if (code === 401 || code === 403) {
      throw new GeminiError("Gemini API key invalid or unauthorized", error, "AUTH_ERROR");
    }

    throw new GeminiError("Failed to generate text", error, code);
  }
}
