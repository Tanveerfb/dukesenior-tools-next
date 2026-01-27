"use client";
import React, { useState, useEffect } from "react";
import {
  Container,
  Form,
  Button,
  Spinner,
  Alert,
  OverlayTrigger,
  Tooltip,
  Row,
  Col,
} from "react-bootstrap";
import { useAuth } from "@/hooks/useAuth";
import Toast from "react-bootstrap/Toast";
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
    "url"
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
  const [postStatus, setPostStatus] = useState<'draft' | 'published' | 'scheduled'>('published');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');

  useEffect(() => {
    async function init() {
      if (!admin) return;
      setLoading(true);
      try {
        const existing = await listPosts(500);
        const tagSet = new Set<string>();
        existing.forEach((p) =>
          (p.tags || []).forEach((t: string) => tagSet.add(t))
        );
        setAllTags(Array.from(tagSet).sort());
        if (editId) {
          const post = await getPost(editId as string);
          if (post) {
            setTitle(post.title || "");
            setContent(post.content || "");
            setBannerUrl(post.bannerUrl || "");
            setSelectedTags(post.tags || []);
            setPostStatus(post.status || 'published');
            if (post.scheduledFor) {
              const d = new Date(post.scheduledFor);
              setScheduledDate(d.toISOString().split('T')[0]);
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
        !selectedTags.includes(t)
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
        Math.min((i < 0 ? -1 : i) + 1, filtered.length - 1)
      );
      return;
    }
    if (key === "ArrowUp") {
      e.preventDefault();
      if (filtered.length === 0) return;
      setHighlightedIndex((i) =>
        Math.max((i < 0 ? filtered.length : i) - 1, 0)
      );
      return;
    }
  }

  function insert(snippet: string) {
    const el = document.getElementById(
      "cms-editor-area"
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
          "cms-editor-area"
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
        }
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
        setFileProgress((p) => ({ ...p, banner: pct }))
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
      const res = await fetch("/api/admin/validate-banner", {
        method: "POST",
        body: JSON.stringify({ url }),
        headers: { "content-type": "application/json" },
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
    if (postStatus === 'scheduled') {
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
      <Container className="py-5">
        <Alert variant="danger">Admin only</Alert>
      </Container>
    );
  if (loading)
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" />
      </Container>
    );

  return (
    <Container className="py-4">
      {/* Toasts */}
      <div
        aria-live="polite"
        aria-atomic="true"
        style={{ position: "fixed", top: 80, right: 20, zIndex: 2000 }}
      >
        {toasts.map((t) => (
          <Toast
            key={t.id}
            onClose={() => setToasts((ts) => ts.filter((x) => x.id !== t.id))}
            className="mb-2"
            bg={t.variant || undefined}
          >
            <Toast.Body>{t.text}</Toast.Body>
          </Toast>
        ))}
      </div>
      <h1 className="mb-3">{editId ? "Edit Post" : "New Post"}</h1>
      <Row>
        <Col lg={7}>
          <Form.Group className="mb-2">
            <Form.Label>Title</Form.Label>
            <Form.Control
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Post title"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Status</Form.Label>
            <div className="d-flex gap-2 mb-2">
              <Button
                size="sm"
                variant={postStatus === 'draft' ? 'primary' : 'outline-primary'}
                onClick={() => setPostStatus('draft')}
              >
                Draft
              </Button>
              <Button
                size="sm"
                variant={postStatus === 'published' ? 'success' : 'outline-success'}
                onClick={() => setPostStatus('published')}
              >
                Published
              </Button>
              <Button
                size="sm"
                variant={postStatus === 'scheduled' ? 'info' : 'outline-info'}
                onClick={() => setPostStatus('scheduled')}
              >
                Scheduled
              </Button>
            </div>
            {postStatus === 'scheduled' && (
              <Row className="mt-2">
                <Col md={6}>
                  <Form.Label className="small">Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </Col>
                <Col md={6}>
                  <Form.Label className="small">Time</Form.Label>
                  <Form.Control
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                  />
                </Col>
              </Row>
            )}
          </Form.Group>

          <Form.Group className="mb-3 d-flex align-items-start gap-3">
            <div style={{ minWidth: 220 }}>
              <Form.Label>Banner</Form.Label>
              <div className="d-flex gap-2 mb-2">
                <Button
                  size="sm"
                  variant={
                    bannerUploadMode === "url" ? "primary" : "outline-primary"
                  }
                  onClick={() => setBannerUploadMode("url")}
                >
                  Use URL
                </Button>
                <Button
                  size="sm"
                  variant={
                    bannerUploadMode === "upload"
                      ? "primary"
                      : "outline-primary"
                  }
                  onClick={() => setBannerUploadMode("upload")}
                >
                  Upload
                </Button>
              </div>
              {bannerUploadMode === "url" ? (
                <Form.Control
                  value={bannerUrl}
                  onChange={(e) => setBannerUrl(e.target.value)}
                  placeholder="https://..."
                />
              ) : (
                <div>
                  <Form.Control
                    type="file"
                    accept="image/*"
                    onChange={handleBannerUpload}
                    disabled={bannerUploading}
                  />
                  {bannerUploading && (
                    <div className="mt-2 small text-muted">Uploading...</div>
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
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Tags</Form.Label>
            <div className="d-flex gap-2 flex-wrap mb-2">
              {selectedTags.map((t) => (
                <div
                  key={t}
                  className="badge bg-info d-inline-flex align-items-center gap-2"
                  style={{ fontSize: "0.85rem", padding: "0.35rem 0.6rem" }}
                >
                  <span>{t}</span>
                  <button
                    type="button"
                    className="btn-close btn-close-white btn-sm ms-1"
                    onClick={() => removeTag(t)}
                    aria-label={`Remove tag ${t}`}
                  ></button>
                </div>
              ))}
              {selectedTags.length === 0 && (
                <span className="text-muted small">No tags selected</span>
              )}
            </div>
            <Form.Control
              value={tagQuery}
              placeholder="Type to search or create tag"
              onChange={(e) => {
                setTagQuery(e.target.value);
                setShowTagDropdown(true);
              }}
              onKeyDown={handleTagKeyDown}
              onFocus={() => setShowTagDropdown(true)}
              aria-expanded={showTagDropdown}
              aria-haspopup="listbox"
              aria-controls="tag-dropdown-list"
            />
            {showTagDropdown && (filtered.length > 0 || tagQuery.trim()) && (
              <div className="position-relative">
                <div
                  id="tag-dropdown-list"
                  role="listbox"
                  className="position-absolute w-100 bg-body border rounded shadow-sm mt-1 p-1"
                  style={{ zIndex: 30, maxHeight: 200, overflowY: "auto" }}
                >
                  {filtered.map((t: string, i: number) => {
                    const highlighted = i === highlightedIndex;
                    return (
                      <button
                        key={t}
                        className={`dropdown-item small d-flex align-items-center ${
                          highlighted
                            ? "bg-primary text-white"
                            : "bg-transparent"
                        }`}
                        type="button"
                        role="option"
                        aria-selected={highlighted}
                        onMouseEnter={() => setHighlightedIndex(i)}
                        onMouseLeave={() => setHighlightedIndex(-1)}
                        onClick={() => addTag(t)}
                      >
                        <div style={{ flex: 1 }}>
                          {highlightMatch(t, tagQuery)}
                        </div>
                        <small className="text-muted ms-2">
                          {/* optional meta */}
                        </small>
                      </button>
                    );
                  })}
                  {tagQuery.trim() &&
                    !allTags.includes(tagQuery.trim()) &&
                    !selectedTags.includes(tagQuery.trim()) && (
                      <button
                        type="button"
                        className={`dropdown-item small d-flex align-items-center ${
                          highlightedIndex === filtered.length
                            ? "bg-primary text-white"
                            : ""
                        }`}
                        onClick={() => addTag(tagQuery.trim())}
                        role="option"
                        aria-selected={highlightedIndex === filtered.length}
                      >
                        <div style={{ flex: 1 }}>
                          Add new tag "<strong>{tagQuery.trim()}</strong>"
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
                  <div
                    key={name}
                    className="d-flex align-items-center gap-2 mb-1"
                  >
                    <div
                      style={{
                        width: 160,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {name}
                    </div>
                    <div style={{ flex: 1 }} className="progress" aria-hidden>
                      <div
                        className="progress-bar"
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
          </Form.Group>

          <div className="d-flex flex-wrap gap-2 mb-2">
            {toolbar.map((btn) => (
              <OverlayTrigger
                key={btn.label}
                placement="top"
                overlay={
                  <Tooltip>
                    {btn.label} (Ctrl+{btn.key})
                  </Tooltip>
                }
              >
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => insert(btn.snippet)}
                >
                  {btn.label}
                </Button>
              </OverlayTrigger>
            ))}
            <div className="ms-auto d-flex align-items-center gap-2">
              <Form.Label className="mb-0 small text-nowrap">
                Images ({uploadsCount}/{maxImages})
              </Form.Label>
              <Form.Control
                type="file"
                multiple
                accept="image/*"
                size="sm"
                onChange={handleUpload}
                disabled={uploading || uploadsCount >= maxImages}
                style={{ maxWidth: 220 }}
              />
              {uploading && <Spinner size="sm" animation="border" />}
            </div>
          </div>

          <Form.Group className="mb-2">
            <Form.Label>Content (Markdown)</Form.Label>
            <Form.Control
              id="cms-editor-area"
              as="textarea"
              rows={18}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write markdown here..."
            />
          </Form.Group>
          <div className="small text-muted mb-3">
            <strong>Shortcuts:</strong>{" "}
            {toolbar.map((t) => (
              <code key={t.key} className="me-2">
                Ctrl+{t.key}
              </code>
            ))}{" "}
            | Enter to add tag.
          </div>
          <div className="d-flex gap-2 mb-4">
            <Button
              disabled={!title.trim() || saving}
              onClick={saveWithValidation}
            >
              {saving ? "Saving..." : editId ? "Update Post" : postStatus === 'draft' ? "Save Draft" : postStatus === 'scheduled' ? "Schedule Post" : "Publish Post"}
            </Button>
            <Button variant="secondary" onClick={() => setPreview((p) => !p)}>
              {preview ? "Hide Preview" : "Show Preview"}
            </Button>
            <Button
              variant="outline-secondary"
              onClick={() => router.push("/admin/cms")}
            >
              Back
            </Button>
          </div>
        </Col>
        <Col lg={5} className="mt-3 mt-lg-0">
          {preview && (
            <div
              className="p-3 border rounded bg-dark-subtle"
              style={{ maxHeight: "80vh", overflowY: "auto" }}
            >
              <h5>Live Preview</h5>
              {content.trim() ? (
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw, rehypeSanitize, rehypeSlug]}
                >
                  {content}
                </ReactMarkdown>
              ) : (
                <div className="text-muted small fst-italic">
                  Start typing...
                </div>
              )}
            </div>
          )}
        </Col>
      </Row>
    </Container>
  );
}
