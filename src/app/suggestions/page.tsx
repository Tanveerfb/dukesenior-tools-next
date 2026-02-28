"use client";
import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { addFormToDatabase } from "@/lib/services/suggestions";

export default function SuggestionsPage() {
  const { user } = useAuth();
  const [msg, setMsg] = useState("");
  const [anon, setAnon] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    if (!msg.trim()) return;
    setSending(true);
    try {
      await addFormToDatabase("public-suggestions", msg.trim(), anon, user);
      setSent(true);
      setMsg("");
    } catch (err) {
      console.error(err);
    }
    setSending(false);
    setTimeout(() => setSent(false), 3000);
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-4">
      <div className="rounded-xl border border-border bg-card dark:bg-card-dark dark:border-border-dark shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-border dark:border-border-dark font-semibold text-foreground">
          Send a suggestion
        </div>
        <div className="p-4">
          <form onSubmit={handleSubmit}>
            <div className="mb-1">
              <label className="block text-sm font-medium text-foreground mb-1">
                Your suggestion
              </label>
              <textarea
                rows={4}
                value={msg}
                onChange={(e) => setMsg(e.target.value)}
                maxLength={1000}
                className="block w-full rounded-lg border border-border dark:border-border-dark bg-background dark:bg-background-dark text-foreground px-3 py-2 text-sm focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div className="flex items-center gap-2 mt-3">
              <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={anon}
                  onChange={(e) => setAnon(e.target.checked)}
                  className="rounded border-border dark:border-border-dark text-primary-500 focus:ring-primary-500"
                />
                Submit anonymously
              </label>
              <button
                type="submit"
                disabled={sending || (!anon && !user)}
                className="ml-auto rounded-lg bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sending ? "Sending..." : "Send"}
              </button>
            </div>

            {sent && (
              <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                Thanks — suggestion sent.
              </p>
            )}
            {!anon && !user && (
              <p className="text-sm text-foreground-secondary mt-2">
                Sign in to send suggestions without anonymous flag.
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
