"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { listPosts } from "@/lib/services/cms";
import { samplePosts } from "@/lib/content/samplePosts";
import type { CMSPost } from "@/types/cms";
import { FiInbox } from "react-icons/fi";
import { cn } from "@/lib/utils";

interface FeaturedPostsProps {
  maxFeatured?: number;
  showSampleFallback?: boolean;
}

function PostCardSkeleton() {
  return (
    <div className="rounded-xl border border-border dark:border-border-dark bg-card dark:bg-card-dark overflow-hidden h-full">
      <div className="h-48 bg-surface-200 dark:bg-surface-800 animate-shimmer" />
      <div className="p-4 space-y-3">
        <div className="h-6 w-4/5 bg-surface-200 dark:bg-surface-800 rounded animate-shimmer" />
        <div className="h-4 w-2/5 bg-surface-200 dark:bg-surface-800 rounded animate-shimmer" />
        <div className="flex gap-2">
          <div className="h-5 w-14 bg-surface-200 dark:bg-surface-800 rounded animate-shimmer" />
          <div className="h-5 w-14 bg-surface-200 dark:bg-surface-800 rounded animate-shimmer" />
        </div>
        <div className="h-9 w-full bg-surface-200 dark:bg-surface-800 rounded animate-shimmer" />
      </div>
    </div>
  );
}

function PostCard({ post, index }: { post: CMSPost; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      whileHover={{ y: -6 }}
      className="rounded-xl border border-border dark:border-border-dark bg-card dark:bg-card-dark overflow-hidden h-full flex flex-col hover:shadow-soft-lg transition-all"
    >
      {post.bannerUrl && (
        <img
          src={post.bannerUrl}
          alt={post.title}
          className="w-full h-48 object-cover"
        />
      )}
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex gap-1.5 items-center mb-2">
          {post.pinned && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-warning/15 text-warning font-semibold">
              Pinned
            </span>
          )}
          {post.id?.startsWith?.("sample-") && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary/15 text-secondary font-semibold">
              Sample
            </span>
          )}
        </div>

        <h3 className="text-base font-semibold text-foreground dark:text-foreground-dark mb-1 line-clamp-2 min-h-[3rem]">
          {post.title}
        </h3>

        <p className="text-xs text-foreground-muted dark:text-foreground-dark-muted mb-3">
          {new Date(post.createdAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}{" "}
          · By {post.authorName}
        </p>

        <div className="flex flex-wrap gap-1.5 mb-3">
          {post.tags?.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-[10px] px-2 py-0.5 rounded-full border border-border dark:border-border-dark text-foreground-muted dark:text-foreground-dark-muted"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-auto">
          <Link
            href={`/posts/${post.slug}`}
            className="block w-full text-center px-4 py-2 text-sm font-medium bg-primary hover:bg-primary-600 text-white rounded-lg transition-colors no-underline"
          >
            Read More
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

function EmptyState() {
  return (
    <div className="py-12 text-center flex flex-col items-center gap-3">
      <FiInbox
        className="text-foreground-muted/50 dark:text-foreground-dark-muted/50"
        size={56}
      />
      <p className="text-lg font-medium text-foreground-muted dark:text-foreground-dark-muted">
        No featured posts yet
      </p>
      <p className="text-sm text-foreground-muted dark:text-foreground-dark-muted">
        Check back soon for new community updates and announcements
      </p>
    </div>
  );
}

export default function FeaturedPosts({
  maxFeatured = 3,
  showSampleFallback = false,
}: FeaturedPostsProps) {
  const [posts, setPosts] = useState<CMSPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const dbPosts = await listPosts(12);
        if (!dbPosts || dbPosts.length === 0) {
          setPosts(showSampleFallback ? samplePosts.slice(0, maxFeatured) : []);
        } else {
          const pinnedPosts = dbPosts
            .filter((p) => p.pinned)
            .slice(0, maxFeatured);
          setPosts(pinnedPosts);
        }
      } catch (error) {
        console.error("Error fetching posts:", error);
        setPosts(showSampleFallback ? samplePosts.slice(0, maxFeatured) : []);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [maxFeatured, showSampleFallback]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {[...Array(maxFeatured)].map((_, i) => (
          <PostCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {posts.map((post, index) => (
        <PostCard key={post.id} post={post} index={index} />
      ))}
    </div>
  );
}
