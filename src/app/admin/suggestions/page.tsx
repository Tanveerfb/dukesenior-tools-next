"use client";
import React, { useEffect, useState, useMemo } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Modal,
  Form,
  Badge,
  InputGroup,
  FormControl,
} from "react-bootstrap";
import { useAuth } from "@/hooks/useAuth";
import { addAdminResponseToForm } from "@/lib/services/suggestions";
import { auth } from "@/lib/firebase/client";
import { db } from "@/lib/firebase/client";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";

export const dynamic = "force-dynamic";

export default function AdminSuggestionsPage() {
  const { admin, user } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<any | null>(null);
  const [response, setResponse] = useState("");
  const [sending, setSending] = useState(false);
  // UI state
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterResponded, setFilterResponded] = useState<
    "all" | "responded" | "unresponded"
  >("all");
  const [chunkSize] = useState(25);
  const [visibleCount, setVisibleCount] = useState(25);
  const [selectedIds, setSelectedIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!admin) return;
    setLoading(true);
    // Listen to admin/support/suggestions collection in realtime
    const colRef = collection(db, "admin", "support", "suggestions");
    const qRef = query(colRef as any, orderBy("createdAt", "desc"));
    const unsub = onSnapshot(
      qRef,
      (snap: any) => {
        const out: any[] = [];
        snap.forEach((d: any) => out.push(d.data()));
        setItems(out);
        setLoading(false);
      },
      (err: any) => {
        console.error("suggestions realtime error", err);
        setLoading(false);
      },
    );
    return () => unsub();
  }, [admin]);

  // Derived lists after filtering
  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return items.filter((it) => {
      if (
        filterCategory &&
        String(it.category || "").toLowerCase() !== filterCategory.toLowerCase()
      )
        return false;
      if (filterResponded === "responded" && !it.response) return false;
      if (filterResponded === "unresponded" && it.response) return false;
      if (!q) return true;
      return (
        String(it.message || "") +
        " " +
        String(it.email || "") +
        " " +
        String(it.category || "")
      )
        .toLowerCase()
        .includes(q);
    });
  }, [items, searchQuery, filterCategory, filterResponded]);

  async function exportJSON() {
    try {
      const user = auth.currentUser;
      if (!user) return alert("Please sign in as admin to export.");
      const token = await user.getIdToken();
      const url = new URL(
        "/api/admin/suggestions/export",
        window.location.origin,
      );
      if (filterCategory) url.searchParams.set("category", filterCategory);
      if (filterResponded) url.searchParams.set("responded", filterResponded);
      url.searchParams.set("archived", String(""));
      // if archived filter set to specific, forward it
      if (filterResponded) url.searchParams.set("responded", filterResponded);
      const resp = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!resp.ok) {
        const j = await resp.json().catch(() => ({}));
        return alert("Export failed: " + (j?.error || resp.status));
      }
      const j = await resp.json();
      const blob = new Blob([JSON.stringify(j.results || [], null, 2)], {
        type: "application/json",
      });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `suggestions_export_${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch (err) {
      console.error(err);
      alert("Export failed");
    }
  }

  function toggleSelect(id: string) {
    setSelectedIds((s) => ({ ...s, [id]: !s[id] }));
  }

  function clearSelection() {
    setSelectedIds({});
  }

  async function bulkArchive(archived = true) {
    const ids = Object.keys(selectedIds).filter((k) => selectedIds[k]);
    if (ids.length === 0) return;
    try {
      await Promise.all(
        ids.map((id) =>
          import("@/lib/services/suggestions").then((m) =>
            m.archiveSuggestion(id, archived),
          ),
        ),
      );
      clearSelection();
    } catch (err) {
      console.error(err);
    }
  }

  async function bulkDelete() {
    const ids = Object.keys(selectedIds).filter((k) => selectedIds[k]);
    if (ids.length === 0) return;
    try {
      await Promise.all(
        ids.map((id) =>
          import("@/lib/services/suggestions").then((m) =>
            m.deleteSuggestion(id),
          ),
        ),
      );
      clearSelection();
    } catch (err) {
      console.error(err);
    }
  }

  async function openDetail(item: any) {
    setActive(item);
    setResponse(item.response || "");
  }

  async function submitResponse() {
    if (!active) return;
    setSending(true);
    try {
      const responderUid = user?.uid;
      await addAdminResponseToForm(active.id, response.trim(), responderUid);
      // update local state
      setItems(
        items.map((i) =>
          i.id === active.id ? { ...i, response: response.trim() } : i,
        ),
      );
      setActive({ ...active, response: response.trim() });
    } catch (err) {
      console.error(err);
    }
    setSending(false);
  }

  if (!admin)
    return (
      <Container className="py-5">
        <div className="text-center">Admin access required.</div>
      </Container>
    );

  return (
    <Container className="py-4">
      <Row>
        <Col>
          <h3>Suggestions Inbox</h3>
          <p className="text-muted">
            Recent suggestions submitted by users and visitors.
          </p>
        </Col>
      </Row>

      <Row className="mt-3">
        <Col lg={8}>
          {loading && <div className="text-muted">Loading...</div>}
          {!loading && items.length === 0 && (
            <div className="text-muted">No suggestions yet.</div>
          )}

          <Row className="mb-3 g-2">
            <Col md={6}>
              <InputGroup>
                <FormControl
                  placeholder="Search message, email, category"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setVisibleCount(chunkSize);
                  }}
                />
                <Button
                  onClick={() => {
                    setSearchQuery("");
                    setVisibleCount(chunkSize);
                  }}
                >
                  Clear
                </Button>
              </InputGroup>
            </Col>
            <Col md={3}>
              <Form.Select
                value={filterResponded}
                onChange={(e) => {
                  setFilterResponded(e.target.value as any);
                  setVisibleCount(chunkSize);
                }}
              >
                <option value="all">All</option>
                <option value="unresponded">Unresponded</option>
                <option value="responded">Responded</option>
              </Form.Select>
            </Col>
            <Col md={3} className="d-flex gap-2 justify-content-end">
              <Button onClick={() => exportJSON()} variant="outline-primary">
                Export JSON
              </Button>
            </Col>
          </Row>

          <div className="d-flex justify-content-between align-items-center mb-2">
            <div className="d-flex gap-2">
              <Button
                size="sm"
                variant="outline-secondary"
                onClick={() => bulkArchive(true)}
              >
                Archive
              </Button>
              <Button size="sm" variant="outline-danger" onClick={bulkDelete}>
                Delete
              </Button>
              <Button
                size="sm"
                variant="outline-secondary"
                onClick={() => bulkArchive(false)}
              >
                Unarchive
              </Button>
              <Button size="sm" variant="link" onClick={clearSelection}>
                Clear
              </Button>
            </div>
            <div className="small text-muted">
              Selected: {Object.values(selectedIds).filter(Boolean).length}
            </div>
          </div>

          <div className="d-grid gap-3">
            {filtered.slice(0, visibleCount).map((item) => (
              <Card key={item.id} className="shadow-sm">
                <Card.Body>
                  <div className="d-flex align-items-start">
                    <div style={{ width: 36 }} className="me-2">
                      <input
                        type="checkbox"
                        checked={!!selectedIds[item.id]}
                        onChange={() => toggleSelect(item.id)}
                      />
                    </div>
                    <div className="flex-grow-1">
                      <div className="mb-1">
                        <strong>{item.category}</strong>{" "}
                        <small className="text-muted">
                          {item.createdAt
                            ? new Date(item.createdAt).toLocaleString()
                            : ""}
                        </small>
                      </div>
                      <div className="mb-2">{item.message}</div>
                      <div className="small text-muted">
                        {item.anonymous ? "Anonymous" : item.email || "—"}
                      </div>
                    </div>
                    <div className="ms-3 text-end">
                      {item.response ? (
                        <Badge bg="success" className="mb-2">
                          Responded
                        </Badge>
                      ) : (
                        <Badge bg="secondary" className="mb-2">
                          New
                        </Badge>
                      )}
                      <div className="d-flex gap-2">
                        <Button size="sm" onClick={() => openDetail(item)}>
                          Open
                        </Button>
                        <Button
                          size="sm"
                          variant={
                            item.archived
                              ? "outline-secondary"
                              : "outline-warning"
                          }
                          onClick={() =>
                            import("@/lib/services/suggestions").then((m) =>
                              m.archiveSuggestion(item.id, !item.archived),
                            )
                          }
                        >
                          {item.archived ? "Unarchive" : "Archive"}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline-danger"
                          onClick={() =>
                            import("@/lib/services/suggestions").then((m) =>
                              m.deleteSuggestion(item.id),
                            )
                          }
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            ))}
          </div>
          {filtered.length > visibleCount && (
            <div className="text-center mt-3">
              <Button
                onClick={() =>
                  setVisibleCount((c) =>
                    Math.min(filtered.length, c + chunkSize),
                  )
                }
              >
                Load more
              </Button>
            </div>
          )}
        </Col>

        <Col lg={4}>
          <Card className="sticky-top" style={{ top: "80px" }}>
            <Card.Body>
              <h5>Quick Actions</h5>
              <p className="small text-muted">
                Use the inbox to review and respond to suggestions. Responses
                are stored in the admin doc.
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Modal show={!!active} onHide={() => setActive(null)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Suggestion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {active && (
            <>
              <div className="mb-3">
                <strong>From:</strong>{" "}
                {active.anonymous ? "Anonymous" : active.email || "—"}
              </div>
              <div className="mb-3">
                <strong>Message</strong>
                <div className="border rounded p-3 mt-2">{active.message}</div>
              </div>
              <Form.Group>
                <Form.Label>Admin response</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                />
              </Form.Group>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setActive(null)}>
            Close
          </Button>
          <Button disabled={sending} onClick={submitResponse}>
            Save response
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}
