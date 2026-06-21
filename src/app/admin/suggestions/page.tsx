"use client";
import React, { useEffect, useState, useMemo } from "react";
import { cn } from "@/lib/utils";
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
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="text-center text-foreground">
          Admin access required.
        </div>
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto px-4 py-4">
      <div>
        <h3 className="text-xl font-bold text-foreground">Suggestions Inbox</h3>
        <p className="text-foreground/60 text-sm">
          Recent suggestions submitted by users and visitors.
        </p>
      </div>

      <div className="mt-3 grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-8">
          {loading && <div className="text-foreground/60">Loading...</div>}
          {!loading && items.length === 0 && (
            <div className="text-foreground/60">No suggestions yet.</div>
          )}

          <div className="mb-3 grid grid-cols-1 md:grid-cols-12 gap-2">
            <div className="md:col-span-6">
              <div className="flex">
                <input
                  placeholder="Search message, email, category"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setVisibleCount(chunkSize);
                  }}
                  className="flex-1 rounded-l border border-border bg-transparent px-3 py-1.5 text-sm text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setVisibleCount(chunkSize);
                  }}
                  className="px-3 py-1.5 rounded-r bg-primary-500 text-white hover:bg-primary-600 text-sm border border-l-0 border-primary-500"
                >
                  Clear
                </button>
              </div>
            </div>
            <div className="md:col-span-3">
              <select
                value={filterResponded}
                onChange={(e) => {
                  setFilterResponded(e.target.value as any);
                  setVisibleCount(chunkSize);
                }}
                className="w-full rounded border border-border bg-transparent px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">All</option>
                <option value="unresponded">Unresponded</option>
                <option value="responded">Responded</option>
              </select>
            </div>
            <div className="md:col-span-3 flex gap-2 justify-end">
              <button
                onClick={() => exportJSON()}
                className="px-3 py-1.5 rounded border border-primary-500 text-primary-500 hover:bg-primary-500/10 text-sm"
              >
                Export JSON
              </button>
            </div>
          </div>

          <div className="flex justify-between items-center mb-2">
            <div className="flex gap-2">
              <button
                onClick={() => bulkArchive(true)}
                className="px-2 py-1 text-xs rounded border border-gray-500 text-gray-500 hover:bg-gray-500/10"
              >
                Archive
              </button>
              <button
                onClick={bulkDelete}
                className="px-2 py-1 text-xs rounded border border-red-600 text-red-600 hover:bg-red-600/10"
              >
                Delete
              </button>
              <button
                onClick={() => bulkArchive(false)}
                className="px-2 py-1 text-xs rounded border border-gray-500 text-gray-500 hover:bg-gray-500/10"
              >
                Unarchive
              </button>
              <button
                onClick={clearSelection}
                className="px-2 py-1 text-xs text-primary-500 hover:underline"
              >
                Clear
              </button>
            </div>
            <div className="text-sm text-foreground/60">
              Selected: {Object.values(selectedIds).filter(Boolean).length}
            </div>
          </div>

          <div className="grid gap-3">
            {filtered.slice(0, visibleCount).map((item) => (
              <div
                key={item.id}
                className="rounded-xl border border-border bg-card dark:bg-card-dark dark:border-border-dark shadow-sm"
              >
                <div className="p-4">
                  <div className="flex items-start">
                    <div className="w-9 mr-2">
                      <input
                        type="checkbox"
                        checked={!!selectedIds[item.id]}
                        onChange={() => toggleSelect(item.id)}
                        className="rounded border-border"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="mb-1">
                        <strong className="text-foreground">
                          {item.category}
                        </strong>{" "}
                        <small className="text-foreground/60">
                          {item.createdAt
                            ? new Date(item.createdAt).toLocaleString()
                            : ""}
                        </small>
                      </div>
                      <div className="mb-2 text-foreground">{item.message}</div>
                      <div className="text-sm text-foreground/60">
                        {item.anonymous ? "Anonymous" : item.email || "—"}
                      </div>
                    </div>
                    <div className="ml-3 text-right shrink-0">
                      {item.response ? (
                        <span className="rounded-full text-xs font-medium px-2.5 py-0.5 bg-green-600 text-white mb-2 inline-block">
                          Responded
                        </span>
                      ) : (
                        <span className="rounded-full text-xs font-medium px-2.5 py-0.5 bg-gray-500 text-white mb-2 inline-block">
                          New
                        </span>
                      )}
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => openDetail(item)}
                          className="px-2 py-1 text-xs rounded bg-primary-500 text-white hover:bg-primary-600"
                        >
                          Open
                        </button>
                        <button
                          onClick={() =>
                            import("@/lib/services/suggestions").then((m) =>
                              m.archiveSuggestion(item.id, !item.archived),
                            )
                          }
                          className={cn(
                            "px-2 py-1 text-xs rounded border",
                            item.archived
                              ? "border-gray-500 text-gray-500 hover:bg-gray-500/10"
                              : "border-yellow-500 text-yellow-600 hover:bg-yellow-500/10",
                          )}
                        >
                          {item.archived ? "Unarchive" : "Archive"}
                        </button>
                        <button
                          onClick={() =>
                            import("@/lib/services/suggestions").then((m) =>
                              m.deleteSuggestion(item.id),
                            )
                          }
                          className="px-2 py-1 text-xs rounded border border-red-600 text-red-600 hover:bg-red-600/10"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {filtered.length > visibleCount && (
            <div className="text-center mt-3">
              <button
                onClick={() =>
                  setVisibleCount((c) =>
                    Math.min(filtered.length, c + chunkSize),
                  )
                }
                className="px-3 py-1.5 rounded bg-primary-500 text-white hover:bg-primary-600 text-sm"
              >
                Load more
              </button>
            </div>
          )}
        </div>

        <div className="lg:col-span-4">
          <div className="sticky top-20 rounded-xl border border-border bg-card dark:bg-card-dark dark:border-border-dark shadow-sm">
            <div className="p-4">
              <h5 className="font-semibold text-foreground">Quick Actions</h5>
              <p className="text-sm text-foreground/60">
                Use the inbox to review and respond to suggestions. Responses
                are stored in the admin doc.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {!!active && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setActive(null)}
          />
          <div className="relative bg-card dark:bg-card-dark border border-border dark:border-border-dark rounded-xl shadow-lg w-full max-w-2xl mx-4">
            <div className="flex items-center justify-between p-4 border-b border-border dark:border-border-dark">
              <h5 className="font-semibold text-foreground">Suggestion</h5>
              <button
                onClick={() => setActive(null)}
                className="text-foreground/60 hover:text-foreground text-xl leading-none"
              >
                ×
              </button>
            </div>
            <div className="p-4">
              <div className="mb-3 text-foreground">
                <strong>From:</strong>{" "}
                {active.anonymous ? "Anonymous" : active.email || "—"}
              </div>
              <div className="mb-3">
                <strong className="text-foreground">Message</strong>
                <div className="border border-border rounded p-3 mt-2 text-foreground">
                  {active.message}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Admin response
                </label>
                <textarea
                  rows={4}
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  className="w-full rounded border border-border bg-transparent px-3 py-1.5 text-sm text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t border-border dark:border-border-dark">
              <button
                onClick={() => setActive(null)}
                className="px-3 py-1.5 rounded bg-gray-500 text-white hover:bg-gray-600 text-sm"
              >
                Close
              </button>
              <button
                disabled={sending}
                onClick={submitResponse}
                className={cn(
                  "px-3 py-1.5 rounded bg-primary-500 text-white hover:bg-primary-600 text-sm",
                  sending && "opacity-50 cursor-not-allowed",
                )}
              >
                Save response
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
