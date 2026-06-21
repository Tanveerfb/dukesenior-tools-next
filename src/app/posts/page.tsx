"use client";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import InlineLink from "@/components/ui/InlineLink";
import { listPosts } from "@/lib/services/cms";
import { samplePosts } from "@/lib/content/samplePosts";
import { cn } from "@/lib/utils";

function excerpt(text = "", length = 140) {
  if (!text) return "";
  return text.length > length ? text.slice(0, length).trim() + "…" : text;
}

function Spinner() {
  return (
    <svg
      className="animate-spin h-8 w-8 text-primary-500"
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
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      />
    </svg>
  );
}

export default function PostsIndex() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const dbPosts = await listPosts(200);
        setPosts(dbPosts.length ? dbPosts : samplePosts);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return posts;
    return posts.filter(
      (p) =>
        (p.title || "").toLowerCase().includes(term) ||
        (p.excerpt || "").toLowerCase().includes(term) ||
        (p.tags || []).join(" ").toLowerCase().includes(term),
    );
  }, [q, posts]);

  // featured = pinned first
  const featured = filtered.filter((p) => p.pinned).slice(0, 3);
  const list = filtered.filter((p) => !p.pinned);

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
        <div className="md:flex-1">
          <h1 className="text-foreground text-3xl font-bold mb-0">
            Latest posts
          </h1>
          <p className="text-foreground-secondary mb-0">
            News, updates and writeups from the community.
          </p>
        </div>
        <div className="md:w-1/3">
          <div className="flex">
            <input
              className="flex-1 rounded-l-lg border border-border dark:border-border-dark bg-card dark:bg-card-dark text-foreground px-3 py-2 outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Search posts, tags, authors..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <button
              className="rounded-r-lg border border-l-0 border-border dark:border-border-dark bg-card dark:bg-card-dark text-foreground-secondary px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              onClick={() => setQ("")}
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center py-10">
          <Spinner />
        </div>
      )}

      {featured.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {featured.map((p) => (
            <div
              key={p.id}
              className="rounded-xl border border-border dark:border-border-dark bg-card dark:bg-card-dark shadow-sm overflow-hidden flex flex-col h-full"
            >
              {p.bannerUrl && (
                <div className="relative h-[180px] overflow-hidden">
                  <Image
                    src={p.bannerUrl}
                    alt={p.title}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              )}
              <div className="flex flex-col flex-1 p-4">
                <div className="flex items-start mb-2 justify-between">
                  <div className="flex-1 min-w-0">
                    <h5 className="text-foreground font-semibold truncate mb-0">
                      {p.title}
                    </h5>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 flex-wrap">
                    {p.pinned && (
                      <span className="hidden sm:inline rounded-full bg-yellow-400 text-yellow-900 px-2 py-0.5 text-xs font-medium">
                        Pinned
                      </span>
                    )}
                    {p.id?.startsWith?.("sample-") && (
                      <span className="hidden sm:inline rounded-full bg-gray-500 text-white px-2 py-0.5 text-xs font-medium">
                        Sample
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-foreground-secondary text-sm mb-2">
                  {new Date(p.createdAt).toLocaleDateString()} •{" "}
                  {p.author || "DukeSenior"}
                </div>
                <p className="text-foreground-secondary mb-3 truncate">
                  {excerpt(p.excerpt || p.content || "", 160)}
                </p>
                <div className="mt-auto">
                  <InlineLink
                    href={`/posts/${p.slug}`}
                    aria-label={`Read ${p.title}`}
                    className="block w-full text-center rounded-lg bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 font-medium transition-colors"
                  >
                    Read
                  </InlineLink>
                  <div className="mt-2 text-sm text-foreground-secondary text-right">
                    {p.readTime || ""}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {list.map((p) => (
          <div
            key={p.id}
            className="rounded-xl border border-border dark:border-border-dark bg-card dark:bg-card-dark shadow-sm h-full hover:shadow-md transition-shadow"
          >
            <div className="flex items-stretch">
              <div className="hidden sm:block w-5/12 relative min-h-[120px] overflow-hidden">
                {p.bannerUrl ? (
                  <Image
                    src={p.bannerUrl}
                    alt={p.title}
                    unoptimized
                    className="object-cover object-center"
                    fill
                  />
                ) : (
                  <div className="h-[120px] bg-gray-100 dark:bg-gray-800" />
                )}
              </div>
              <div className="flex-1 p-4 flex flex-col">
                <div className="flex items-start mb-1">
                  <h6 className="text-foreground text-base font-semibold mb-0">
                    {p.title}
                  </h6>
                  {p.pinned && (
                    <span className="ml-auto hidden sm:inline rounded-full bg-yellow-400 text-yellow-900 px-2 py-0.5 text-xs font-medium">
                      Pinned
                    </span>
                  )}
                </div>
                <div className="text-foreground-secondary text-sm mb-2">
                  {new Date(p.createdAt).toLocaleDateString()}
                </div>
                <p className="mb-3 text-sm text-foreground-secondary min-h-[40px]">
                  {excerpt(p.excerpt || p.content || "", 120)}
                </p>
                <div className="mt-auto">
                  <div className="flex flex-wrap mb-2">
                    {p.tags?.slice(0, 3).map((t: string) => (
                      <span
                        key={t}
                        className="rounded-full bg-cyan-500 text-white px-2 py-0.5 text-xs font-medium mr-2 mb-2"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                  <InlineLink
                    href={`/posts/${p.slug}`}
                    aria-label={`Read ${p.title}`}
                    className="block w-full text-center rounded-lg border border-primary-500 text-primary-500 hover:bg-primary-500 hover:text-white px-3 py-1.5 text-sm font-medium transition-colors"
                  >
                    Read
                  </InlineLink>
                </div>
              </div>
            </div>
          </div>
        ))}

        {!loading && posts.length === 0 && (
          <div>
            <div className="text-foreground-secondary italic text-sm">
              No posts yet.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
