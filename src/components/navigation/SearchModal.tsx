"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import Link from "next/link";
import Fuse from "fuse.js";
import {
  FaSearch,
  FaTimes,
  FaArrowUp,
  FaArrowDown,
  FaExternalLinkAlt,
} from "react-icons/fa";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import type { EffectiveMeta } from "@/types/tags";

export default function SearchModal({
  show,
  onHide,
}: {
  show: boolean;
  onHide: () => void;
}) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [data, setData] = useState<EffectiveMeta[]>([]);
  const [registry, setRegistry] = useState<
    { name: string; data: { color?: string } }[]
  >([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const listRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const backdropRef = useRef<HTMLDivElement | null>(null);

  // Fetch data when opened
  useEffect(() => {
    if (show) {
      (async () => {
        const [effRes, regRes] = await Promise.all([
          fetch("/api/tags/effective"),
          fetch("/api/tags/registry"),
        ]);
        if (effRes.ok) setData(await effRes.json());
        if (regRes.ok) setRegistry(await regRes.json());
        setTimeout(() => inputRef.current?.focus(), 50);
      })();
    } else {
      setQ("");
      setActiveIdx(0);
    }
  }, [show]);

  // Configure Fuse.js for fuzzy search
  const fuse = useMemo(() => {
    return new Fuse(data, {
      keys: [
        { name: "title", weight: 0.5 },
        { name: "path", weight: 0.3 },
        { name: "effective", weight: 0.2 },
      ],
      threshold: 0.4,
      includeScore: true,
      includeMatches: true,
      minMatchCharLength: 2,
      ignoreLocation: true,
    });
  }, [data]);

  const tagColor = useCallback(
    (tag: string) => registry.find((r) => r.name === tag)?.data.color,
    [registry],
  );

  const safeHref = useCallback(
    (p: string) =>
      p.replace(/\[(.+?)\]/g, (_, name) =>
        name.toLowerCase() === "id" ? "example-id" : "sample",
      ),
    [],
  );

  const trimmed = q.trim();
  const hasQuery = trimmed.length > 0;

  const results = useMemo(() => {
    if (!trimmed) return [];
    return fuse.search(trimmed).map((result) => result.item);
  }, [trimmed, fuse]);

  const suggestions = !trimmed
    ? data.filter((d) => d.effective.includes("Event")).slice(0, 5)
    : [];

  useEffect(() => {
    setActiveIdx(0);
  }, [q]);

  const handleKey = (e: React.KeyboardEvent) => {
    if (!show) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const max = (trimmed ? results : suggestions).length;
      if (max) setActiveIdx((i) => (i + 1) % max);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const max = (trimmed ? results : suggestions).length;
      if (max) setActiveIdx((i) => (i - 1 + max) % max);
    } else if (e.key === "Enter") {
      const list = trimmed ? results : suggestions;
      const sel = list[activeIdx];
      if (sel) {
        router.push(safeHref(sel.path));
        onHide();
      }
    } else if (e.key === "Escape") {
      onHide();
    }
  };

  function highlight(text: string) {
    if (!trimmed) return text;
    const normalized = trimmed.toLowerCase();
    const idx = text.toLowerCase().indexOf(normalized);
    if (idx === -1) return text;
    return (
      <>
        {text.slice(0, idx)}
        <mark className="bg-yellow-300/50 dark:bg-yellow-500/30 rounded px-0.5">
          {text.slice(idx, idx + normalized.length)}
        </mark>
        {text.slice(idx + normalized.length)}
      </>
    );
  }

  if (!show) return null;

  const items = trimmed ? results : suggestions;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh]"
      onKeyDown={handleKey}
    >
      {/* Backdrop */}
      <div
        ref={backdropRef}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onHide}
      />

      {/* Dialog */}
      <div className="relative w-full max-w-2xl mx-4 bg-card dark:bg-card-dark border border-border dark:border-border-dark rounded-2xl shadow-soft-lg overflow-hidden animate-fade-in">
        {/* Search Input */}
        <div className="p-4 pb-2">
          <form onSubmit={(e) => e.preventDefault()}>
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-surface-50 dark:bg-surface-900/50 border border-border dark:border-border-dark focus-within:border-primary dark:focus-within:border-primary transition-colors">
              <FaSearch className="text-foreground-muted dark:text-foreground-dark-muted shrink-0" />
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search pages, paths, or tags..."
                aria-label="Search"
                className="flex-1 bg-transparent border-none outline-none text-foreground dark:text-foreground-dark placeholder:text-foreground-muted dark:placeholder:text-foreground-dark-muted"
              />
              {hasQuery && (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={() => setQ("")}
                  className="p-1 rounded-full hover:bg-surface-200 dark:hover:bg-surface-800 transition-colors"
                >
                  <FaTimes className="text-foreground-muted" size={12} />
                </button>
              )}
            </div>
          </form>
          <div className="flex justify-between items-center mt-2 text-xs text-foreground-muted dark:text-foreground-dark-muted px-1">
            <span>
              {trimmed
                ? `${results.length} result${results.length === 1 ? "" : "s"}`
                : "Suggestions"}
            </span>
            <span className="flex items-center gap-2">
              <span className="hidden md:inline-flex items-center gap-1">
                <FaArrowUp size={10} />/<FaArrowDown size={10} /> navigate
              </span>
              <kbd className="border border-border dark:border-border-dark rounded px-1.5 py-0.5 text-[10px] font-mono">
                Enter
              </kbd>{" "}
              open
              <kbd className="border border-border dark:border-border-dark rounded px-1.5 py-0.5 text-[10px] font-mono">
                Esc
              </kbd>{" "}
              close
            </span>
          </div>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-[60vh] overflow-y-auto px-2 pb-2">
          {items.map((r, idx) => {
            const href = safeHref(r.path);
            const isActive = idx === activeIdx;
            return (
              <Link
                key={r.path}
                href={href}
                onClick={onHide}
                className={cn(
                  "flex justify-between items-start rounded-lg px-4 py-3 no-underline transition-colors",
                  isActive
                    ? "bg-primary text-white"
                    : "text-foreground dark:text-foreground-dark hover:bg-surface-100 dark:hover:bg-surface-900/50",
                )}
              >
                <div className="mr-3 min-w-0">
                  <div className="font-semibold text-sm truncate">
                    {highlight(r.title || r.path)}
                  </div>
                  <div
                    className={cn(
                      "text-xs truncate",
                      isActive
                        ? "text-white/60"
                        : "text-foreground-muted dark:text-foreground-dark-muted",
                    )}
                  >
                    {r.path}
                  </div>
                </div>
                <div className="flex flex-wrap justify-end gap-1 max-w-[40%] shrink-0">
                  {r.effective.slice(0, 3).map((t) => (
                    <span
                      key={t}
                      className={cn(
                        "text-[10px] px-2 py-0.5 rounded-full font-medium text-white",
                        isActive && "border border-white/30",
                      )}
                      style={{
                        background: isActive
                          ? "rgba(255,255,255,0.25)"
                          : tagColor(t) || "#6b7280",
                      }}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </Link>
            );
          })}
          {!items.length && (
            <div className="text-center py-8 text-foreground-muted dark:text-foreground-dark-muted text-sm">
              {trimmed ? "No matches" : "No suggestions available"}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center px-4 py-3 border-t border-border dark:border-border-dark text-xs text-foreground-muted dark:text-foreground-dark-muted">
          <span className="flex items-center gap-1">
            <FaExternalLinkAlt size={10} /> Dynamic route links use placeholder
            ids.
          </span>
          <button
            onClick={onHide}
            className="flex items-center gap-1 px-3 py-1.5 text-xs border border-border dark:border-border-dark rounded-full hover:bg-surface-100 dark:hover:bg-surface-900/50 transition-colors text-foreground dark:text-foreground-dark"
          >
            <FaTimes size={10} /> Close
          </button>
        </div>
      </div>
    </div>
  );
}
