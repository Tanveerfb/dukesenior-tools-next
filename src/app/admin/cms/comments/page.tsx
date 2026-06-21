"use client";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { listRecentComments, getPost, deleteComment } from "@/lib/services/cms";

export default function CommentsFeed() {
  const { admin } = useAuth();
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<any[]>([]);
  async function refresh() {
    setLoading(true);
    try {
      const list = await listRecentComments(200);
      const enriched = await Promise.all(
        list.map(async (c) => {
          const post = await getPost(c.postId);
          return { ...c, postTitle: post?.title || "Unknown" };
        }),
      );
      setRows(enriched);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    refresh();
  }, []);
  if (!admin)
    return (
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="rounded border border-red-400/30 bg-red-50 dark:bg-red-900/30 p-3 text-sm text-red-700 dark:text-red-300">
          Admin only
        </div>
      </div>
    );
  return (
    <div className="max-w-7xl mx-auto px-4 py-4">
      <div className="flex items-center mb-3">
        <h1 className="text-2xl font-bold text-foreground mr-auto">
          Recent Comments
        </h1>
        <button
          onClick={refresh}
          className="px-2 py-1 text-xs rounded border border-gray-500 text-gray-500 hover:bg-gray-500/10"
        >
          Refresh
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-foreground border-collapse align-middle">
          <thead>
            <tr className="border-b border-border">
              <th className="px-3 py-2 text-left font-semibold">Post</th>
              <th className="px-3 py-2 text-left font-semibold">Excerpt</th>
              <th className="px-3 py-2 text-left font-semibold">Author</th>
              <th className="px-3 py-2 text-left font-semibold">Created</th>
              <th className="px-3 py-2 text-left font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr
                key={r.id}
                className="border-b border-border hover:bg-foreground/10"
              >
                <td className="px-3 py-2 truncate" style={{ maxWidth: 180 }}>
                  {r.postTitle}
                </td>
                <td
                  className="px-3 py-2 text-sm truncate"
                  style={{ maxWidth: 260 }}
                >
                  {r.content}
                </td>
                <td className="px-3 py-2 text-sm">{r.authorName}</td>
                <td className="px-3 py-2 text-sm">
                  {new Date(r.createdAt).toLocaleString()}
                </td>
                <td className="px-3 py-2">
                  <button
                    onClick={() => {
                      if (confirm("Delete comment?"))
                        deleteComment(r.id).then(refresh);
                    }}
                    className="px-2 py-1 text-xs rounded border border-red-600 text-red-600 hover:bg-red-600/10"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && !loading && (
              <tr>
                <td
                  colSpan={5}
                  className="px-3 py-2 text-foreground/60 text-sm italic"
                >
                  No comments yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {loading && (
        <div className="mt-3">
          <svg
            className="animate-spin h-6 w-6 text-primary-500"
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
      )}
    </div>
  );
}
