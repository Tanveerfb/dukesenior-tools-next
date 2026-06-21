"use client";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import InlineLink from "@/components/ui/InlineLink";
import { listPosts, deletePost, setPostPinned } from "@/lib/services/cms";

export default function AdminCMSPage() {
  const { admin } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState<string | undefined>();
  const [actionVariant, setActionVariant] = useState<
    "success" | "danger" | "info"
  >("info");
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function refresh() {
    setLoading(true);
    try {
      setPosts(await listPosts(200, true)); // Include unpublished for admin
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
          CMS Admin
        </h1>
        <InlineLink
          href="/admin/cms/analytics"
          className="px-3 py-1.5 rounded bg-blue-500 text-white hover:bg-blue-600 text-sm mr-2"
        >
          Analytics
        </InlineLink>
        <InlineLink
          href="/admin/cms/new"
          className="px-3 py-1.5 rounded bg-green-600 text-white hover:bg-green-700 text-sm"
        >
          New Post
        </InlineLink>
        <InlineLink
          href="/admin/cms/comments"
          className="px-3 py-1.5 rounded border border-blue-500 text-blue-500 hover:bg-blue-500/10 text-sm ml-2"
        >
          Comments
        </InlineLink>
      </div>

      {actionMsg && (
        <div
          className={cn(
            "rounded p-2 text-sm mt-2",
            actionVariant === "success" &&
              "border border-green-400/30 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300",
            actionVariant === "danger" &&
              "border border-red-400/30 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300",
            actionVariant === "info" &&
              "border border-blue-300 bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200",
          )}
        >
          {actionMsg}
        </div>
      )}
      <p className="text-foreground/60 text-sm">
        Listing latest posts. Click Edit to modify or use New Post.
      </p>
      <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center">
        Posts{" "}
        {loading && (
          <svg
            className="animate-spin h-4 w-4 text-primary-500 ml-2"
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
      </h3>
      {posts.length === 0 && (
        <div className="text-foreground/60 text-sm italic">No posts yet.</div>
      )}
      {posts.map((p) => (
        <div
          key={p.id}
          className="rounded-xl border border-border bg-card dark:bg-card-dark dark:border-border-dark shadow-sm mb-3"
        >
          <div className="flex items-start justify-between px-4 py-3 border-b border-border dark:border-border-dark">
            <div
              className="font-semibold text-foreground truncate"
              style={{ maxWidth: 560 }}
            >
              {p.title}
            </div>
            <div className="flex gap-2">
              {p.status === "draft" && (
                <span className="rounded-full text-xs font-medium px-2.5 py-0.5 bg-gray-500 text-white">
                  Draft
                </span>
              )}
              {p.status === "scheduled" && (
                <span className="rounded-full text-xs font-medium px-2.5 py-0.5 bg-primary-500 text-white">
                  Scheduled
                </span>
              )}
              {p.pinned && (
                <span className="rounded-full text-xs font-medium px-2.5 py-0.5 bg-yellow-500 text-black">
                  Pinned
                </span>
              )}
            </div>
          </div>
          <div className="px-4 py-3">
            <div style={{ minWidth: 0 }}>
              {(p.tags || []).map((t: string) => (
                <span
                  key={t}
                  className="rounded-full text-xs font-medium px-2.5 py-0.5 bg-blue-500 text-white mr-1"
                >
                  {t}
                </span>
              ))}
            </div>

            <div
              className="mt-3 flex items-center gap-2"
              ref={openDropdown === p.id ? dropdownRef : undefined}
            >
              <div className="relative">
                <button
                  onClick={() =>
                    setOpenDropdown(openDropdown === p.id ? null : p.id)
                  }
                  className="px-2 py-1 text-xs rounded border border-primary-500 text-primary-500 hover:bg-primary-500/10"
                >
                  Actions ▾
                </button>
                {openDropdown === p.id && (
                  <div className="absolute left-0 top-full mt-1 w-40 bg-card dark:bg-card-dark border border-border dark:border-border-dark rounded shadow-lg z-30">
                    <a
                      href={`/admin/cms/new?id=${p.id}`}
                      className="block px-3 py-2 text-sm text-foreground hover:bg-foreground/10"
                      onClick={() => setOpenDropdown(null)}
                    >
                      Edit
                    </a>
                    <button
                      className="block w-full text-left px-3 py-2 text-sm text-foreground hover:bg-foreground/10"
                      onClick={() => {
                        setPostPinned(p.id, !p.pinned).then(refresh);
                        setOpenDropdown(null);
                      }}
                    >
                      {p.pinned ? "Unpin" : "Pin"}
                    </button>
                    <button
                      className="block w-full text-left px-3 py-2 text-sm text-foreground hover:bg-foreground/10"
                      onClick={async () => {
                        setOpenDropdown(null);
                        if (!confirm("Delete post?")) return;
                        try {
                          setDeletingId(p.id);
                          await deletePost(p.id);
                          setActionVariant("success");
                          setActionMsg("Post deleted");
                          await refresh();
                        } catch (err: any) {
                          console.error("Delete failed", err);
                          setActionVariant("danger");
                          setActionMsg(
                            "Delete failed: " + (err?.message || "unknown"),
                          );
                        } finally {
                          setDeletingId(null);
                          setTimeout(() => setActionMsg(undefined), 4000);
                        }
                      }}
                    >
                      {deletingId === p.id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                )}
              </div>

              <span className="rounded-full text-xs font-medium px-2.5 py-0.5 bg-gray-500 text-white ml-2">
                {new Date(p.createdAt).toLocaleDateString()}
              </span>
              {p.views > 0 && (
                <span className="rounded-full text-xs font-medium px-2.5 py-0.5 bg-blue-500 text-white ml-2">
                  {p.views} views
                </span>
              )}
              {p.status === "scheduled" && p.scheduledFor && (
                <span className="rounded-full text-xs font-medium px-2.5 py-0.5 bg-primary-500 text-white ml-2">
                  Scheduled: {new Date(p.scheduledFor).toLocaleString()}
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
