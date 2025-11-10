"use client";
import {
  Modal,
  Form,
  Button,
  ListGroup,
  Badge,
  InputGroup,
} from "react-bootstrap";
import { useState, useEffect, useCallback, useRef } from "react";
import InlineLink from "@/components/ui/InlineLink";
import {
  FaSearch,
  FaTimes,
  FaArrowUp,
  FaArrowDown,
  FaExternalLinkAlt,
} from "react-icons/fa";
import { useRouter } from "next/navigation";

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

  // Fetch data when opened
  useEffect(() => {
    if (show) {
      (async () => {
        const [effRes, regRes] = await Promise.all([
          fetch("/api/tags/effective"),
          fetch("/api/tags/registry"),
        ]);
        if (effRes.ok) {
          setData(await effRes.json());
        }
        if (regRes.ok) {
          setRegistry(await regRes.json());
        }
        // focus input after short delay to ensure modal mount
        setTimeout(() => inputRef.current?.focus(), 50);
      })();
    } else {
      setQ("");
      setActiveIdx(0);
    }
  }, [show]);

  const tagColor = useCallback(
    (tag: string) => registry.find((r) => r.name === tag)?.data.color,
    [registry]
  );

  const safeHref = useCallback(
    (p: string) =>
      p.replace(/\[(.+?)\]/g, (_, name) =>
        name.toLowerCase() === "id" ? "example-id" : "sample"
      ),
    []
  );

  const trimmed = q.trim();
  const normalized = trimmed.toLowerCase();
  const hasQuery = trimmed.length > 0;
  const results = normalized
    ? data
        .map((d) => {
          // naive score: title match weight > path > tag
          const title = (d.title || "").toLowerCase();
          let score = 0;
          if (title.includes(normalized)) score += 5;
          if (d.path.toLowerCase().includes(normalized)) score += 3;
          if (d.effective.some((t) => t.toLowerCase().includes(normalized)))
            score += 1;
          return { ...d, score };
        })
        .filter((d) => d.score > 0)
        .sort(
          (a, b) =>
            b.score - a.score ||
            (a.title || a.path).localeCompare(b.title || b.path)
        )
    : [];

  // Suggestions when no query: top events & tools
  const suggestions = !normalized
    ? data
        .filter((d) => d.effective.includes("Event"))
        .slice(0, 5)
        .concat(data.filter((d) => d.effective.includes("Tool")).slice(0, 5))
    : [];

  useEffect(() => {
    setActiveIdx(0);
  }, [q]);

  // Keyboard navigation
  const handleKey = (e: React.KeyboardEvent) => {
    if (!show) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const max = (normalized ? results : suggestions).length;
      if (max) setActiveIdx((i) => (i + 1) % max);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const max = (normalized ? results : suggestions).length;
      if (max) setActiveIdx((i) => (i - 1 + max) % max);
    } else if (e.key === "Enter") {
      const list = normalized ? results : suggestions;
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
    if (!normalized) return text;
    const idx = text.toLowerCase().indexOf(normalized);
    if (idx === -1) return text;
    return (
      <>
        {text.slice(0, idx)}
        <mark
          className="px-0 py-0 bg-warning-subtle"
          style={{ backgroundColor: "rgba(255,215,0,0.4)" }}
        >
          {text.slice(idx, idx + normalized.length)}
        </mark>
        {text.slice(idx + normalized.length)}
      </>
    );
  }

  return (
    <Modal show={show} onHide={onHide} size="lg" centered onKeyDown={handleKey}>
      <Modal.Header className="border-0 pb-0">
        <div className="w-100">
          <Form onSubmit={(e) => e.preventDefault()}>
            <InputGroup>
              <InputGroup.Text className="bg-transparent border-secondary-subtle">
                <FaSearch />
              </InputGroup.Text>
              <Form.Control
                ref={inputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search pages, paths, or tags..."
                aria-label="Search"
              />
              {hasQuery && (
                <InputGroup.Text className="bg-transparent border-0">
                  <button
                    type="button"
                    className="btn-close"
                    aria-label="Clear search"
                    onClick={() => setQ("")}
                  />
                </InputGroup.Text>
              )}
            </InputGroup>
          </Form>
          <div className="d-flex justify-content-between align-items-center mt-2 small text-muted px-1">
            <span>
              {normalized
                ? `${results.length} result${results.length === 1 ? "" : "s"}`
                : "Suggestions"}
            </span>
            <span className="d-flex align-items-center gap-2">
              <span className="d-none d-md-inline">
                <FaArrowUp />/<FaArrowDown /> navigate
              </span>
              <kbd className="border rounded px-1">Enter</kbd> open
              <kbd className="border rounded px-1">Esc</kbd> close
            </span>
          </div>
        </div>
      </Modal.Header>
      <Modal.Body
        className="pt-3"
        style={{ maxHeight: "60vh", overflowY: "auto" }}
        ref={listRef}
      >
        <ListGroup variant="flush">
          {(normalized ? results : suggestions).map((r, idx) => {
            const href = safeHref(r.path);
            const isActive = idx === activeIdx;
            return (
              <ListGroup.Item
                key={r.path}
                action
                as={InlineLink}
                href={href}
                onClick={onHide}
                className={`d-flex justify-content-between align-items-start rounded ${
                  isActive ? "bg-primary text-white" : ""
                }`}
                style={{ textDecoration: "none" }}
              >
                <div className="me-3">
                  <div className="fw-semibold small">
                    {highlight(r.title || r.path)}
                  </div>
                  <div
                    className={`small ${
                      isActive ? "text-white-50" : "text-muted"
                    }`}
                  >
                    {r.path}
                  </div>
                </div>
                <div
                  className="d-flex flex-wrap justify-content-end"
                  style={{ maxWidth: "40%" }}
                >
                  {r.effective.slice(0, 3).map((t) => (
                    <Badge
                      key={t}
                      className={`ms-1 mb-1 ${
                        isActive ? "border border-light" : ""
                      }`}
                      style={{
                        background: isActive
                          ? "rgba(255,255,255,0.25)"
                          : tagColor(t) || "#6c757d",
                      }}
                    >
                      {t}
                    </Badge>
                  ))}
                </div>
              </ListGroup.Item>
            );
          })}
          {!(normalized ? results : suggestions).length && (
            <ListGroup.Item disabled className="text-center py-4 text-muted">
              {normalized ? "No matches" : "No suggestions available"}
            </ListGroup.Item>
          )}
        </ListGroup>
      </Modal.Body>
      <Modal.Footer className="border-0 pt-0 small text-muted d-flex justify-content-between">
        <span className="d-flex align-items-center gap-1">
          <FaExternalLinkAlt /> Dynamic route links use placeholder ids.
        </span>
        <Button
          variant="outline-secondary"
          size="sm"
          onClick={onHide}
          className="px-3 d-flex align-items-center gap-1"
          style={{ borderRadius: "999px" }}
        >
          <FaTimes /> Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
