import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import { getAIResponse } from "@/lib/ai/gemini";
import { cn } from "@/lib/utils";

export default function GeminiMini() {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState("");
  const [q, setQ] = useState("");

  async function ask() {
    if (!q.trim()) return;
    setLoading(true);
    try {
      const data = await getAIResponse(q);
      setResponse(data);
      setQ("");
    } catch (_e) {
      setResponse("Error");
    }
    setLoading(false);
  }

  return (
    <div
      className={cn(
        "mb-3 rounded-xl border border-border bg-card shadow dark:border-border-dark dark:bg-card-dark",
      )}
    >
      <div className="p-4">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Ask something..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className={cn(
              "flex-1 rounded-md border border-border bg-transparent px-3 py-2 text-sm text-foreground",
              "placeholder:text-foreground-secondary focus:outline-none focus:ring-2 focus:ring-primary-500",
              "dark:border-border-dark",
            )}
          />
          <button
            onClick={ask}
            disabled={loading}
            className={cn(
              "rounded-md bg-primary-500 px-4 py-2 text-sm font-medium text-white",
              "hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed",
            )}
          >
            {loading ? "..." : "Ask"}
          </button>
        </div>
        {response && (
          <div className="mt-2 text-sm text-foreground-secondary">
            <ReactMarkdown>{response}</ReactMarkdown>
          </div>
        )}
        <div className="mt-2 text-right">
          <a
            href="/GeminiAI"
            className="text-primary-500 hover:text-primary-600 text-sm"
          >
            Open Gemini
          </a>
        </div>
      </div>
    </div>
  );
}
