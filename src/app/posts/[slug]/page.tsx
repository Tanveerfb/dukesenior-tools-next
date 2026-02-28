"use client";
import React, { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";

// Helper: render comment content and turn @username into profile links
function renderCommentWithLinks(content: string) {
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
import { useParams, useSearchParams } from "next/navigation";
import {
  getPostBySlug,
  addComment,
  reactToPostForUser,
  reactToCommentForUser,
  listenPost,
  listenComments,
  getUserPostReaction,
  getUserCommentReaction,
} from "@/lib/services/cms";
import { getSamplePostBySlug } from "@/lib/content/samplePosts";
import { FaTwitch } from "react-icons/fa";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import rehypeSlug from "rehype-slug";
import { useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getAuth } from "firebase/auth";
import { cn } from "@/lib/utils";
import styles from "./post.module.css";

function SpinnerIcon({ className }: { className?: string }) {
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

async function copyToClipboard(text: string) {
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

interface CommentNode {
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

function transformEmbeds(markdown: string) {
  // Replace HTML comments markers with actual embed-friendly HTML blocks.
  // YouTube format: <!-- YT: https://www.youtube.com/watch?v=VIDEO_ID -->
  // Twitch format: <!-- TWITCH: channel_name -->
  return markdown
    .replace(
      /<!--\s*YT:\s*(https?:\/\/www\.youtube\.com\/watch\?v=([a-zA-Z0-9_-]{6,}))\s*-->/g,
      (_m, full, _vid, offset, str) => {
        const url = full.trim();
        const vidMatch = url.match(/[?&]v=([a-zA-Z0-9_-]{6,})/);
        const id = vidMatch ? vidMatch[1] : "";
        if (!id) return full;
        return `\n<div class=\"ratio ratio-16x9 my-3\"><iframe src=\"https://www.youtube.com/embed/${id}\" title=\"YouTube video\" allowfullscreen loading=\"lazy\"></iframe></div>\n`;
      },
    )
    .replace(/<!--\s*TWITCH:\s*([a-zA-Z0-9_]{3,25})\s*-->/g, (_m, channel) => {
      const c = channel.trim();
      // Render a lightweight Twitch channel badge (link) instead of embedding the player.
      return `\n<div class="twitch-badge my-3"><a class="twitch-link" href="https://www.twitch.tv/${c}" target="_blank" rel="noreferrer noopener"><span>Visit ${c}'s Twitch channel</span></a></div>\n`;
    });
}

function estimateReadTime(text = "") {
  const words = (text || "").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

function extractHeadings(markdown = "") {
  const re = /^#{1,4}\s+(.*)$/gm;
  const items: { level: number; text: string; id: string }[] = [];
  let m;
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

// Extract @username tokens and call server API to create notifications
async function notifyMentions(
  text: string,
  postId: string,
  commentId?: string,
  postSlug?: string,
) {
  // Notifications functionality removed - this is a no-op now
  return;
}

export default function PostView() {
  const { slug } = useParams<{ slug: string }>();
  const searchParams = useSearchParams?.();
  const debugRaw = !!(searchParams && searchParams.get("debugRaw") === "1");
  const [loading, setLoading] = useState(true);
  const [post, setPost] = useState<any>();
  const [comments, setComments] = useState<CommentNode[]>([]);
  const scrolledToHashRef = useRef(false);
  const [newComment, setNewComment] = useState("");
  const newCommentRef = useRef<HTMLTextAreaElement | null>(null);
  const [suggestions, setSuggestions] = useState<
    { username: string; uid: string }[]
  >([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionOwner, setSuggestionOwner] = useState<string | null>(null); // 'main' or commentId
  const [activeSuggestion, setActiveSuggestion] = useState(0);
  const [mentionStart, setMentionStart] = useState<number | null>(null);
  const [mentionPartial, setMentionPartial] = useState<string>("");
  const suggestionTimerRef = useRef<number | null>(null);
  const activeTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [posting, setPosting] = useState(false);
  const [userPostReaction, setUserPostReaction] = useState<
    "like" | "dislike" | undefined
  >();
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const [commentError, setCommentError] = useState<string | undefined>();
  // Sanitization schema to allow iframe elements for embeds
  // Sanitization schema to allow iframe elements for embeds and also
  // preserve standard markdown-generated tags (p, headings, lists, strong, em, img, code, blockquote).
  const sanitizeSchema = {
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
    },
  } as any;
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [lightboxAlt, setLightboxAlt] = useState<string | null>(null);
  const [gallery, setGallery] = useState<{ src: string; alt: string }[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);

  function openLightbox(src?: string | null, alt?: string | null) {
    if (!src) return;
    const idx = gallery.findIndex((g) => g.src === src);
    if (idx >= 0) {
      setCurrentIndex(idx);
      setLightboxSrc(gallery[idx].src);
      setLightboxAlt(gallery[idx].alt);
      setLightboxOpen(true);
      return;
    }
    const next = [...gallery, { src, alt: alt || "" }];
    setGallery(next);
    const newIndex = next.length - 1;
    setCurrentIndex(newIndex);
    setLightboxSrc(src);
    setLightboxAlt(alt || "");
    setLightboxOpen(true);
  }

  function openLightboxByIndex(index: number) {
    const it = gallery[index];
    if (!it) return;
    setCurrentIndex(index);
    setLightboxSrc(it.src);
    setLightboxAlt(it.alt);
    setLightboxOpen(true);
  }

  function gotoPrev() {
    if (gallery.length === 0) return;
    const next = (currentIndex - 1 + gallery.length) % gallery.length;
    openLightboxByIndex(next);
  }
  function gotoNext() {
    if (gallery.length === 0) return;
    const next = (currentIndex + 1) % gallery.length;
    openLightboxByIndex(next);
  }

  useEffect(() => {
    let unsubPost: undefined | (() => void);
    let unsubComments: undefined | (() => void);
    async function init() {
      setLoading(true);
      try {
        const base = (await getPostBySlug(slug)) || getSamplePostBySlug(slug);
        if (!base) {
          setPost(undefined);
          return;
        }
        setPost(base);
        // Dev debug: print a short snippet of the raw content so we can verify whether
        // the content contains escaped HTML entities or raw markdown/html.
        try {
          if (process.env.NODE_ENV !== "production")
            console.debug(
              "[PostView] content preview:",
              (base.content || "").slice(0, 400),
            );
        } catch (_e) {}
        // Build image gallery from fetched post (banner + markdown/html images)
        try {
          const items: { src: string; alt: string }[] = [];
          if (base.bannerUrl)
            items.push({ src: base.bannerUrl, alt: base.title || "" });
          const md = base.content || "";
          const mdImgRe = /!\[([^\]]*)\]\(([^)]+)\)/g;
          let m: RegExpExecArray | null;
          while ((m = mdImgRe.exec(md))) {
            items.push({ src: m[2], alt: m[1] || "" });
          }
          const htmlImgRe = /<img[^>]+src=(?:"|')?([^"'>\s]+)(?:"|')?[^>]*>/g;
          while ((m = htmlImgRe.exec(md))) {
            items.push({ src: m[1], alt: "" });
          }
          const seen = new Set<string>();
          const dedup: { src: string; alt: string }[] = [];
          for (const it of items) {
            if (!seen.has(it.src)) {
              seen.add(it.src);
              dedup.push(it);
            }
          }
          setGallery(dedup);
          setCurrentIndex(dedup.length ? 0 : -1);
        } catch (e) {
          /* ignore gallery parsing errors */
        }
        const isSample = base.id.startsWith("sample-");
        if (!isSample) {
          if (user) {
            setUserPostReaction(await getUserPostReaction(base.id, user.uid));
          }
          unsubPost = listenPost(base.id, async (updated) => {
            if (updated)
              setPost((prev: any) => ({ ...(prev || {}), ...updated }));
          });
          unsubComments = listenComments(base.id, async (list) => {
            const roots = list.filter((c) => !c.parentId);
            const childrenMap: Record<string, CommentNode[]> = {};
            list
              .filter((c) => c.parentId)
              .forEach((c) => {
                (childrenMap[c.parentId!] ||= []).push({ ...c });
              });
            const enriched: CommentNode[] = await Promise.all(
              roots.map(async (r) => {
                let userReaction: "like" | "dislike" | undefined = undefined;
                if (user) {
                  userReaction = await getUserCommentReaction(r.id, user.uid);
                }
                return { ...r, userReaction, replies: childrenMap[r.id] || [] };
              }),
            );
            setComments(enriched);
          });
        }
      } finally {
        setLoading(false);
      }
    }
    init();
    return () => {
      unsubPost && unsubPost();
      unsubComments && unsubComments();
    };
  }, [slug, user]);

  // If navigated with a hash (e.g., /posts/:slug#comment-<id>) the comment element
  // may not exist when the route first renders because comments load async.
  // Keep trying to find and scroll to the element every 200ms for up to ~5s.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash;
    if (!hash) return;
    if (scrolledToHashRef.current) return;
    const id = decodeURIComponent(hash.replace("#", ""));
    function tryScroll() {
      const el = document.getElementById(id);
      if (el) {
        try {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          (el as HTMLElement).focus?.();
        } catch (e) {}
        scrolledToHashRef.current = true;
        return true;
      }
      return false;
    }
    // immediate attempt
    if (tryScroll()) return;
    let attempts = 0;
    const maxAttempts = 25; // ~5s at 200ms per attempt
    const iv = window.setInterval(() => {
      attempts++;
      if (tryScroll() || attempts >= maxAttempts) {
        window.clearInterval(iv);
      }
    }, 200);
    // also respond to future hash changes while on the page
    function onHash() {
      if (!scrolledToHashRef.current) tryScroll();
    }
    window.addEventListener("hashchange", onHash);
    return () => {
      window.clearInterval(iv);
      window.removeEventListener("hashchange", onHash);
    };
  }, [slug, comments, post]);

  // keyboard navigation for lightbox
  useEffect(() => {
    if (!lightboxOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setLightboxOpen(false);
      } else if (e.key === "ArrowLeft") {
        gotoPrev();
      } else if (e.key === "ArrowRight") {
        gotoNext();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxOpen, currentIndex, gallery, gotoPrev, gotoNext]);

  const readTime = estimateReadTime(post?.content || "");
  const headings = extractHeadings(post?.content || "");

  async function submit(parentId?: string) {
    if (!user || !post) return;
    if (!newComment.trim()) return;
    setPosting(true);
    setCommentError(undefined);
    try {
      const content = newComment.trim();
      // extract mentions to persist on the comment
      const re = /@([A-Za-z0-9_]{3,32})/g;
      const set = new Set<string>();
      let mm: RegExpExecArray | null;
      while ((mm = re.exec(content))) {
        set.add(mm[1].toLowerCase());
      }
      const mentions = Array.from(set);
      const commentId = await addComment(user.uid, user.email || "unknown", {
        postId: post.id,
        parentId,
        content,
        mentions,
      });
      setNewComment("");
      setShowSuggestions(false);
      try {
        await notifyMentions(content, post.id, commentId, post.slug);
      } catch (e) {
        console.warn("mention notify failed", e);
      }
    } catch (err: any) {
      console.error("Add comment failed", err);
      setCommentError("Failed to post comment: " + (err?.message || "unknown"));
    } finally {
      setPosting(false);
    }
  }

  // --- mention autocomplete for main textarea ---
  const fetchSuggestions = useCallback(async (q: string, owner?: string) => {
    // prefer server API (Admin-backed) when available
    try {
      const res = await fetch(`/api/users/search?q=${encodeURIComponent(q)}`);
      if (res.ok) {
        const json = await res.json();
        if (
          json?.results &&
          Array.isArray(json.results) &&
          json.results.length
        ) {
          setSuggestions(json.results.slice(0, 8));
          setActiveSuggestion(0);
          setSuggestionOwner(owner || null);
          setShowSuggestions(true);
          return;
        }
      }
    } catch (e) {
      /* ignore */
    }

    // fallback to client Firestore query
    try {
      const { db } = await import("@/lib/firebase/client");
      const { collection, query, where, orderBy, limit, getDocs } =
        await import("firebase/firestore");
      const start = q;
      const end = q + "\uf8ff";
      const col = collection(db, "usernames");
      const qref = query(
        col,
        where("username", ">=", start),
        where("username", "<=", end),
        orderBy("username"),
        limit(8),
      );
      const snap = await getDocs(qref as any);
      const out: { username: string; uid: string }[] = [];
      snap.forEach((d) => {
        const data = d.data() as any;
        if (data?.username && data?.uid)
          out.push({ username: data.username, uid: data.uid });
      });
      if (out.length) {
        setSuggestions(out);
        setActiveSuggestion(0);
        setSuggestionOwner(owner || null);
        setShowSuggestions(true);
        return;
      }
    } catch (e) {
      /* ignore */
    }

    // no results: clear owner
    setSuggestionOwner(null);
    setSuggestions([]);
    setShowSuggestions(false);
  }, []);

  function handleNewCommentChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const val = e.target.value;
    setNewComment(val);
    // detect mention token at caret
    const caret = e.target.selectionStart || val.length;
    const before = val.slice(0, caret);
    const at = before.lastIndexOf("@");
    if (at >= 0 && (at === 0 || /\s/.test(before[at - 1]))) {
      const partial = before.slice(at + 1);
      setMentionPartial(partial);
      if (/^[A-Za-z0-9_]{1,32}$/.test(partial)) {
        setMentionStart(at);
        if (suggestionTimerRef.current)
          window.clearTimeout(suggestionTimerRef.current);
        // mark owner as main textarea so only it shows suggestions
        suggestionTimerRef.current = window.setTimeout(
          () => fetchSuggestions(partial.toLowerCase(), "main"),
          200,
        ) as unknown as number;
        return;
      }
    }
    // else hide
    setShowSuggestions(false);
    setSuggestions([]);
    setMentionStart(null);
    setMentionPartial("");
  }

  function applySuggestionToTextarea(username: string) {
    const ta = activeTextareaRef.current || newCommentRef.current;
    if (!ta) return;
    const val = newComment;
    const caret = ta.selectionStart || val.length;
    const start = mentionStart ?? val.lastIndexOf("@", caret - 1);
    if (start < 0) return;
    const before = val.slice(0, start);
    const after = val.slice(caret);
    const insert = `@${username} `;
    const newVal = before + insert + after;
    setNewComment(newVal);
    setShowSuggestions(false);
    setSuggestionOwner(null);
    setSuggestions([]);
    setMentionStart(null);
    // position caret after inserted username
    requestAnimationFrame(() => {
      const pos = before.length + insert.length;
      try {
        ta.focus();
        ta.setSelectionRange(pos, pos);
      } catch (e) {}
    });
  }

  function handleNewKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (!showSuggestions || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveSuggestion((i) => Math.min(suggestions.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveSuggestion((i) => Math.max(0, i - 1));
    } else if (e.key === "Enter") {
      // if suggestion open and caret at mention, accept
      e.preventDefault();
      const s = suggestions[activeSuggestion];
      if (s) applySuggestionToTextarea(s.username);
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
      setSuggestionOwner(null);
    }
  }
  // Some stored posts may have HTML entities escaped (e.g. &lt;iframe&gt;). Decode them
  // on the client before passing to ReactMarkdown so rehype-raw can parse actual tags.
  function decodeHtmlEntities(input: string) {
    try {
      const t = document.createElement("textarea");
      t.innerHTML = input;
      return t.value;
    } catch (e) {
      return input;
    }
  }

  // Only decode HTML entities when the content actually contains entity markers
  // (e.g. &lt; or &gt;). Many posts are plain Markdown and decoding via a
  // DOM textarea can mutate sequences like backslashes/newlines; prefer to
  // leave plain Markdown untouched so remark-gfm parses as expected.
  function renderContent(md: string) {
    if (!md) return "";
    const hasEntities =
      md.includes("&lt;") ||
      md.includes("&gt;") ||
      md.includes("&amp;") ||
      md.includes("&quot;");
    const input = hasEntities ? decodeHtmlEntities(md) : md;
    return transformEmbeds(input);
  }
  const memoizedMarkdown = useMemo(
    () => renderContent(post?.content || ""),
    [post?.content],
  );

  if (loading)
    return (
      <div className="max-w-7xl mx-auto px-4 py-10 text-center">
        <SpinnerIcon />
      </div>
    );
  if (!post)
    return (
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="text-foreground-secondary">Post not found.</div>
      </div>
    );

  return (
    <>
      <div className={cn("max-w-7xl mx-auto px-4 py-6", styles.postWrap)}>
        <div className="flex flex-col lg:flex-row gap-8">
          <div className={cn("lg:w-2/3", styles.contentColumn)}>
            <div className="mb-3 flex flex-wrap gap-2 items-center">
              {post.tags?.map((t: string) => (
                <span
                  key={t}
                  className="rounded-full bg-cyan-500 text-white px-2 py-0.5 text-xs font-medium mr-2"
                >
                  {t}
                </span>
              ))}
              {post.pinned && (
                <span className="rounded-full bg-yellow-400 text-yellow-900 px-2 py-0.5 text-xs font-medium">
                  Pinned
                </span>
              )}
              <div className="ml-auto text-sm text-foreground-secondary">
                {new Date(post.createdAt).toLocaleString()}
              </div>
            </div>

            <h1 className="text-foreground text-3xl font-bold mb-2">
              {post.title}{" "}
              {post.id && post.id.startsWith("sample-") && (
                <span className="ml-2 rounded-full bg-gray-500 text-white px-2 py-0.5 text-xs font-medium align-middle">
                  Sample
                </span>
              )}
            </h1>
            <div className="text-foreground-secondary text-sm mb-3">
              {post.author || "DukeSenior"} • {readTime} min read
            </div>

            <div className="markdown-body mb-10" id="article-markdown">
              {debugRaw && (
                <div className="mb-3">
                  <strong>Debug: raw stored content preview</strong>
                  <pre className="max-h-40 overflow-auto bg-gray-100 dark:bg-gray-800 p-2 rounded">
                    {String(post.content || "").slice(0, 1000)}
                  </pre>
                  <div className="mt-2">
                    <strong>Debug (JSON.stringify)</strong>
                    <pre className="max-h-40 overflow-auto bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded">
                      {JSON.stringify(post.content)}
                    </pre>
                  </div>
                  <div className="mt-2">
                    <strong>Minimal render (remark-gfm only)</strong>
                    <div className="p-2 border border-border dark:border-border-dark rounded bg-gray-50 dark:bg-gray-800 max-h-56 overflow-auto">
                      {String(post.content || "").trim() ? (
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {String(post.content || "")}
                        </ReactMarkdown>
                      ) : (
                        <div className="text-foreground-secondary text-sm">
                          (empty)
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[
                  rehypeRaw,
                  [rehypeSanitize, sanitizeSchema],
                  rehypeSlug,
                ]}
                components={{
                  h2: ({ node, ...props }) =>
                    (
                      <h2 {...props}>
                        {props.children}
                        <a
                          className={styles.headingAnchor}
                          href={`#${(props.children as any)
                            .toString()
                            .toLowerCase()
                            .replace(/[^a-z0-9\- ]/g, "")
                            .replace(/\s+/g, "-")}`}
                          onClick={(e) => {
                            e.preventDefault();
                            copyToClipboard(
                              window.location.href.split("#")[0] +
                                "#" +
                                (props.children as any)
                                  .toString()
                                  .toLowerCase()
                                  .replace(/[^a-z0-9\- ]/g, "")
                                  .replace(/\s+/g, "-"),
                            );
                            setCopied(true);
                            setTimeout(() => setCopied(false), 1200);
                          }}
                        >
                          🔗
                        </a>
                      </h2>
                    ) as any,
                  a: ({ node, ...props }: any) => {
                    const href = props.href as string | undefined;
                    const className = props.className as string | undefined;
                    if (className && className.includes("twitch-link")) {
                      return (
                        <a
                          href={href}
                          target="_blank"
                          rel="noreferrer noopener"
                          className={props.className}
                        >
                          <FaTwitch style={{ marginRight: 8 }} />
                          <span>{props.children}</span>
                        </a>
                      );
                    }
                    return <a {...props} />;
                  },
                  img: (props: any) => {
                    const src = props.src as string;
                    const alt = props.alt as string | undefined;
                    // Use next/image for better performance; keep click-to-open behavior
                    return (
                      <div
                        style={{
                          cursor: "pointer",
                          maxWidth: "100%",
                          position: "relative",
                        }}
                        onClick={() => openLightbox(src, alt || "")}
                      >
                        <Image
                          src={src}
                          alt={alt || "image"}
                          width={800}
                          height={450}
                          style={{ maxWidth: "100%", height: "auto" }}
                          unoptimized
                        />
                      </div>
                    );
                  },
                }}
              >
                {memoizedMarkdown}
              </ReactMarkdown>
            </div>
          </div>

          <div className={cn("lg:w-1/3", styles.sidebar)}>
            <div className={styles.stickySidebar}>
              {post.bannerUrl && (
                <div
                  className={styles.bannerPreview}
                  style={{ position: "relative" }}
                >
                  <div
                    role="button"
                    style={{ cursor: "pointer" }}
                    onClick={() => openLightbox(post.bannerUrl, post.title)}
                  >
                    <Image
                      src={post.bannerUrl}
                      alt={post.title}
                      width={1200}
                      height={600}
                      style={{ width: "100%", height: "auto" }}
                      unoptimized
                    />
                  </div>
                </div>
              )}
              <div className="rounded-xl border border-border dark:border-border-dark bg-card dark:bg-card-dark shadow-sm mb-3 p-4">
                <h6 className="text-foreground font-semibold mb-2">
                  On this page
                </h6>
                <ul className={styles.tocList}>
                  {headings.map((h) => (
                    <li key={h.id} style={{ marginLeft: (h.level - 1) * 8 }}>
                      <a className={styles.tocLink} href={`#${h.id}`}>
                        {h.text}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-xl border border-border dark:border-border-dark bg-card dark:bg-card-dark shadow-sm p-4">
                <h6 className="text-foreground font-semibold mb-2">Share</h6>
                <div className="flex gap-2">
                  <button
                    className="rounded-lg border border-primary-500 text-primary-500 hover:bg-primary-500 hover:text-white px-3 py-1.5 text-sm font-medium transition-colors"
                    onClick={() => copyToClipboard(window.location.href)}
                  >
                    Copy link
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        {!post.id.startsWith("sample-") && (
          <div className="flex items-center gap-2 mb-4">
            <button
              className={cn(
                "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                userPostReaction === "like"
                  ? "bg-green-500 text-white"
                  : "border border-green-500 text-green-500 hover:bg-green-500 hover:text-white",
              )}
              disabled={!user}
              onClick={async () => {
                if (!user) return;
                await reactToPostForUser(post.id, user.uid, "like");
                setUserPostReaction("like");
              }}
            >
              👍 {post.likeCount}
            </button>
            <button
              className={cn(
                "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                userPostReaction === "dislike"
                  ? "bg-red-500 text-white"
                  : "border border-red-500 text-red-500 hover:bg-red-500 hover:text-white",
              )}
              disabled={!user}
              onClick={async () => {
                if (!user) return;
                await reactToPostForUser(post.id, user.uid, "dislike");
                setUserPostReaction("dislike");
              }}
            >
              👎 {post.dislikeCount}
            </button>
          </div>
        )}
        <section className="mb-10">
          <h4 className="text-foreground text-xl font-semibold mb-3">
            Comments ({post.commentCount})
          </h4>
          {post.id.startsWith("sample-") ? (
            <div className="text-foreground-secondary text-sm mb-3">
              Comments disabled for sample post.
            </div>
          ) : user ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                submit();
              }}
              className="mb-4"
            >
              <div className="mb-2 relative">
                <textarea
                  rows={3}
                  value={newComment}
                  onChange={handleNewCommentChange}
                  onKeyDown={handleNewKeyDown}
                  placeholder="Write a comment..."
                  ref={newCommentRef}
                  className="w-full rounded-lg border border-border dark:border-border-dark bg-card dark:bg-card-dark text-foreground px-3 py-2 outline-none focus:ring-2 focus:ring-primary-500 resize-y"
                />
                {showSuggestions &&
                  suggestions.length > 0 &&
                  suggestionOwner === "main" && (
                    <div className="absolute left-2 right-2 top-full z-[2000] bg-card dark:bg-card-dark border border-border dark:border-border-dark rounded-md mt-1.5 shadow-lg">
                      {suggestions.map((s, idx) => (
                        <div
                          key={s.username}
                          onMouseDown={(ev) => {
                            ev.preventDefault();
                            applySuggestionToTextarea(s.username);
                          }}
                          className={cn(
                            "px-3 py-1.5 cursor-pointer text-foreground",
                            idx === activeSuggestion &&
                              "bg-gray-100 dark:bg-gray-700",
                          )}
                        >
                          @{s.username}
                        </div>
                      ))}
                    </div>
                  )}
              </div>
              <div className="text-sm text-foreground-secondary mb-2">
                Mention partial: <strong>{mentionPartial || "-"}</strong> •
                Suggestions: {suggestions.length}
              </div>
              <button
                className="rounded-lg bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white px-3 py-1.5 text-sm font-medium transition-colors"
                disabled={!newComment.trim() || posting}
                type="submit"
              >
                {posting ? "Posting..." : "Post Comment"}
              </button>
            </form>
          ) : (
            <div className="text-foreground-secondary text-sm mb-3">
              Login to comment.
            </div>
          )}
          {!post.id.startsWith("sample-") && (
            <div className="comments-tree">
              {comments.map((c) => (
                <CommentItem
                  key={c.id}
                  node={c}
                  postId={post.id}
                  mentionProps={{
                    suggestions,
                    showSuggestions,
                    suggestionOwner,
                    activeSuggestion,
                    applySuggestionToTextarea,
                    fetchSuggestions,
                    setActiveSuggestion,
                    setShowSuggestions,
                    setSuggestionOwner,
                    setSuggestions,
                    activeTextareaRef,
                    postSlug: post.slug,
                  }}
                />
              ))}
              {comments.length === 0 && (
                <div className="text-foreground-secondary text-sm italic">
                  No comments yet.
                </div>
              )}
            </div>
          )}
        </section>
      </div>

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
          onClick={() => setLightboxOpen(false)}
          aria-label="Image viewer"
        >
          <div
            className="relative bg-card dark:bg-card-dark rounded-xl shadow-2xl max-w-4xl w-full mx-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border dark:border-border-dark">
              <h6 className="text-foreground font-semibold truncate m-0">
                {lightboxAlt || ""}
              </h6>
              <button
                className="text-foreground-secondary hover:text-foreground text-xl leading-none"
                onClick={() => setLightboxOpen(false)}
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            {/* Body */}
            <div className="relative flex items-center justify-center bg-black">
              {lightboxSrc && (
                <Image
                  src={lightboxSrc}
                  alt={lightboxAlt || ""}
                  width={1200}
                  height={800}
                  style={{
                    maxWidth: "100%",
                    maxHeight: "80vh",
                    width: "auto",
                    height: "auto",
                  }}
                  unoptimized
                />
              )}

              {/* Prev button */}
              {gallery.length > 1 && (
                <button
                  aria-label="Previous image"
                  onClick={gotoPrev}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white px-2.5 py-2 rounded-md transition-colors"
                >
                  ◀
                </button>
              )}

              {/* Next button */}
              {gallery.length > 1 && (
                <button
                  aria-label="Next image"
                  onClick={gotoNext}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white px-2.5 py-2 rounded-md transition-colors"
                >
                  ▶
                </button>
              )}
            </div>
            {/* Footer */}
            {gallery.length > 0 && (
              <div className="flex justify-center py-2 border-t border-border dark:border-border-dark">
                <span className="text-sm text-foreground-secondary">
                  {currentIndex + 1} / {gallery.length}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function CommentItem({
  node,
  postId,
  mentionProps,
}: {
  node: CommentNode;
  postId: string;
  mentionProps?: any;
}) {
  const { user } = useAuth();
  const {
    suggestions = [],
    showSuggestions = false,
    suggestionOwner = null,
    activeSuggestion = 0,
    applySuggestionToTextarea = (u: string) => {},
    fetchSuggestions = async (q: string) => {},
    setActiveSuggestion = (v: any) => {},
    setShowSuggestions = (v: any) => {},
    setSuggestionOwner = (v: any) => {},
    setSuggestions = (v: any) => {},
    activeTextareaRef = { current: null },
  } = mentionProps || {};
  const [replyOpen, setReplyOpen] = useState(false);
  const [reply, setReply] = useState("");
  const [working, setWorking] = useState(false);
  const [userReaction, setUserReaction] = useState<
    "like" | "dislike" | undefined
  >(node.userReaction);
  const [likeCount, setLikeCount] = useState(node.likeCount);
  const [dislikeCount, setDislikeCount] = useState(node.dislikeCount);
  async function react(type: "like" | "dislike") {
    if (!user) return;
    if (userReaction === type) return; // no toggle off for simplicity
    await reactToCommentForUser(node.id, user.uid, type);
    // optimistic update
    setLikeCount(
      (c) => c + (type === "like" ? 1 : 0) - (userReaction === "like" ? 1 : 0),
    );
    setDislikeCount(
      (c) =>
        c + (type === "dislike" ? 1 : 0) - (userReaction === "dislike" ? 1 : 0),
    );
    setUserReaction(type);
  }
  async function submit() {
    if (!user || !reply.trim()) return;
    setWorking(true);
    try {
      const c = reply.trim();
      const re = /@([A-Za-z0-9_]{3,32})/g;
      const set = new Set<string>();
      let mm: RegExpExecArray | null;
      while ((mm = re.exec(c))) {
        set.add(mm[1].toLowerCase());
      }
      const mentions = Array.from(set);
      const commentId = await addComment(user.uid, user.email || "unknown", {
        postId,
        parentId: node.id,
        content: c,
        mentions,
      });
      setReply("");
      setReplyOpen(false);
      try {
        await notifyMentions(c, postId, commentId, mentionProps?.postSlug);
      } catch (e) {
        console.warn("mention notify failed", e);
      }
    } finally {
      setWorking(false);
    }
  }

  // insert suggestion into this reply textarea (keeps local React state in sync)
  function insertSuggestionLocal(username: string) {
    const ta = activeTextareaRef.current as HTMLTextAreaElement | null;
    // fallback: try to find focused textarea in this component
    const caret = ta ? ta.selectionStart || ta.value.length : reply.length;
    const val = reply;
    const start = ta
      ? val.lastIndexOf("@", caret - 1)
      : val.lastIndexOf("@", caret - 1);
    if (start < 0) return;
    const before = val.slice(0, start);
    const after = val.slice(caret);
    const insert = `@${username} `;
    const newVal = before + insert + after;
    setReply(newVal);
    setShowSuggestions(false);
    setSuggestionOwner(null);
    setSuggestions([]);
    // restore focus and caret
    requestAnimationFrame(() => {
      try {
        if (ta) {
          ta.focus();
          const pos = before.length + insert.length;
          ta.setSelectionRange(pos, pos);
        }
      } catch (e) {}
    });
  }
  return (
    <div id={`comment-${node.id}`} className="mb-3">
      <div className="p-2 border border-border dark:border-border-dark rounded-lg bg-gray-50 dark:bg-gray-800/50">
        <div className="flex items-center gap-2 text-sm text-foreground-secondary mb-1">
          <strong className="text-foreground">{node.authorName}</strong>
          <span>{new Date(node.createdAt).toLocaleString()}</span>
        </div>
        <div className="text-sm mb-2">
          {renderCommentWithLinks(node.content)}
        </div>
        <div className="flex gap-2">
          <button
            className={cn(
              "rounded-lg px-3 py-1 text-xs font-medium transition-colors",
              userReaction === "like"
                ? "bg-green-500 text-white"
                : "border border-green-500 text-green-500 hover:bg-green-500 hover:text-white",
            )}
            disabled={!user}
            onClick={() => react("like")}
          >
            👍 {likeCount}
          </button>
          <button
            className={cn(
              "rounded-lg px-3 py-1 text-xs font-medium transition-colors",
              userReaction === "dislike"
                ? "bg-red-500 text-white"
                : "border border-red-500 text-red-500 hover:bg-red-500 hover:text-white",
            )}
            disabled={!user}
            onClick={() => react("dislike")}
          >
            👎 {dislikeCount}
          </button>
          {user && (
            <button
              className="rounded-lg border border-primary-500 text-primary-500 hover:bg-primary-500 hover:text-white px-3 py-1 text-xs font-medium transition-colors"
              onClick={() => setReplyOpen((o) => !o)}
            >
              Reply
            </button>
          )}
        </div>
        {/* Collapsible reply form */}
        <div
          className={cn(
            "overflow-hidden transition-all duration-200",
            replyOpen ? "max-h-[500px] opacity-100 mt-2" : "max-h-0 opacity-0",
          )}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submit();
            }}
          >
            <textarea
              rows={2}
              value={reply}
              onChange={(e) => {
                setReply(e.target.value);
                // reply mention handling: set active textarea and look for @
                const ta = e.target as HTMLTextAreaElement;
                activeTextareaRef.current = ta;
                const caret = ta.selectionStart || ta.value.length;
                const before = ta.value.slice(0, caret);
                const at = before.lastIndexOf("@");
                if (at >= 0 && (at === 0 || /\s/.test(before[at - 1]))) {
                  const partial = before.slice(at + 1);
                  if (/^[A-Za-z0-9_]{1,32}$/.test(partial)) {
                    // debounce: simple 200ms
                    // mark this comment as suggestion owner so only its dropdown shows
                    setSuggestionOwner(node.id);
                    setTimeout(
                      () => fetchSuggestions(partial.toLowerCase(), node.id),
                      200,
                    );
                  }
                }
              }}
              placeholder="Reply..."
              className="w-full rounded-lg border border-border dark:border-border-dark bg-card dark:bg-card-dark text-foreground px-3 py-2 mb-2 outline-none focus:ring-2 focus:ring-primary-500 resize-y text-sm"
              onFocus={(e) => {
                activeTextareaRef.current = e.target as HTMLTextAreaElement;
                setSuggestionOwner(node.id);
              }}
              onBlur={(e) => {
                /* keep suggestions visible briefly; they will be cleared on apply or escape */
              }}
              onKeyDown={(e) => {
                if (suggestionOwner === node.id && showSuggestions) {
                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    setActiveSuggestion((i: number) =>
                      Math.min(suggestions.length - 1, i + 1),
                    );
                  } else if (e.key === "ArrowUp") {
                    e.preventDefault();
                    setActiveSuggestion((i: number) => Math.max(0, i - 1));
                  } else if (e.key === "Enter") {
                    e.preventDefault();
                    const s = suggestions[activeSuggestion];
                    if (s) insertSuggestionLocal(s.username);
                  } else if (e.key === "Escape") {
                    setShowSuggestions(false);
                    setSuggestionOwner(null);
                  }
                }
              }}
            />
            {suggestionOwner === node.id &&
              showSuggestions &&
              suggestions.length > 0 && (
                <div className="relative">
                  <div className="absolute left-2 right-2 top-full z-[2000] bg-card dark:bg-card-dark border border-border dark:border-border-dark rounded-md mt-1.5 shadow-lg">
                    {suggestions.map(
                      (s: { username: string; uid: string }, idx: number) => (
                        <div
                          key={s.username}
                          onMouseDown={(ev) => {
                            ev.preventDefault(); // ensure owner still this before applying
                            if (suggestionOwner === node.id)
                              insertSuggestionLocal(s.username);
                          }}
                          className={cn(
                            "px-3 py-1.5 cursor-pointer text-foreground text-sm",
                            idx === activeSuggestion &&
                              "bg-gray-100 dark:bg-gray-700",
                          )}
                        >
                          @{s.username}
                        </div>
                      ),
                    )}
                  </div>
                </div>
              )}
            <div className="flex gap-2">
              <button
                className="rounded-lg bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white px-3 py-1 text-xs font-medium transition-colors"
                disabled={!reply.trim() || working}
                type="submit"
              >
                {working ? "Posting..." : "Submit"}
              </button>
              <button
                type="button"
                className="rounded-lg border border-border dark:border-border-dark text-foreground-secondary hover:bg-gray-100 dark:hover:bg-gray-700 px-3 py-1 text-xs font-medium transition-colors"
                onClick={() => {
                  setReplyOpen(false);
                  setReply("");
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
      <div className="ml-6 mt-2">
        {node.replies?.map((r) => (
          <CommentItem
            key={r.id}
            node={r}
            postId={postId}
            mentionProps={mentionProps}
          />
        ))}
      </div>
    </div>
  );
}
