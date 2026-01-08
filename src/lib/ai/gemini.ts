// Gemini AI helper.
// This module will attempt to use the client-initialized `gemini` model exported from
// `src/lib/firebase/client.ts`. If the runtime environment doesn't expose a usable
// client model (for example when running tests or during early dev), the function
// falls back to a deterministic mock response so the UI remains functional.

import { gemini } from "@/lib/firebase/client";

export interface GeminiResponse {
  text: string;
  note?: string;
}

function mockResponse(prompt: string) {
  const trimmed = prompt.trim();
  if (!trimmed) return "Please enter a prompt.";
  return `**Gemini (mock)**\nYou asked: ${trimmed}\n\n_This is a placeholder response until real AI integration is configured._`;
}

export async function getAIResponse(prompt: string): Promise<string> {
  const trimmed = prompt?.toString?.().trim?.() || "";
  if (!trimmed) return "Please enter a prompt.";
  // First try the server proxy so keys & quotas remain server-side.
  try {
    const res = await fetch("/api/ai/query", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: trimmed }),
    });
    if (res.ok) {
      const json = await res.json();
      if (json?.text) return json.text;
    }
  } catch (_err) {
    // ignore and fallback to client model/mock
  }

  // Fallback: try the client-initialized gemini model if available.
  try {
    const m = gemini as any;
    if (!m) return mockResponse(trimmed);
    if (typeof m.generate === "function") {
      const r = await m.generate({ input: trimmed });
      if (r?.candidates && Array.isArray(r.candidates) && r.candidates[0]) {
        const c = r.candidates[0];
        const text =
          c?.output?.content || c?.output?.text || c?.text || c?.content;
        if (text) return text.toString();
      }
      if (r?.text) return r.text.toString();
    }
    if (typeof m.generateText === "function") {
      const r = await m.generateText({ prompt: trimmed });
      if (r?.text) return r.text.toString();
    }
    if (typeof m.predict === "function") {
      const r = await m.predict(trimmed);
      if (typeof r === "string") return r;
      if (r?.text) return r.text;
    }
    return mockResponse(trimmed);
  } catch (err) {
    console.warn("Gemini client call failed, falling back to mock:", err);
    return mockResponse(trimmed);
  }
}
