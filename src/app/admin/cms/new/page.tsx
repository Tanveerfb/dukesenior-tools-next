"use client";
import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { createPost, listPosts, updatePost, getPost } from "@/lib/services/cms";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import rehypeSlug from "rehype-slug";
import useCmsUploads from "@/hooks/useCmsUploads";
import { useSearchParams, useRouter } from "next/navigation";

export default function NewPostPage() {
  const { user, admin } = useAuth();
  const params = useSearchParams();
  const router = useRouter();
  const editId = params.get("id");

  // form state
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");
  const [bannerUploadMode, setBannerUploadMode] = useState<"url" | "upload">(
    "url",
  );
  const [bannerUploading, setBannerUploading] = useState(false);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [tagQuery, setTagQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const [_uploadingLocal, setUploadingLocal] = useState(false);
  const [uploadsCount, setUploadsCount] = useState(0);
  const [fileProgress, setFileProgress] = useState<Record<string, number>>({});
  const [toasts, setToasts] = useState<
    Array<{ id: string; text: string; variant?: string }>
  >([]);
  const uploadControllers = React.useRef<{
    cancelAll?: () => void;
    cancel?: (name: string) => void;
    bannerCancel?: () => void;
  }>({});
  const maxImages = 10;
  const [preview, setPreview] = useState(true);
  const [postStatus, setPostStatus] = useState<
    "draft" | "published" | "scheduled"
  >("published");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");

  useEffect(() => {
    async function init() {
      if (!admin) return;
      setLoading(true);
      try {
        const existing = await listPosts(500);
        const tagSet = new Set<string>();
        existing.forEach((p) =>
          (p.tags || []).forEach((t: string) => tagSet.add(t)),
        );
        setAllTags(Array.from(tagSet).sort());
        if (editId) {
          const post = await getPost(editId as string);
          if (post) {
            setTitle(post.title || "");
            setContent(post.content || "");
            setBannerUrl(post.bannerUrl || "");
            setSelectedTags(post.tags || []);
            setPostStatus(post.status || "published");
            if (post.scheduledFor) {
              const d = new Date(post.scheduledFor);
              setScheduledDate(d.toISOString().split("T")[0]);
              setScheduledTime(d.toTimeString().slice(0, 5));
            }
          }
        }
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [editId, admin]);

  function addTag(tag: string) {
    const t = tag.trim();
    if (!t) return;
    setSelectedTags((prev) => (prev.includes(t) ? prev : [...prev, t]));
    setTagQuery("");
    setShowTagDropdown(false);
  }
  function removeTag(tag: string) {
    setSelectedTags((prev) => prev.filter((t) => t !== tag));
  }
  const filtered = allTags
    .filter(
      (t) =>
        t.toLowerCase().includes(tagQuery.toLowerCase()) &&
        !selectedTags.includes(t),
    )
    .slice(0, 8);

  // When dropdown opens or filtered results change, set initial highlight
  useEffect(() => {
    if (showTagDropdown && filtered.length > 0) setHighlightedIndex(0);
    else setHighlightedIndex(-1);
  }, [showTagDropdown, filtered.length]);

  function highlightMatch(text: string, q: string): React.ReactNode {
    if (!q) return text;
    const idx = text.toLowerCase().indexOf(q.toLowerCase());
    if (idx === -1) return text;
    return (
      <>
        {text.slice(0, idx)}
        <strong>{text.slice(idx, idx + q.length)}</strong>
        {text.slice(idx + q.length)}
      </>
    );
  }

  function handleTagKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    const key = e.key;
    if (key === "Escape") {
      e.preventDefault();
      setShowTagDropdown(false);
      return;
    }
    if (key === "Enter") {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < filtered.length) {
        addTag(filtered[highlightedIndex]);
      } else {
        addTag(tagQuery);
      }
      return;
    }
    if (key === "ArrowDown") {
      e.preventDefault();
      if (filtered.length === 0) return;
      setHighlightedIndex((i) =>
        Math.min((i < 0 ? -1 : i) + 1, filtered.length - 1),
      );
      return;
    }
    if (key === "ArrowUp") {
      e.preventDefault();
      if (filtered.length === 0) return;
      setHighlightedIndex((i) =>
        Math.max((i < 0 ? filtered.length : i) - 1, 0),
      );
      return;
    }
  }

  function insert(snippet: string) {
    const el = document.getElementById(
      "cms-editor-area",
    ) as HTMLTextAreaElement | null;
    if (!el) {
      setContent((c) => c + snippet);
      return;
    }
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const updated = content.slice(0, start) + snippet + content.slice(end);
    setContent(updated);
    requestAnimationFrame(() => {
      el.focus();
      const pos = start + snippet.length;
      el.selectionStart = el.selectionEnd = pos;
    });
  }

  // Keyboard shortcuts scoped to the editor when focused
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      try {
        if (!(e.ctrlKey || e.metaKey)) return;
        const el = document.getElementById(
          "cms-editor-area",
        ) as HTMLTextAreaElement | null;
        if (!el) return;
        if (document.activeElement !== el) return; // only when editor is focused
        const k = (e.key || "").toUpperCase();
        const map: Record<string, string> = {
          B: "**bold**",
          I: "*italic*",
          H: "\n\n## Heading\n\n",
          L: "\n- item 1\n- item 2\n",
          C: "\n```txt\ncode here\n```\n",
          Q: "\n> quote here\n",
          K: "[title](https://example.com)",
          M: "![alt text](https://url/image.png)",
          Y: "\n<!-- YT: https://www.youtube.com/watch?v=VIDEO_ID -->\n",
          T: "\n<!-- TWITCH: channel_name -->\n",
        };
        if (map[k]) {
          e.preventDefault();
          insert(map[k]);
        }
      } catch (_err) {}
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [content]);

  const toolbar = [
    { label: "Bold", key: "B", snippet: "**bold**" },
    { label: "Italic", key: "I", snippet: "*italic*" },
    { label: "Heading", key: "H", snippet: "\n\n## Heading\n\n" },
    { label: "List", key: "L", snippet: "\n- item 1\n- item 2\n" },
    { label: "Code", key: "C", snippet: "\n```txt\ncode here\n```\n" },
    { label: "Quote", key: "Q", snippet: "\n> quote here\n" },
    { label: "Link", key: "K", snippet: "[title](https://example.com)" },
    { label: "Image", key: "M", snippet: "![alt text](https://url/image.png)" },
    {
      label: "YouTube",
      key: "Y",
      snippet: "\n<!-- YT: https://www.youtube.com/watch?v=VIDEO_ID -->\n",
    },
    { label: "Twitch", key: "T", snippet: "\n<!-- TWITCH: channel_name -->\n" },
  ];

  const { uploading, uploadImages, uploadBanner } = useCmsUploads();

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const remaining = maxImages - uploadsCount;
    const slice = files.slice(0, remaining);
    setUploadingLocal(true);
    try {
      const controllers = await uploadImages(
        slice,
        (url, name) => {
          insert(`\n![${name}](${url})\n`);
          setUploadsCount((c) => c + 1);
          setToasts((t) => [
            { id: name, text: `Uploaded ${name}`, variant: "success" },
            ...t,
          ]);
        },
        (name, pct) => {
          setFileProgress((p) => ({ ...p, [name]: pct }));
        },
        (name, _err) => {
          setToasts((t) => [
            {
              id: name + Date.now(),
              text: `Upload failed: ${name}`,
              variant: "danger",
            },
            ...t,
          ]);
        },
      );
      uploadControllers.current.cancelAll = controllers.cancelAll;
      uploadControllers.current.cancel = controllers.cancel;
    } finally {
      setUploadingLocal(false);
      e.target.value = "";
    }
  }

  async function handleBannerUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setBannerUploading(true);
    try {
      const { url, cancel } = await uploadBanner(f, (pct) =>
        setFileProgress((p) => ({ ...p, banner: pct })),
      );
      uploadControllers.current.bannerCancel = cancel;
      setBannerUrl(url);
      setBannerUploadMode("url");
      setToasts((t) => [
        {
          id: "banner-" + Date.now(),
          text: "Banner uploaded",
          variant: "success",
        },
        ...t,
      ]);
    } catch (_err) {
      setToasts((t) => [
        {
          id: "bannererr-" + Date.now(),
          text: "Banner upload failed",
          variant: "danger",
        },
        ...t,
      ]);
    } finally {
      setBannerUploading(false);
      e.target.value = "";
    }
  }

  async function save() {
    if (!user) return;
    if (!title.trim()) return;
    setSaving(true);
    try {
      if (editId) {
        await updatePost({
          id: editId as string,
          title,
          content,
          bannerUrl,
          tags: selectedTags,
        });
      } else {
        await createPost(user!.uid, user!.email || "unknown", {
          title,
          content,
          bannerUrl,
          tags: selectedTags,
        });
      }
      router.push("/admin/cms");
    } finally {
      setSaving(false);
    }
  }

  // server-side validate banner before saving
  async function validateBanner(url: string) {
    try {
      const token = await user?.getIdToken();
      const res = await fetch("/api/admin/validate-banner", {
        method: "POST",
        body: JSON.stringify({ url }),
        headers: {
          "content-type": "application/json",
          ...(token ? { authorization: `Bearer ${token}` } : {}),
        },
      });
      return await res.json();
    } catch (err) {
      return { ok: false, error: String(err) };
    }
  }

  async function saveWithValidation() {
    if (!user) return;
    if (!title.trim()) return;

    // Validate scheduled date/time
    let scheduledFor: number | undefined;
    if (postStatus === "scheduled") {
      if (!scheduledDate || !scheduledTime) {
        setToasts((t) => [
          {
            id: "validate-" + Date.now(),
            text: "Please provide both date and time for scheduled posts",
            variant: "danger",
          },
          ...t,
        ]);
        return;
      }
      const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`);
      if (scheduledDateTime.getTime() <= Date.now()) {
        setToasts((t) => [
          {
            id: "validate-" + Date.now(),
            text: "Scheduled time must be in the future",
            variant: "danger",
          },
          ...t,
        ]);
        return;
      }
      scheduledFor = scheduledDateTime.getTime();
    }

    setSaving(true);
    try {
      if (bannerUrl) {
        const v = await validateBanner(bannerUrl);
        if (!v.ok) {
          setToasts((t) => [
            {
              id: "validate-" + Date.now(),
              text: `Banner validation failed: ${v.error}`,
              variant: "danger",
            },
            ...t,
          ]);
          setSaving(false);
          return;
        }
      }
      if (editId) {
        await updatePost({
          id: editId as string,
          title,
          content,
          bannerUrl,
          tags: selectedTags,
          status: postStatus,
          scheduledFor,
        });
      } else {
        await createPost(user!.uid, user!.email || "unknown", {
          title,
          content,
          bannerUrl,
          tags: selectedTags,
          status: postStatus,
          scheduledFor,
        });
      }
      router.push("/admin/cms");
    } finally {
      setSaving(false);
    }
  }

  // guard: render admin-only message while keeping hooks stable
  if (!admin)
    return (
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="rounded border border-red-400/30 bg-red-50 dark:bg-red-900/30 p-3 text-sm text-red-700 dark:text-red-300">
          Admin only
        </div>
      </div>
    );
  if (loading)
    return (
      <div className="max-w-7xl mx-auto px-4 py-10 text-center">
        <svg
          className="animate-spin h-8 w-8 text-primary-500 mx-auto"
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
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto px-4 py-4">
      {/* Toasts */}
      <div
        aria-live="polite"
        aria-atomic="true"
        style={{ position: "fixed", top: 80, right: 20, zIndex: 2000 }}
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "mb-2 rounded-xl border shadow-sm min-w-[220px] overflow-hidden",
              t.variant === "success" &&
                "border-green-400/30 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300",
              t.variant === "danger" &&
                "border-red-400/30 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300",
              !t.variant &&
                "border-border bg-card dark:bg-card-dark dark:border-border-dark text-foreground",
            )}
          >
            <div className="flex items-center justify-between px-3 py-2">
              <span className="text-sm">{t.text}</span>
              <button
                onClick={() =>
                  setToasts((ts) => ts.filter((x) => x.id !== t.id))
                }
                className="ml-2 text-current hover:opacity-70 text-lg leading-none"
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>
      <h1 className="text-2xl font-bold text-foreground mb-3">
        {editId ? "Edit Post" : "New Post"}
      </h1>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-7">
          <div className="mb-2">
            <label className="block text-sm font-medium text-foreground mb-1">
              Title
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Post title"
              className="w-full rounded border border-border bg-transparent px-3 py-1.5 text-sm text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="mb-3">
            <label className="block text-sm font-medium text-foreground mb-1">
              Status
            </label>
            <div className="flex gap-2 mb-2">
              <button
                onClick={() => setPostStatus("draft")}
                className={cn(
                  "px-2 py-1 text-xs rounded",
                  postStatus === "draft"
                    ? "bg-primary-500 text-white"
                    : "border border-primary-500 text-primary-500 hover:bg-primary-500/10",
                )}
              >
                Draft
              </button>
              <button
                onClick={() => setPostStatus("published")}
                className={cn(
                  "px-2 py-1 text-xs rounded",
                  postStatus === "published"
                    ? "bg-green-600 text-white"
                    : "border border-green-600 text-green-600 hover:bg-green-600/10",
                )}
              >
                Published
              </button>
              <button
                onClick={() => setPostStatus("scheduled")}
                className={cn(
                  "px-2 py-1 text-xs rounded",
                  postStatus === "scheduled"
                    ? "bg-blue-500 text-white"
                    : "border border-blue-500 text-blue-500 hover:bg-blue-500/10",
                )}
              >
                Scheduled
              </button>
            </div>
            {postStatus === "scheduled" && (
              <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full rounded border border-border bg-transparent px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">
                    Time
                  </label>
                  <input
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="w-full rounded border border-border bg-transparent px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="mb-3 flex items-start gap-3">
            <div style={{ minWidth: 220 }}>
              <label className="block text-sm font-medium text-foreground mb-1">
                Banner
              </label>
              <div className="flex gap-2 mb-2">
                <button
                  onClick={() => setBannerUploadMode("url")}
                  className={cn(
                    "px-2 py-1 text-xs rounded",
                    bannerUploadMode === "url"
                      ? "bg-primary-500 text-white"
                      : "border border-primary-500 text-primary-500 hover:bg-primary-500/10",
                  )}
                >
                  Use URL
                </button>
                <button
                  onClick={() => setBannerUploadMode("upload")}
                  className={cn(
                    "px-2 py-1 text-xs rounded",
                    bannerUploadMode === "upload"
                      ? "bg-primary-500 text-white"
                      : "border border-primary-500 text-primary-500 hover:bg-primary-500/10",
                  )}
                >
                  Upload
                </button>
              </div>
              {bannerUploadMode === "url" ? (
                <input
                  value={bannerUrl}
                  onChange={(e) => setBannerUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full rounded border border-border bg-transparent px-3 py-1.5 text-sm text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              ) : (
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleBannerUpload}
                    disabled={bannerUploading}
                    className="w-full text-sm text-foreground file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:bg-primary-500 file:text-white hover:file:bg-primary-600"
                  />
                  {bannerUploading && (
                    <div className="mt-2 text-sm text-foreground/60">
                      Uploading...
                    </div>
                  )}
                </div>
              )}
              {bannerUrl && (
                <div className="mt-2">
                  <img
                    src={bannerUrl}
                    alt="banner preview"
                    style={{ maxWidth: "100%", borderRadius: 6 }}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="mb-3">
            <label className="block text-sm font-medium text-foreground mb-1">
              Tags
            </label>
            <div className="flex gap-2 flex-wrap mb-2">
              {selectedTags.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1 rounded-full text-xs font-medium px-2.5 py-0.5 bg-blue-500 text-white"
                >
                  <span>{t}</span>
                  <button
                    type="button"
                    onClick={() => removeTag(t)}
                    aria-label={`Remove tag ${t}`}
                    className="hover:text-white/70 text-white ml-1 text-sm leading-none"
                  >
                    ×
                  </button>
                </span>
              ))}
              {selectedTags.length === 0 && (
                <span className="text-foreground/60 text-sm">
                  No tags selected
                </span>
              )}
            </div>
            <input
              value={tagQuery}
              placeholder="Type to search or create tag"
              onChange={(e) => {
                setTagQuery(e.target.value);
                setShowTagDropdown(true);
              }}
              onKeyDown={handleTagKeyDown}
              onFocus={() => setShowTagDropdown(true)}
              aria-haspopup="listbox"
              aria-controls="tag-dropdown-list"
              className="w-full rounded border border-border bg-transparent px-3 py-1.5 text-sm text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            {showTagDropdown && (filtered.length > 0 || tagQuery.trim()) && (
              <div className="relative">
                <div
                  id="tag-dropdown-list"
                  role="listbox"
                  className="absolute w-full bg-card dark:bg-card-dark border border-border dark:border-border-dark rounded shadow-sm mt-1 p-1 z-30"
                  style={{ maxHeight: 200, overflowY: "auto" }}
                >
                  {filtered.map((t: string, i: number) => {
                    const highlighted = i === highlightedIndex;
                    return (
                      <button
                        key={t}
                        className={cn(
                          "w-full text-left px-2 py-1 text-sm flex items-center rounded",
                          highlighted
                            ? "bg-primary-500 text-white"
                            : "bg-transparent text-foreground hover:bg-foreground/10",
                        )}
                        type="button"
                        role="option"
                        aria-selected={highlighted}
                        onMouseEnter={() => setHighlightedIndex(i)}
                        onMouseLeave={() => setHighlightedIndex(-1)}
                        onClick={() => addTag(t)}
                      >
                        <div className="flex-1">
                          {highlightMatch(t, tagQuery)}
                        </div>
                      </button>
                    );
                  })}
                  {tagQuery.trim() &&
                    !allTags.includes(tagQuery.trim()) &&
                    !selectedTags.includes(tagQuery.trim()) && (
                      <button
                        type="button"
                        className={cn(
                          "w-full text-left px-2 py-1 text-sm flex items-center rounded",
                          highlightedIndex === filtered.length
                            ? "bg-primary-500 text-white"
                            : "text-foreground hover:bg-foreground/10",
                        )}
                        onClick={() => addTag(tagQuery.trim())}
                        role="option"
                        aria-selected={highlightedIndex === filtered.length}
                      >
                        <div className="flex-1">
                          Add new tag &quot;<strong>{tagQuery.trim()}</strong>
                          &quot;
                        </div>
                      </button>
                    )}
                </div>
              </div>
            )}
            {/* per-file progress */}
            {Object.keys(fileProgress).length > 0 && (
              <div className="mt-2">
                {Object.entries(fileProgress).map(([name, pct]) => (
                  <div key={name} className="flex items-center gap-2 mb-1">
                    <div className="w-40 truncate text-sm text-foreground">
                      {name}
                    </div>
                    <div
                      className="flex-1 bg-foreground/10 rounded-full h-3 overflow-hidden"
                      aria-hidden
                    >
                      <div
                        className="bg-primary-500 h-3 rounded-full transition-all text-[10px] text-white text-center leading-3"
                        role="progressbar"
                        style={{ width: `${pct}%` }}
                        aria-valuenow={pct}
                        aria-valuemin={0}
                        aria-valuemax={100}
                      >
                        {pct}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2 mb-2">
            {toolbar.map((btn) => (
              <button
                key={btn.label}
                title={`${btn.label} (Ctrl+${btn.key})`}
                onClick={() => insert(btn.snippet)}
                className="px-2 py-1 text-xs rounded bg-gray-500 text-white hover:bg-gray-600"
              >
                {btn.label}
              </button>
            ))}
            <div className="ml-auto flex items-center gap-2">
              <label className="text-sm text-foreground whitespace-nowrap">
                Images ({uploadsCount}/{maxImages})
              </label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleUpload}
                disabled={uploading || uploadsCount >= maxImages}
                className="text-sm text-foreground file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-primary-500 file:text-white hover:file:bg-primary-600"
                style={{ maxWidth: 220 }}
              />
              {uploading && (
                <svg
                  className="animate-spin h-4 w-4 text-primary-500"
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
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
              )}
            </div>
          </div>

          <div className="mb-2">
            <label className="block text-sm font-medium text-foreground mb-1">
              Content (Markdown)
            </label>
            <textarea
              id="cms-editor-area"
              rows={18}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write markdown here..."
              className="w-full rounded border border-border bg-transparent px-3 py-1.5 text-sm text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono"
            />
          </div>
          <div className="text-sm text-foreground/60 mb-3">
            <strong>Shortcuts:</strong>{" "}
            {toolbar.map((t) => (
              <code
                key={t.key}
                className="mr-2 bg-foreground/10 px-1 rounded text-xs"
              >
                Ctrl+{t.key}
              </code>
            ))}{" "}
            | Enter to add tag.
          </div>
          <div className="flex gap-2 mb-4">
            <button
              disabled={!title.trim() || saving}
              onClick={saveWithValidation}
              className={cn(
                "px-3 py-1.5 rounded bg-primary-500 text-white hover:bg-primary-600 text-sm",
                (!title.trim() || saving) && "opacity-50 cursor-not-allowed",
              )}
            >
              {saving
                ? "Saving..."
                : editId
                  ? "Update Post"
                  : postStatus === "draft"
                    ? "Save Draft"
                    : postStatus === "scheduled"
                      ? "Schedule Post"
                      : "Publish Post"}
            </button>
            <button
              onClick={() => setPreview((p) => !p)}
              className="px-3 py-1.5 rounded bg-gray-500 text-white hover:bg-gray-600 text-sm"
            >
              {preview ? "Hide Preview" : "Show Preview"}
            </button>
            <button
              onClick={() => router.push("/admin/cms")}
              className="px-3 py-1.5 rounded border border-gray-500 text-gray-500 hover:bg-gray-500/10 text-sm"
            >
              Back
            </button>
          </div>
        </div>
        <div className="lg:col-span-5 mt-3 lg:mt-0">
          {preview && (
            <div
              className="p-3 border border-border rounded bg-foreground/5"
              style={{ maxHeight: "80vh", overflowY: "auto" }}
            >
              <h5 className="font-semibold text-foreground mb-2">
                Live Preview
              </h5>
              {content.trim() ? (
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw, rehypeSanitize, rehypeSlug]}
                >
                  {content}
                </ReactMarkdown>
              ) : (
                <div className="text-foreground/60 text-sm italic">
                  Start typing...
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
