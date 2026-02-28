"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import {
  addVideoLink,
  listVideoLinks,
  deleteVideoLink,
} from "@/lib/services/phasmoTourney5";

interface VideoLink {
  id: string;
  title: string;
  url: string;
  platform: "youtube" | "twitch";
  roundId?: string;
  notes?: string;
  officer: string;
  createdAt: number;
}

export default function ManageContentLinksPage() {
  const { admin, user } = useAuth();
  const [links, setLinks] = useState<VideoLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: "",
    url: "",
    platform: "youtube" as "youtube" | "twitch",
    roundId: "",
    notes: "",
  });

  useEffect(() => {
    if (!admin) return;
    loadLinks();
  }, [admin]);

  async function loadLinks() {
    try {
      const data = await listVideoLinks();
      setLinks(data);
    } catch (e: any) {
      setError(e?.message || "Failed to load links");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!form.title.trim() || !form.url.trim()) {
      setError("Title and URL are required");
      return;
    }

    setSubmitting(true);
    try {
      const officer = user?.displayName || user?.email || "Unknown";
      await addVideoLink({
        officer,
        title: form.title.trim(),
        url: form.url.trim(),
        platform: form.platform,
        roundId: form.roundId.trim() || undefined,
        notes: form.notes.trim() || undefined,
      });
      setSuccess("Video link added successfully");
      setForm({
        title: "",
        url: "",
        platform: "youtube",
        roundId: "",
        notes: "",
      });
      await loadLinks();
    } catch (e: any) {
      setError(e?.message || "Failed to add video link");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(linkId: string) {
    if (!confirm("Delete this video link?")) return;
    try {
      await deleteVideoLink(linkId);
      setSuccess("Video link deleted");
      await loadLinks();
    } catch (e: any) {
      setError(e?.message || "Failed to delete link");
    }
  }

  if (!admin) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <h1 className="text-lg font-semibold mb-3">Manage Content Links</h1>
        <div className="rounded-xl border border-yellow-300 bg-yellow-50 text-yellow-800 dark:border-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300 px-4 py-3">
          Admin access required.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-lg font-semibold mb-3">
        Manage Video &amp; Stream Links
      </h1>

      {error && (
        <div className="mb-3 flex items-start justify-between rounded-xl border border-red-300 bg-red-50 text-red-800 dark:border-red-700 dark:bg-red-900/30 dark:text-red-300 px-4 py-3">
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            className="ml-4 font-bold hover:opacity-70"
          >
            ×
          </button>
        </div>
      )}
      {success && (
        <div className="mb-3 flex items-start justify-between rounded-xl border border-green-300 bg-green-50 text-green-800 dark:border-green-700 dark:bg-green-900/30 dark:text-green-300 px-4 py-3">
          <span>{success}</span>
          <button
            onClick={() => setSuccess(null)}
            className="ml-4 font-bold hover:opacity-70"
          >
            ×
          </button>
        </div>
      )}

      <div className="rounded-xl border border-border bg-card dark:bg-card-dark dark:border-border-dark shadow-sm mb-4">
        <div className="p-4">
          <h2 className="text-base font-semibold mb-3">Add New Video Link</h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Title *
                </label>
                <input
                  className="w-full rounded-lg border border-border bg-card dark:bg-card-dark dark:border-border-dark px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g., Round 1 Highlights"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Platform *
                </label>
                <select
                  className="w-full rounded-lg border border-border bg-card dark:bg-card-dark dark:border-border-dark px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.platform}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      platform: e.target.value as "youtube" | "twitch",
                    })
                  }
                >
                  <option value="youtube">YouTube</option>
                  <option value="twitch">Twitch</option>
                </select>
              </div>
              <div
                className="md:col-span-1 lg:col-span-1"
                style={{ gridColumn: "span 1" }}
              >
                <label className="block text-sm font-medium text-foreground mb-1">
                  URL *
                </label>
                <input
                  className="w-full rounded-lg border border-border bg-card dark:bg-card-dark dark:border-border-dark px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.url}
                  onChange={(e) => setForm({ ...form, url: e.target.value })}
                  placeholder="https://www.youtube.com/watch?v=... or https://www.twitch.tv/videos/..."
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  For YouTube: Full video URL. For Twitch: Video URL (VOD).
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Round ID (Optional)
                </label>
                <input
                  className="w-full rounded-lg border border-border bg-card dark:bg-card-dark dark:border-border-dark px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.roundId}
                  onChange={(e) =>
                    setForm({ ...form, roundId: e.target.value })
                  }
                  placeholder="e.g., round1"
                />
              </div>
              <div className="col-span-full">
                <label className="block text-sm font-medium text-foreground mb-1">
                  Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  className="w-full rounded-lg border border-border bg-card dark:bg-card-dark dark:border-border-dark px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Any additional notes..."
                />
              </div>
            </div>
            <div className="flex items-center gap-2 mt-3">
              <button
                type="submit"
                disabled={submitting}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? "Adding..." : "Add Link"}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card dark:bg-card-dark dark:border-border-dark shadow-sm">
        <div className="p-4">
          <h2 className="text-base font-semibold mb-3">
            Existing Links ({links.length})
          </h2>
          {loading ? (
            <div className="rounded-xl border border-blue-300 bg-blue-50 text-blue-800 dark:border-blue-700 dark:bg-blue-900/30 dark:text-blue-300 px-4 py-3">
              Loading...
            </div>
          ) : links.length === 0 ? (
            <div className="rounded-xl border border-blue-300 bg-blue-50 text-blue-800 dark:border-blue-700 dark:bg-blue-900/30 dark:text-blue-300 px-4 py-3">
              No video links yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border dark:border-border-dark">
                    <th className="text-left py-2 px-3 font-medium">Title</th>
                    <th className="text-left py-2 px-3 font-medium">
                      Platform
                    </th>
                    <th className="text-left py-2 px-3 font-medium">Round</th>
                    <th className="text-left py-2 px-3 font-medium">URL</th>
                    <th className="text-left py-2 px-3 font-medium">
                      Added By
                    </th>
                    <th className="text-left py-2 px-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {links.map((link) => (
                    <tr
                      key={link.id}
                      className="border-b border-border/50 dark:border-border-dark/50 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    >
                      <td className="py-2 px-3">{link.title}</td>
                      <td className="py-2 px-3 capitalize">{link.platform}</td>
                      <td className="py-2 px-3">{link.roundId || "—"}</td>
                      <td className="py-2 px-3">
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline"
                        >
                          View
                        </a>
                      </td>
                      <td className="py-2 px-3 text-gray-500 text-xs">
                        {link.officer}
                      </td>
                      <td className="py-2 px-3">
                        <button
                          onClick={() => handleDelete(link.id)}
                          className="rounded-lg border border-red-600 px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
