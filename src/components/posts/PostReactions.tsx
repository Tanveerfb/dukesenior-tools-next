"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { reactToPostForUser } from "@/lib/services/cms";

interface PostReactionsProps {
  postId: string;
  likeCount: number;
  dislikeCount: number;
  userPostReaction: "like" | "dislike" | undefined;
  setUserPostReaction: (v: "like" | "dislike") => void;
}

export default function PostReactions({
  postId,
  likeCount,
  dislikeCount,
  userPostReaction,
  setUserPostReaction,
}: PostReactionsProps) {
  const { user } = useAuth();

  return (
    <div className="flex items-center gap-2 mb-4">
      <button
        className={cn(
          "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
          userPostReaction === "like"
            ? "bg-green-500 text-white"
            : "border border-green-500 text-green-500 hover:bg-green-500 hover:text-white",
        )}
        disabled={!user}
        onClick={async () => {
          if (!user) return;
          await reactToPostForUser(postId, user.uid, "like");
          setUserPostReaction("like");
        }}
      >
        👍 {likeCount}
      </button>
      <button
        className={cn(
          "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
          userPostReaction === "dislike"
            ? "bg-red-500 text-white"
            : "border border-red-500 text-red-500 hover:bg-red-500 hover:text-white",
        )}
        disabled={!user}
        onClick={async () => {
          if (!user) return;
          await reactToPostForUser(postId, user.uid, "dislike");
          setUserPostReaction("dislike");
        }}
      >
        👎 {dislikeCount}
      </button>
    </div>
  );
}
