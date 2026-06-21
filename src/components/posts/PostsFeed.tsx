"use client";
import { useEffect, useMemo, useState } from "react";
import InlineLink from "@/components/ui/InlineLink";
import Image from "next/image";
import { motion } from "framer-motion";
import EmptyState from "@/components/ui/EmptyState";
import { FaInbox } from "react-icons/fa";
import { listPosts } from "@/lib/services/cms";
import { samplePosts } from "@/lib/content/samplePosts";

interface Props {
  maxFeatured?: number;
  maxLatest?: number;
  fetchCount?: number;
  showSampleFallback?: boolean; // when true, falls back to sample posts if none returned
}

function PostCard({ post, index }: { post: any; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      whileHover={{ y: -4 }}
    >
      <div className="h-full rounded-xl border border-border bg-card dark:bg-card-dark dark:border-border-dark shadow-sm overflow-hidden flex flex-col">
        {post.bannerUrl && (
          <div className="relative h-40 overflow-hidden">
            <Image
              src={post.bannerUrl}
              alt={post.title}
              fill
              style={{ objectFit: "cover" }}
              unoptimized
            />
          </div>
        )}
        <div className="p-4 flex flex-col flex-1">
          <div className="flex items-start mb-1 justify-between">
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold mb-0 truncate">
                {post.title}
              </h4>
            </div>
            <div className="hidden sm:flex items-center gap-2 ml-2">
              {post.pinned && (
                <span className="rounded-full text-xs font-medium px-2.5 py-0.5 bg-yellow-200 text-yellow-800">
                  Pinned
                </span>
              )}
              {post.id?.startsWith?.("sample-") && (
                <span className="rounded-full text-xs font-medium px-2.5 py-0.5 bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-200">
                  Sample
                </span>
              )}
            </div>
          </div>
          <div className="mb-2 text-sm text-foreground-secondary">
            {new Date(post.createdAt).toLocaleDateString()}
          </div>
          <div className="mb-3 min-h-[40px]">
            {post.tags?.slice(0, 3).map((t: string) => (
              <span
                key={t}
                className="inline-block rounded-full text-xs font-medium px-2.5 py-0.5 bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-200 mr-1"
              >
                {t}
              </span>
            ))}
          </div>
          <InlineLink
            href={`/posts/${post.slug}`}
            className="mt-auto inline-block text-center text-sm px-3 py-1.5 rounded-lg bg-primary-500 hover:bg-primary-600 text-white transition-colors"
            aria-label={`Read ${post.title}`}
          >
            Read
          </InlineLink>
        </div>
      </div>
    </motion.div>
  );
}

export default function PostsFeed({
  maxFeatured = 3,
  maxLatest = 3,
  fetchCount = 12,
  showSampleFallback = false,
}: Props) {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const dbPosts = await listPosts(fetchCount);
        if (!dbPosts || dbPosts.length === 0) {
          setPosts(showSampleFallback ? samplePosts.slice(0, fetchCount) : []);
        } else setPosts(dbPosts);
      } finally {
        setLoading(false);
      }
    })();
  }, [fetchCount, showSampleFallback]);

  const featured = useMemo(
    () => posts.filter((p) => p.pinned).slice(0, maxFeatured),
    [posts, maxFeatured],
  );
  const latest = useMemo(
    () => posts.filter((p) => !p.pinned).slice(0, maxLatest),
    [posts, maxLatest],
  );

  return (
    <div>
      {loading && (
        <div className="text-center py-10">
          <svg
            className="animate-spin h-6 w-6 mx-auto text-primary-500"
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
          <p className="text-foreground-secondary mt-3">Loading posts...</p>
        </div>
      )}

      {featured.length > 0 && !loading && (
        <section className="mb-4">
          <h3 className="text-sm font-semibold mb-3">Featured</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {featured.map((p, idx) => (
              <PostCard key={p.id} post={p} index={idx} />
            ))}
          </div>
        </section>
      )}

      <section>
        {!loading && posts.length === 0 ? (
          <EmptyState
            icon={<FaInbox />}
            title="No posts available"
            description="Check back soon for new community updates, announcements, and guides."
          />
        ) : (
          !loading && (
            <>
              <h3 className="text-sm font-semibold mb-3">Latest</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {latest.map((p, idx) => (
                  <PostCard key={p.id} post={p} index={idx + featured.length} />
                ))}
              </div>
            </>
          )
        )}
      </section>
    </div>
  );
}
