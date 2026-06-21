import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

// shared types
export interface CommentNode {
  id: string;
  content: string;
  authorName: string;
  createdAt: number;
  likeCount: number;
  dislikeCount: number;
  replies?: CommentNode[];
  parentId?: string | null;
  userReaction?: "like" | "dislike";
}

export function renderCommentWithLinks(content: string) {
  if (!content) return <>{""}</>;
  const parts: Array<string | React.ReactNode> = [];
  const re = /@([A-Za-z0-9_]{3,32})/g;
  let lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(content))) {
    const idx = m.index;
    if (idx > lastIndex) parts.push(content.slice(lastIndex, idx));
    const uname = m[1];
    parts.push(
      <Link
        key={idx}
        href={`/profile/${encodeURIComponent(uname)}`}
        className="text-primary-500 hover:underline"
      >
        @{uname}
      </Link>,
    );
    lastIndex = idx + m[0].length;
  }
  if (lastIndex < content.length) parts.push(content.slice(lastIndex));
  return (
    <span style={{ whiteSpace: "pre-wrap" }}>
      {parts.map((p, i) =>
        typeof p === "string" ? <span key={i}>{p}</span> : p,
      )}
    </span>
  );
}

export function transformEmbeds(markdown: string) {
  return markdown
    .replace(
      /<!--\s*YT:\s*(https?:\/\/www\.youtube\.com\/watch\?v=([a-zA-Z0-9_-]{6,}))\s*-->/g,
      (_m, full) => {
        const url = full.trim();
        const vidMatch = url.match(/[?&]v=([a-zA-Z0-9_-]{6,})/);
        const id = vidMatch ? vidMatch[1] : "";
        if (!id) return full;
        return `\n<div class=\"ratio ratio-16x9 my-3\"><iframe src=\"https://www.youtube.com/embed/${id}\" title=\"YouTube video\" allowfullscreen loading=\"lazy\"></iframe></div>\n`;
      },
    )
    .replace(/<!--\s*TWITCH:\s*([a-zA-Z0-9_]{3,25})\s*-->/g, (_m, channel) => {
      const c = channel.trim();
      return `\n<div class=\"twitch-badge my-3\"><a class=\"twitch-link\" href=\"https://www.twitch.tv/${c}\" target=\"_blank\" rel=\"noreferrer noopener\"><span>Visit ${c}'s Twitch channel</span></a></div>\n`;
    });
}

export function estimateReadTime(text = "") {
  const words = (text || "").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export function extractHeadings(markdown = "") {
  const re = /^#{1,4}\s+(.*)$/gm;
  const items: { level: number; text: string; id: string }[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(markdown))) {
    const full = m[1].trim();
    const id = full
      .toLowerCase()
      .replace(/[^a-z0-9\- ]/g, "")
      .replace(/\s+/g, "-");
    const hashes = (m[0].match(/^#+/) || ["#"])[0];
    const level = hashes.length;
    items.push({ level, text: full, id });
  }
  return items;
}

// currently a no-op but kept for API compatibility
export async function notifyMentions(
  _text: string,
  _postId: string,
  _commentId?: string,
  _postSlug?: string,
) {
  return;
}

export async function copyToClipboard(text: string) {
  try {
    if (
      typeof navigator !== "undefined" &&
      navigator.clipboard &&
      navigator.clipboard.writeText
    ) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (_e) {}
  try {
    (document as any).execCommand("copy");
    return true;
  } catch (_e) {}
  return false;
}

export function decodeHtmlEntities(input: string) {
  try {
    const t = document.createElement("textarea");
    t.innerHTML = input;
    return t.value;
  } catch (_e) {
    return input;
  }
}

export function renderContent(md: string) {
  if (!md) return "";
  const hasEntities =
    md.includes("&lt;") ||
    md.includes("&gt;") ||
    md.includes("&amp;") ||
    md.includes("&quot;");
  const input = hasEntities ? decodeHtmlEntities(md) : md;
  return transformEmbeds(input);
}

export const sanitizeSchema = {
  tagNames: [
    "p",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "strong",
    "em",
    "b",
    "i",
    "ul",
    "ol",
    "li",
    "pre",
    "code",
    "blockquote",
    "iframe",
    "div",
    "a",
    "img",
    "figure",
    "figcaption",
    "span",
    "svg",
    "path",
    "hr",
    "table",
    "thead",
    "tbody",
    "tr",
    "th",
    "td",
    "br",
  ],
  attributes: {
    iframe: [
      "src",
      "title",
      "allow",
      "frameborder",
      "allowfullscreen",
      "loading",
      "scrolling",
    ],
    div: ["class", "className"],
    a: ["href", "target", "rel", "class", "className", "aria-label"],
    img: ["src", "alt", "title", "width", "height"],
    svg: [
      "xmlns",
      "viewBox",
      "width",
      "height",
      "fill",
      "aria-hidden",
      "class",
    ],
    path: ["d", "fill", "stroke"],
    span: ["class", "className"],
    "*": ["class", "className", "id", "style"],
  },
  protocols: {
    href: ["http", "https"],
    src: ["http", "https"],
  },
} as any;

export function SpinnerIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn("animate-spin h-8 w-8 text-primary-500", className)}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      />
    </svg>
  );
}
