// Gemini AI placeholder service.
// The previous firebase/vertexai import caused build failures because the package export isn't available.
// Replace with a stub that can later be wired to a real backend (e.g., server action / API route calling Google AI or other model).

export interface GeminiResponse {
  text: string;
  note?: string;
}

export async function getAIResponse(prompt: string): Promise<string> {
  // Simple deterministic mock so UI remains functional.
  const trimmed = prompt.trim();
  if (!trimmed) return "Please enter a prompt.";
  // Basic pseudo-response (markdown friendly)
  return `**Gemini (mock)**\nYou asked: ${trimmed}\n\n_This is a placeholder response until real AI integration is configured._`;
}
