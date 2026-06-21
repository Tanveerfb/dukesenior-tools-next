import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import {
  getPostBySlug,
  listenPost,
  listenComments,
  getUserPostReaction,
  getUserCommentReaction,
} from "@/lib/services/cms";
import { getSamplePostBySlug } from "@/lib/content/samplePosts";
import { useAuth } from "@/hooks/useAuth";
import type { CommentNode } from "./helpers";

export interface UsePostDataReturn {
  loading: boolean;
  post: any;
  comments: CommentNode[];
  userPostReaction: "like" | "dislike" | undefined;
  setUserPostReaction: React.Dispatch<
    React.SetStateAction<"like" | "dislike" | undefined>
  >;
  setPost: React.Dispatch<React.SetStateAction<any>>;
  isSample: boolean;
}

export function usePostData(): UsePostDataReturn {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [post, setPost] = useState<any>();
  const [comments, setComments] = useState<CommentNode[]>([]);
  const [userPostReaction, setUserPostReaction] = useState<
    "like" | "dislike" | undefined
  >();
  const scrolledToHashRef = useRef(false);

  const isSample = post?.id?.startsWith("sample-") ?? false;

  // Fetch post + subscribe to real-time updates
  useEffect(() => {
    let unsubPost: undefined | (() => void);
    let unsubComments: undefined | (() => void);

    async function init() {
      setLoading(true);
      try {
        const base = (await getPostBySlug(slug)) || getSamplePostBySlug(slug);
        if (!base) {
          setPost(undefined);
          return;
        }
        setPost(base);

        if (process.env.NODE_ENV !== "production") {
          try {
            console.debug(
              "[PostView] content preview:",
              (base.content || "").slice(0, 400),
            );
          } catch {}
        }

        const sample = base.id.startsWith("sample-");
        if (!sample) {
          if (user) {
            setUserPostReaction(await getUserPostReaction(base.id, user.uid));
          }
          unsubPost = listenPost(base.id, async (updated) => {
            if (updated)
              setPost((prev: any) => ({ ...(prev || {}), ...updated }));
          });
          unsubComments = listenComments(base.id, async (list) => {
            const roots = list.filter((c) => !c.parentId);
            const childrenMap: Record<string, CommentNode[]> = {};
            list
              .filter((c) => c.parentId)
              .forEach((c) => {
                (childrenMap[c.parentId!] ||= []).push({ ...c });
              });
            const enriched: CommentNode[] = await Promise.all(
              roots.map(async (r) => {
                let reaction: "like" | "dislike" | undefined;
                if (user) {
                  reaction = await getUserCommentReaction(r.id, user.uid);
                }
                return {
                  ...r,
                  userReaction: reaction,
                  replies: childrenMap[r.id] || [],
                };
              }),
            );
            setComments(enriched);
          });
        }
      } finally {
        setLoading(false);
      }
    }

    init();
    return () => {
      unsubPost?.();
      unsubComments?.();
    };
  }, [slug, user]);

  // Scroll-to-hash for deep-linked comments
  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash;
    if (!hash || scrolledToHashRef.current) return;

    const id = decodeURIComponent(hash.replace("#", ""));
    function tryScroll() {
      const el = document.getElementById(id);
      if (el) {
        try {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          (el as HTMLElement).focus?.();
        } catch {}
        scrolledToHashRef.current = true;
        return true;
      }
      return false;
    }

    if (tryScroll()) return;

    let attempts = 0;
    const iv = window.setInterval(() => {
      attempts++;
      if (tryScroll() || attempts >= 25) window.clearInterval(iv);
    }, 200);

    function onHash() {
      if (!scrolledToHashRef.current) tryScroll();
    }
    window.addEventListener("hashchange", onHash);
    return () => {
      window.clearInterval(iv);
      window.removeEventListener("hashchange", onHash);
    };
  }, [slug, comments, post]);

  return {
    loading,
    post,
    comments,
    userPostReaction,
    setUserPostReaction,
    setPost,
    isSample,
  };
}
