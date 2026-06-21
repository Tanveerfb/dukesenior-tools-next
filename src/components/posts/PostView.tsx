"use client";

import React, { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { SpinnerIcon } from "./helpers";
import { usePostData } from "./usePostData";
import { useLightbox, buildGalleryFromPost } from "./useLightbox";
import { useMentions } from "./useMentions";
import PostArticle from "./PostArticle";
import PostSidebar from "./PostSidebar";
import PostReactions from "./PostReactions";
import CommentsSection from "./CommentsSection";
import Lightbox from "./Lightbox";
import styles from "./post.module.css";

export default function PostView() {
  const searchParams = useSearchParams?.();
  const debugRaw = !!(searchParams && searchParams.get("debugRaw") === "1");

  const {
    loading,
    post,
    comments,
    userPostReaction,
    setUserPostReaction,
    isSample,
  } = usePostData();

  const lightbox = useLightbox();
  const mentions = useMentions();

  // Build gallery when post loads
  useEffect(() => {
    if (!post) return;
    const items = buildGalleryFromPost(post);
    lightbox.setGallery(items);
  }, [post?.id, post?.content, post?.bannerUrl]);
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-10 text-center">
        <SpinnerIcon />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="text-foreground-secondary">Post not found.</div>
      </div>
    );
  }

  return (
    <>
      <div>
        <div className={cn("max-w-7xl mx-auto px-4 py-6", styles.postWrap)}>
          {/* Two-column layout */}
          <div className="flex flex-col lg:flex-row gap-8">
            <PostArticle
              post={post}
              debugRaw={debugRaw}
              openLightbox={lightbox.openLightbox}
            />
            <PostSidebar post={post} openLightbox={lightbox.openLightbox} />
          </div>

          {/* Post reactions */}
          {!isSample && (
            <PostReactions
              postId={post.id}
              likeCount={post.likeCount}
              dislikeCount={post.dislikeCount}
              userPostReaction={userPostReaction}
              setUserPostReaction={setUserPostReaction}
            />
          )}

          {/* Comments */}
          <CommentsSection
            postId={post.id}
            postSlug={post.slug}
            commentCount={post.commentCount}
            comments={comments}
            isSample={isSample}
            mentions={mentions}
          />
        </div>

        {/* Lightbox */}
        <Lightbox
          open={lightbox.lightboxOpen}
          setOpen={(v) => (v ? null : lightbox.closeLightbox())}
          lightboxSrc={lightbox.lightboxSrc}
          lightboxAlt={lightbox.lightboxAlt}
          gallery={lightbox.gallery}
          currentIndex={lightbox.currentIndex}
          gotoPrev={lightbox.gotoPrev}
          gotoNext={lightbox.gotoNext}
        />
      </div>
    </>
  );
}
