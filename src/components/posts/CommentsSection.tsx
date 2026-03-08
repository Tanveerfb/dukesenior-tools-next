"use client";

import React, { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { addComment } from "@/lib/services/cms";
import type { CommentNode } from "./helpers";
import { notifyMentions } from "./helpers";
import { extractMentions, type UseMentionsReturn } from "./useMentions";
import CommentItem from "./CommentItem";

interface CommentsSectionProps {
  postId: string;
  postSlug: string;
  commentCount: number;
  comments: CommentNode[];
  isSample: boolean;
  mentions: UseMentionsReturn;
}

export default function CommentsSection({
  postId,
  postSlug,
  commentCount,
  comments,
  isSample,
  mentions,
}: CommentsSectionProps) {
  const { user } = useAuth();
  const [newComment, setNewComment] = useState("");
  const [posting, setPosting] = useState(false);
  const [commentError, setCommentError] = useState<string>();
  const newCommentRef = useRef<HTMLTextAreaElement | null>(null);

  const {
    suggestions,
    showSuggestions,
    suggestionOwner,
    activeSuggestion,
    mentionPartial,
    activeTextareaRef,
    handleMentionDetection,
    applySuggestion,
    handleSuggestionKeyDown,
    clearMentions,
    fetchSuggestions,
    setSuggestions,
    setShowSuggestions,
    setSuggestionOwner,
    setActiveSuggestion,
  } = mentions;

  async function submit(parentId?: string) {
    if (!user || !newComment.trim()) return;
    setPosting(true);
    setCommentError(undefined);
    try {
      const content = newComment.trim();
      const mentionsList = extractMentions(content);
      const commentId = await addComment(user.uid, user.email || "unknown", {
        postId,
        parentId,
        content,
        mentions: mentionsList,
      });
      setNewComment("");
      clearMentions();
      try {
        await notifyMentions(content, postId, commentId, postSlug);
      } catch (e) {
        console.warn("mention notify failed", e);
      }
    } catch (err: any) {
      console.error("Add comment failed", err);
      setCommentError("Failed to post comment: " + (err?.message || "unknown"));
    } finally {
      setPosting(false);
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const val = e.target.value;
    setNewComment(val);
    const caret = e.target.selectionStart || val.length;
    handleMentionDetection(val, caret, "main");
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    const result = handleSuggestionKeyDown(e.key);
    if (result.handled) {
      e.preventDefault();
      if (result.selected) {
        applyMainSuggestion(result.selected);
      }
    }
  }

  function applyMainSuggestion(username: string) {
    const ta = activeTextareaRef.current || newCommentRef.current;
    const caret = ta?.selectionStart || newComment.length;
    const { value, caret: newCaret } = applySuggestion(
      username,
      newComment,
      caret,
    );
    setNewComment(value);
    requestAnimationFrame(() => {
      try {
        if (ta) {
          ta.focus();
          ta.setSelectionRange(newCaret, newCaret);
        }
      } catch {}
    });
  }

  return (
    <section className="mb-10">
      <h4 className="text-foreground text-xl font-semibold mb-3">
        Comments ({commentCount})
      </h4>

      {isSample ? (
        <div className="text-foreground-secondary text-sm mb-3">
          Comments disabled for sample post.
        </div>
      ) : user ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
          className="mb-4"
        >
          <div className="mb-2 relative">
            <textarea
              rows={3}
              value={newComment}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder="Write a comment..."
              ref={(el) => {
                newCommentRef.current = el;
              }}
              className="w-full rounded-lg border border-border dark:border-border-dark bg-card dark:bg-card-dark text-foreground px-3 py-2 outline-none focus:ring-2 focus:ring-primary-500 resize-y"
            />
            {showSuggestions &&
              suggestions.length > 0 &&
              suggestionOwner === "main" && (
                <div className="absolute left-2 right-2 top-full z-[2000] bg-card dark:bg-card-dark border border-border dark:border-border-dark rounded-md mt-1.5 shadow-lg">
                  {suggestions.map((s, idx) => (
                    <div
                      key={s.username}
                      onMouseDown={(ev) => {
                        ev.preventDefault();
                        applyMainSuggestion(s.username);
                      }}
                      className={cn(
                        "px-3 py-1.5 cursor-pointer text-foreground",
                        idx === activeSuggestion &&
                          "bg-gray-100 dark:bg-gray-700",
                      )}
                    >
                      @{s.username}
                    </div>
                  ))}
                </div>
              )}
          </div>
          <div className="text-sm text-foreground-secondary mb-2">
            Mention partial: <strong>{mentionPartial || "-"}</strong> &bull;
            Suggestions: {suggestions.length}
          </div>
          {commentError && (
            <div className="text-red-500 text-sm mb-2">{commentError}</div>
          )}
          <button
            className="rounded-lg bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white px-3 py-1.5 text-sm font-medium transition-colors"
            disabled={!newComment.trim() || posting}
            type="submit"
          >
            {posting ? "Posting..." : "Post Comment"}
          </button>
        </form>
      ) : (
        <div className="text-foreground-secondary text-sm mb-3">
          Login to comment.
        </div>
      )}

      {!isSample && (
        <div className="comments-tree">
          {comments.map((c) => (
            <CommentItem
              key={c.id}
              node={c}
              postId={postId}
              mentionProps={{
                suggestions,
                showSuggestions,
                suggestionOwner,
                activeSuggestion,
                applySuggestionToTextarea: applyMainSuggestion,
                fetchSuggestions,
                setActiveSuggestion,
                setShowSuggestions,
                setSuggestionOwner,
                setSuggestions,
                activeTextareaRef,
                postSlug,
              }}
            />
          ))}
          {comments.length === 0 && (
            <div className="text-foreground-secondary text-sm italic">
              No comments yet.
            </div>
          )}
        </div>
      )}
    </section>
  );
}
