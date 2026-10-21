import { createGoogleGenerativeAI } from "@ai-sdk/google";

export const isAIConfigured = () => (process.env.GEMINI_API_KEY ?? "").length > 10;

export function geminiModel() {
  const google = createGoogleGenerativeAI({ apiKey: process.env.GEMINI_API_KEY });
  return google(process.env.GEMINI_MODEL || "gemini-2.5-flash");
}

export const AI_NOT_CONFIGURED =
  "AI тохируулагдаагүй байна. .env.local файлд GEMINI_API_KEY-г нэмээд серверээ дахин асаана уу.";
