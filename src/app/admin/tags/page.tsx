"use client";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import type { EffectiveMeta } from "@/types/tags";
import { useAuth } from "@/hooks/useAuth";

// Use shared EffectiveMeta type from src/types/tags

export default function AdminTagsPage() {
  const { user } = useAuth();
  const [rows, setRows] = useState<EffectiveMeta[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editPath, setEditPath] = useState<string | null>(null);
  const [editTags, setEditTags] = useState("");
  const [editMode, setEditMode] = useState<"merge" | "replace">("merge");
  const [show, setShow] = useState(false);
  const [registry, setRegistry] = useState<{ name: string; data: any }[]>([]);
  const [regName, setRegName] = useState("");
  const [regDesc, setRegDesc] = useState("");
  const [regColor, setRegColor] = useState("");

  async function authHeader() {
    if (!user) return {} as any;
    try {
      const token = await (user as any).getIdToken();
      return { Authorization: `Bearer ${token}` };
    } catch {
      return {};
    }
  }

  async function fetchAll() {
    setLoading(true);
    setError(null);
    try {
      // Batch fetch all effective metas
      const eff = await fetch("/api/tags/effective");
      if (!eff.ok) throw new Error(await eff.text());
      const metas: EffectiveMeta[] = await eff.json();
      setRows(metas.sort((a, b) => (a.path || "").localeCompare(b.path || "")));
      const reg = await fetch("/api/tags/registry");
      if (reg.ok) setRegistry(await reg.json());
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  }
  useEffect(() => {
    fetchAll();
  }, []);

  function openEdit(r: EffectiveMeta) {
    setEditPath(r.path);
    setEditMode(r.override?.mode || "merge");
    setEditTags(r.override?.tags?.join(", ") || r.staticTags?.join(", ") || "");
    setShow(true);
  }

  async function handleSave() {
    if (!editPath) return;
    const tags = editTags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    const headers: any = {
      "Content-Type": "application/json",
      ...(await authHeader()),
    };
    const res = await fetch("/api/tags/route", {
      method: "PUT",
      headers,
      body: JSON.stringify({ path: editPath, tags, mode: editMode }),
    });
    if (res.ok) {
      setShow(false);
      fetchAll();
    }
  }
  async function handleDeleteOverride(path: string) {
    const headers: any = await authHeader();
    await fetch(`/api/tags/route?path=${encodeURIComponent(path)}`, {
      method: "DELETE",
      headers,
    });
    fetchAll();
  }
  async function handleRegistryUpsert() {
    if (!regName) return;
    const headers: any = {
      "Content-Type": "application/json",
      ...(await authHeader()),
    };
    await fetch("/api/tags/registry", {
      method: "PUT",
      headers,
      body: JSON.stringify({
        name: regName,
        description: regDesc,
        color: regColor,
      }),
    });
    setRegName("");
    setRegDesc("");
    setRegColor("");
    fetchAll();
  }
  async function handleRegistryDelete(name: string) {
    const headers: any = await authHeader();
    await fetch(`/api/tags/registry?name=${encodeURIComponent(name)}`, {
      method: "DELETE",
      headers,
    });
    fetchAll();
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-3">
      <h2 className="text-2xl font-bold text-foreground">Tag Management</h2>
      <p className="text-foreground/60 text-sm">
        Early admin interface. Future: dynamic route discovery, registry,
        validation.
      </p>
      {error && (
        <div className="rounded border border-red-400/30 bg-red-50 dark:bg-red-900/30 p-3 mb-2 text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      )}
      <button
        onClick={fetchAll}
        disabled={loading}
        className={cn(
          "px-2 py-1 text-xs rounded bg-primary-500 text-white hover:bg-primary-600",
          loading && "opacity-50 cursor-not-allowed",
        )}
      >
        {loading ? "Refreshing..." : "Refresh"}
      </button>

      <div className="overflow-x-auto mt-3">
        <table className="w-full text-sm text-foreground border-collapse">
          <thead>
            <tr className="border-b border-border">
              <th className="px-2 py-1.5 text-left font-semibold">Path</th>
              <th className="px-2 py-1.5 text-left font-semibold">
                Static Tags
              </th>
              <th className="px-2 py-1.5 text-left font-semibold">
                Override Tags
              </th>
              <th className="px-2 py-1.5 text-left font-semibold">Mode</th>
              <th className="px-2 py-1.5 text-left font-semibold">Effective</th>
              <th className="px-2 py-1.5"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr
                key={r.path}
                className="border-b border-border even:bg-foreground/5 hover:bg-foreground/10"
              >
                <td className="px-2 py-1.5">{r.path}</td>
                <td className="px-2 py-1.5">
                  {r.staticTags?.map((t) => (
                    <span
                      key={t}
                      className="rounded-full text-xs font-medium px-2.5 py-0.5 bg-gray-500 text-white mr-1"
                    >
                      {t}
                    </span>
                  ))}
                </td>
                <td className="px-2 py-1.5">
                  {r.override?.tags?.map((t: string) => (
                    <span
                      key={t}
                      className="rounded-full text-xs font-medium px-2.5 py-0.5 bg-yellow-500 text-black mr-1"
                    >
                      {t}
                    </span>
                  ))}
                </td>
                <td className="px-2 py-1.5">{r.override?.mode || "merge"}</td>
                <td className="px-2 py-1.5">
                  {r.effective.map((t) => (
                    <span
                      key={t}
                      className="rounded-full text-xs font-medium px-2.5 py-0.5 bg-gray-800 text-white mr-1"
                    >
                      {t}
                    </span>
                  ))}
                </td>
                <td className="px-2 py-1.5">
                  <div className="flex">
                    <button
                      onClick={() => openEdit(r)}
                      className="px-2 py-1 text-xs rounded-l bg-primary-500 text-white hover:bg-primary-600"
                    >
                      Edit
                    </button>
                    {r.override && (
                      <button
                        onClick={() => handleDeleteOverride(r.path)}
                        className="px-2 py-1 text-xs rounded-r border border-red-600 text-red-600 hover:bg-red-600/10"
                      >
                        Del Override
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h4 className="mt-4 text-lg font-semibold text-foreground">
        Tag Registry
      </h4>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-foreground border-collapse">
          <thead>
            <tr className="border-b border-border">
              <th className="px-2 py-1.5 text-left font-semibold">Name</th>
              <th className="px-2 py-1.5 text-left font-semibold">
                Description
              </th>
              <th className="px-2 py-1.5 text-left font-semibold">Color</th>
              <th className="px-2 py-1.5"></th>
            </tr>
          </thead>
          <tbody>
            {registry.map((r) => (
              <tr
                key={r.name}
                className="border-b border-border even:bg-foreground/5 hover:bg-foreground/10"
              >
                <td className="px-2 py-1.5">
                  <span
                    className="rounded-full text-xs font-medium px-2.5 py-0.5 text-white"
                    style={{ background: r.data.color || "#666" }}
                  >
                    {r.name}
                  </span>
                </td>
                <td className="px-2 py-1.5">{r.data.description || ""}</td>
                <td className="px-2 py-1.5">{r.data.color || ""}</td>
                <td className="px-2 py-1.5">
                  <button
                    onClick={() => handleRegistryDelete(r.name)}
                    className="px-2 py-1 text-xs rounded border border-red-600 text-red-600 hover:bg-red-600/10"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            <tr className="border-b border-border">
              <td className="px-2 py-1.5">
                <input
                  placeholder="Name"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="w-full rounded border border-border bg-transparent px-2 py-1 text-xs text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </td>
              <td className="px-2 py-1.5">
                <input
                  placeholder="Description"
                  value={regDesc}
                  onChange={(e) => setRegDesc(e.target.value)}
                  className="w-full rounded border border-border bg-transparent px-2 py-1 text-xs text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </td>
              <td className="px-2 py-1.5">
                <input
                  placeholder="#color"
                  value={regColor}
                  onChange={(e) => setRegColor(e.target.value)}
                  className="w-full rounded border border-border bg-transparent px-2 py-1 text-xs text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </td>
              <td className="px-2 py-1.5">
                <button
                  onClick={handleRegistryUpsert}
                  className="px-2 py-1 text-xs rounded bg-primary-500 text-white hover:bg-primary-600"
                >
                  Save
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShow(false)}
          />
          <div className="relative bg-card dark:bg-card-dark border border-border dark:border-border-dark rounded-xl shadow-lg w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-4 border-b border-border dark:border-border-dark">
              <h5 className="font-semibold text-foreground">Edit Tags</h5>
              <button
                onClick={() => setShow(false)}
                className="text-foreground/60 hover:text-foreground text-xl leading-none"
              >
                ×
              </button>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Path
                </label>
                <input
                  value={editPath || ""}
                  disabled
                  className="w-full rounded border border-border bg-foreground/5 px-3 py-1.5 text-sm text-foreground/60 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Tags (comma separated)
                </label>
                <input
                  value={editTags}
                  onChange={(e) => setEditTags(e.target.value)}
                  placeholder="PhasmoTourney4, Bracket"
                  className="w-full rounded border border-border bg-transparent px-3 py-1.5 text-sm text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Mode
                </label>
                <select
                  value={editMode}
                  onChange={(e) => setEditMode(e.target.value as any)}
                  className="w-full rounded border border-border bg-transparent px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="merge">Merge (static + override)</option>
                  <option value="replace">Replace (override only)</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t border-border dark:border-border-dark">
              <button
                onClick={() => setShow(false)}
                className="px-3 py-1.5 rounded bg-gray-500 text-white hover:bg-gray-600 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-3 py-1.5 rounded bg-primary-500 text-white hover:bg-primary-600 text-sm"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
