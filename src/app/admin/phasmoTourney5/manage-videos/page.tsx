"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { FaYoutube, FaTwitch, FaExternalLinkAlt } from "react-icons/fa";
import {
  addVideoLink,
  listVideoLinks,
  deleteVideoLink,
} from "@/lib/services/phasmoTourney5";
import { formatRoundLabel } from "@/lib/utils";

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

export default function ManageVideosPage() {
  const { admin, user } = useAuth();
  const [videos, setVideos] = useState<VideoLink[]>([]);
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
    loadVideos();
  }, [admin]);

  async function loadVideos() {
    try {
      const data = await listVideoLinks();
      setVideos(data);
    } catch (e: any) {
      setError(e?.message || "Failed to load videos");
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
      setSuccess("Video added successfully! View it on the Videos page.");
      setForm({
        title: "",
        url: "",
        platform: "youtube",
        roundId: "",
        notes: "",
      });
      await loadVideos();
    } catch (e: any) {
      setError(e?.message || "Failed to add video");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(videoId: string) {
    if (!confirm("Delete this video? This action cannot be undone.")) return;
    try {
      await deleteVideoLink(videoId);
      setSuccess("Video deleted successfully");
      await loadVideos();
    } catch (e: any) {
      setError(e?.message || "Failed to delete video");
    }
  }

  if (!admin) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <h1 className="text-lg font-semibold mb-3">Manage Videos</h1>
        <div className="rounded-xl border border-yellow-300 bg-yellow-50 text-yellow-800 dark:border-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300 px-4 py-3">
          Admin access required.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-3">
        <h1 className="text-lg font-semibold">Manage Tourney 5 Videos</h1>
        <a
          href="/phasmotourney-series/phasmoTourney5/videos"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 rounded-lg border border-blue-600 px-2.5 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
        >
          <FaExternalLinkAlt />
          View Videos Page
        </a>
      </div>

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
          <h2 className="text-base font-semibold mb-3">Add New Video</h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              <div className="md:col-span-8">
                <label className="block text-sm font-medium text-foreground mb-1">
                  Video Title <span className="text-red-500">*</span>
                </label>
                <input
                  className="w-full rounded-lg border border-border bg-card dark:bg-card-dark dark:border-border-dark px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g., Round 1 Highlights - Player Name"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Use descriptive titles for easy identification
                </p>
              </div>
              <div className="md:col-span-4">
                <label className="block text-sm font-medium text-foreground mb-1">
                  Platform <span className="text-red-500">*</span>
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
              <div className="md:col-span-8">
                <label className="block text-sm font-medium text-foreground mb-1">
                  Video URL <span className="text-red-500">*</span>
                </label>
                <input
                  className="w-full rounded-lg border border-border bg-card dark:bg-card-dark dark:border-border-dark px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.url}
                  onChange={(e) => setForm({ ...form, url: e.target.value })}
                  placeholder="https://www.youtube.com/watch?v=... or https://www.twitch.tv/videos/..."
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  {form.platform === "youtube"
                    ? "Full YouTube video URL or short link"
                    : "Twitch VOD URL (video archive link)"}
                </p>
              </div>
              <div className="md:col-span-4">
                <label className="block text-sm font-medium text-foreground mb-1">
                  Round (Optional)
                </label>
                <select
                  className="w-full rounded-lg border border-border bg-card dark:bg-card-dark dark:border-border-dark px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.roundId}
                  onChange={(e) =>
                    setForm({ ...form, roundId: e.target.value })
                  }
                >
                  <option value="">General</option>
                  <option value="round1">Round 1</option>
                  <option value="round2">Round 2</option>
                  <option value="round3">Round 3</option>
                  <option value="round4">Round 4</option>
                  <option value="round5">Round 5</option>
                  <option value="round6">Round 6</option>
                  <option value="round7">Round 7</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Leave as General for non-round-specific videos
                </p>
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
                  placeholder="Add any additional context, player names, or highlights..."
                />
              </div>
            </div>
            <div className="flex items-center gap-2 mt-3">
              <button
                type="submit"
                disabled={submitting}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? "Adding..." : "Add Video"}
              </button>
              {form.title && (
                <button
                  type="button"
                  onClick={() =>
                    setForm({
                      title: "",
                      url: "",
                      platform: "youtube",
                      roundId: "",
                      notes: "",
                    })
                  }
                  className="rounded-lg border border-gray-400 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card dark:bg-card-dark dark:border-border-dark shadow-sm">
        <div className="p-4">
          <h2 className="text-base font-semibold mb-3">
            Existing Videos ({videos.length})
          </h2>
          {loading ? (
            <div className="rounded-xl border border-blue-300 bg-blue-50 text-blue-800 dark:border-blue-700 dark:bg-blue-900/30 dark:text-blue-300 px-4 py-3">
              Loading videos...
            </div>
          ) : videos.length === 0 ? (
            <div className="rounded-xl border border-blue-300 bg-blue-50 text-blue-800 dark:border-blue-700 dark:bg-blue-900/30 dark:text-blue-300 px-4 py-3">
              No videos added yet. Add your first video above!
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
                    <th className="text-left py-2 px-3 font-medium">
                      Added By
                    </th>
                    <th className="text-left py-2 px-3 font-medium">Date</th>
                    <th className="text-left py-2 px-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {videos.map((video) => (
                    <tr
                      key={video.id}
                      className="border-b border-border/50 dark:border-border-dark/50 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    >
                      <td className="py-2 px-3">
                        <div className="flex items-center gap-2">
                          {video.platform === "youtube" ? (
                            <FaYoutube color="#FF0000" />
                          ) : (
                            <FaTwitch color="#9147FF" />
                          )}
                          <span>{video.title}</span>
                        </div>
                      </td>
                      <td className="py-2 px-3">
                        <span
                          className={cn(
                            "inline-flex rounded-full text-xs font-medium px-2.5 py-0.5 capitalize",
                            video.platform === "youtube"
                              ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                              : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
                          )}
                        >
                          {video.platform}
                        </span>
                      </td>
                      <td className="py-2 px-3">
                        {formatRoundLabel(video.roundId)}
                      </td>
                      <td className="py-2 px-3 text-gray-500 text-xs">
                        {video.officer}
                      </td>
                      <td className="py-2 px-3 text-gray-500 text-xs">
                        {new Date(video.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-2 px-3">
                        <div className="flex items-center gap-2">
                          <a
                            href={video.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-lg border border-gray-400 px-2.5 py-1 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                          >
                            View
                          </a>
                          <button
                            onClick={() => handleDelete(video.id)}
                            className="rounded-lg border border-red-600 px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
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
